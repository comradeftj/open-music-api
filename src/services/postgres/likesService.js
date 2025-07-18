const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { nanoid } = require('nanoid');

class LikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async verifyAlbum(albumId) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [albumId],
    };
    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Album not found');
    }
  }

  async verifyLiked(userId, albumId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE userid = $1 AND albumId = $2',
      values: [userId, albumId],
    };
    const { rowCount } = await this._pool.query(query);

    if (rowCount > 0) {
      throw new InvariantError('You have already liked this album');
    }
  }

  async addLike(userId, albumId) {
    const id = `like-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Failed liking the album');
    }
    await this._cacheService.delete(`likesCount${albumId}`);
  }

  async getLikes(albumId) {
    try {
      const result = await this._cacheService.get(`likesCount${albumId}`);
      return {
        count: JSON.parse(result),
        source: 'cache',
      };
    } catch {
      const query = {
        text: 'SELECT COUNT(*) AS likes FROM user_album_likes WHERE albumId = $1',
        values: [albumId],
      };
      const result = await this._pool.query(query);
      await this._cacheService.set(`likesCount${albumId}`, JSON.stringify(result.rows[0]), 1800);

      return {
        count: result.rows[0],
        source: 'database',
      };
    }
  }

  async removeLike(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE userid = $1 AND albumid = $2 RETURNING id',
      values: [userId, albumId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Like not found, unable to dislike');
    }
    await this._cacheService.delete(`likesCount${albumId}`);
  }
}

module.exports = LikesService;