const InvariantError = require('../../exceptions/InvariantError');
const {
  playlistPostPayloadSchema, playlistPostSongPayloadSchema, playlistDeleteSongPayloadSchema
} = require('./schema');

const PlaylistValidator = {
  validatePostPlaylist: (payload) => {
    const validateResult = playlistPostPayloadSchema.validate(payload);
    if (validateResult.error) {
      throw new InvariantError(validateResult.error.message);
    }
  },
  validateSongUpload: (payload) => {
    const validateResult = playlistPostSongPayloadSchema.validate(payload);
    if (validateResult.error) {
      throw new InvariantError(validateResult.error.message);
    }
  },
  validateSongDelete: (payload) => {
    const validateResult = playlistDeleteSongPayloadSchema.validate(payload);
    if (validateResult.error) {
      throw new InvariantError(validateResult.error.message);
    }
  },
};

module.exports = PlaylistValidator;