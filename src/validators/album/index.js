const InvariantError = require('../../exceptions/InvariantError');
const { AlbumPayloadSchema, AlbumCoverPayloadSchema } = require('./schema');

const albumValidator = {
  validateAlbumPayload: (payload) => {
    const validateResult = AlbumPayloadSchema.validate(payload);
    if (validateResult.error) {
      throw new InvariantError(validateResult.error.message);
    }
  },
  validateAlbumCoverPayload: (headers) => {
    const validateResult = AlbumCoverPayloadSchema.validate(headers);
    if (validateResult.error) {
      throw new InvariantError(validateResult.error.message);
    }
  },
};

module.exports = albumValidator;
