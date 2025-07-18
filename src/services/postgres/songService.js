const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class songService {
  constructor() {
    this.pool = new Pool();
  }

  async addSong({ title, year, performer, genre, duration, albumId }) {
    const id = `song-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId],
    };
    const result = await this.pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Failed adding new song');
    }
    return result.rows[0].id;
  }

  async getAllSongs(title, performer) {
    if (title === undefined && performer) {
      const query = {
        text: 'SELECT id, title, performer FROM songs WHERE performer ILIKE $1',
        values: [`%${performer}%`],
      };
      const result = await this.pool.query(query);
      return result.rows;
    }
    if (performer === undefined && title) {
      const query = {
        text: 'SELECT id, title, performer FROM songs WHERE title ILIKE $1',
        values: [`%${title}%`],
      };
      const result = await this.pool.query(query);
      return result.rows;
    }
    if (title && performer) {
      const query = {
        text: 'SELECT id, title, performer FROM songs WHERE title ILIKE $1 AND performer ILIKE $2',
        values: [`%${title}%`, `%${performer}%`],
      };
      const result = await this.pool.query(query);
      return result.rows;
    }
    const result = await this.pool.query('SELECT id, title, performer FROM songs');
    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song not found');
    }
    return result.rows[0];
  }

  async editSongById(id, { title, year, performer, genre, duration, albumId }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, "albumId" = $6 WHERE id = $7 RETURNING id',
      values: [title, year, performer, genre, duration, albumId, id],
    };
    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song not found, unable to edit');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song not found, unable to delete');
    }
  }
}

module.exports = songService;