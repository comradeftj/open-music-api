const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const InvariantError = require('../../exceptions/InvariantError');
const AuthenticationError = require('../../exceptions/AuthenticationError');
const NotFoundError = require('../../exceptions/NotFoundError');

class usersService {
  constructor() {
    this._pool = new Pool();
  }

  async verifyUserId(userId) {
    const query = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [userId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('User not found');
    }
  }

  async verifyUserCredentials(username, password) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new AuthenticationError('Wrong credentials given. Failed to Login');
    }
    const { id, password: hashedPw } = result.rows[0];
    const match = await bcrypt.compare(password, hashedPw);
    if (!match) {
      throw new AuthenticationError('Wrong credentials goven. Failed to Login');
    }
    return id;
  }

  async verifyUsername(username) {
    const query = {
      text: 'SELECT * FROM users WHERE username = $1',
      values: [username],
    };
    const result = await this._pool.query(query);

    if (result.rows.length > 0) {
      throw new InvariantError('Username already used!');
    }
  }

  async addUser({ username, password, fullname }) {
    await this.verifyUsername(username);

    const id = `user-${nanoid(16)}`;
    const hashedPw = await bcrypt.hash(password, 10);
    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPw, fullname],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Failed adding new user');
    }
    return result.rows[0].id;
  }
}

module.exports = usersService;