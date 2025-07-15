/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.sql('INSERT INTO albums(id, name, year) VALUES(\'miscellaneous\', \'miscellaneous\', 2025)');
  pgm.sql('UPDATE songs SET "albumId" = \'miscellaneous\' WHERE "albumId" = NULL');
  pgm.addConstraint('songs', 'fk_songs.albumId_albums.id', 'FOREIGN KEY("albumId") REFERENCES albums(id) ON DELETE CASCADE');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropConstraint('songs', 'fk_songs.albumId_albums.id');
  pgm.sql('UPDATE songs SET "albumId" = NULL WHERE "albumId" = \'miscellaneous\'');
  pgm.sql('DELETE FROM albums WHERE id = \'miscellaneous\'');
};
