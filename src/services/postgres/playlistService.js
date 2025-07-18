/* eslint-disable no-useless-catch */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistService {
  constructor(songService, collabService) {
    this._pool = new Pool();
    this._songService = songService;
    this._collabService = collabService;
  }

  async verifyOwner(playlistId, owner) {
    const query = {
      text: 'SELECT * FROM playlist WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist not found');
    }

    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('You are not authorized to access this playlist');
    }
  }

  async verifyAccesss(playlistId, userId) {
    try {
      await this.verifyOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collabService.verifyCollaboration(playlistId, userId);
      } catch (error) {
        throw error;
      }
    }
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Failed adding playlist');
    }
    return result.rows[0].id;
  }

  async getAllPlaylist(userId) {
    const query = {
      text: `SELECT playlist.id, playlist.name, users.username 
            FROM playlist
            LEFT JOIN users ON playlist.owner = users.id
            LEFT JOIN collaborations ON playlist.id = collaborations.playlist_id
            WHERE playlist.owner = $1 OR collaborations.user_id = $1`,
      values: [userId],
    };
    const result = await this._pool.query(query);

    return result.rows;
  }

  async removePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlist WHERE id = $1 RETURNING id',
      values: [id],
    };
    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Playlist not found');
    }
  }

  async addSong(playlistId, songId, credentialId) {
    await this._songService.getSongById(songId);
    const id = `ps-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Failed adding song to playlist');
    }

    const activityId = `act-${nanoid(16)}`;
    const time = new Date().toISOString();
    const action = 'add';
    const addActivity = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [activityId, playlistId, songId, credentialId, action, time],
    };
    const activity = await this._pool.query(addActivity);
    if (!activity.rows.length) {
      throw new InvariantError('Failed adding add activity');
    }
  }

  async getSongsOfPlaylistId(playlistId) {
    const getPlaylist = {
      text: `SELECT playlist.id, playlist.name, users.username 
            FROM playlist
            LEFT JOIN users ON playlist.owner = users.id
            WHERE playlist.id = $1`,
      values: [playlistId],
    };
    const playlist = await this._pool.query(getPlaylist);
    if (!playlist.rows.length) {
      throw new NotFoundError('Playlist not found');
    }

    const getSongs = {
      text: `SELECT songs.id, songs.title, songs.performer
            FROM songs
            LEFT JOIN playlist_songs ON songs.id = playlist_songs.song_id
            WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    };
    const songs = await this._pool.query(getSongs);

    return {
      id: playlist.rows[0].id,
      name: playlist.rows[0].name,
      username: playlist.rows[0].username,
      songs: songs.rows,
    };
  }

  async removeSongsOfPlaylist(playlistId, songId, credentialId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Unable to delete, song/playlist not found');
    }

    const activityId = `act-${nanoid(16)}`;
    const time = new Date().toISOString();
    const action = 'delete';
    const addActivity = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [activityId, playlistId, songId, credentialId, action, time],
    };
    const activity = await this._pool.query(addActivity);
    if (!activity.rows.length) {
      throw new InvariantError('Failed adding delete activity');
    }
  }

  async getActivities(playlistId) {
    const query = {
      text: `SELECT users.username, songs.title, p.action, p.time
      FROM playlist_song_activities p
      LEFT JOIN users ON p.user_id = users.id
      LEFT JOIN songs ON p.song_id = songs.id
      WHERE p.playlist_id = $1`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = PlaylistService;