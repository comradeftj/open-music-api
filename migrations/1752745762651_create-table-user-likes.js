/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable('user_album_likes', {
    id: {
      type: 'VARCHAR(21)', // like-xxxxxxx
      primaryKey: true,
    },
    userid: {
      type: 'VARCHAR(21)',
      notNull: true,
    },
    albumid: {
      type: 'VARCHAR(22)',
      notNull: true,
    },
  });
  pgm.addConstraint('user_album_likes', 'fk_user_album_likes.userid_users.id', 'FOREIGN KEY(userid) REFERENCES users(id) ON DELETE CASCADE');
  pgm.addConstraint('user_album_likes', 'fk_user_album_likes.albumid_albums.id', 'FOREIGN KEY(albumid) REFERENCES albums(id) ON DELETE CASCADE');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable('user_album_likes');
};
