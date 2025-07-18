const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class musicService {
  constructor(uploadService) {
    this.pool = new Pool();
    this._uploadService = uploadService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };
    const result = await this.pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Failed adding new album');
    }
    return result.rows[0].id;
  }

  async getAlbumSongs(albumId) {
    const querySong = {
      text: 'SELECT id, title, performer FROM songs WHERE "albumId" = $1',
      values: [albumId],
    };
    const songs = await this.pool.query(querySong);
    return songs.rows;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT id, name, year, cover AS "coverUrl" FROM albums WHERE id = $1',
      values: [id],
    };
    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album not found');
    }

    const songs = await this.getAlbumSongs(id);
    result.rows[0]['songs'] = songs;
    return result.rows[0];
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };
    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album not found, unable to edit');
    }
  }

  async editAlbumCoverById(id, file, meta) {
    const fileName = await this._uploadService.addCover(file, meta);
    const path = `http://${process.env.HOST}:${process.env.PORT}/albums/${id}/covers/${fileName}`;

    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
      values: [path, id],
    };
    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album not found, unable to edit');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this.pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Album not found, unable to delete');
    }
  }
}

module.exports = musicService;