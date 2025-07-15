const InvariantError = require('../../exceptions/InvariantError');
const {
  postAuthPayloadSchema,
  putAuthPayloadSchema,
  deleteAuthPayloadSchema,
} = require('./schema');

const AuthenticationValidator = {
  validatePostPayload: (payload) => {
    const validateResult = postAuthPayloadSchema.validate(payload);
    if (validateResult.error) {
      throw new InvariantError(validateResult.error.message);
    }
  },
  validatePutPayload: (payload) => {
    const validateResult = putAuthPayloadSchema.validate(payload);
    if (validateResult.error) {
      throw new InvariantError(validateResult.error.message);
    }
  },
  validateDeletePayload: (payload) => {
    const validateResult = deleteAuthPayloadSchema.validate(payload);
    if (validateResult.error) {
      throw new InvariantError(validateResult.error.message);
    }
  }
};

module.exports = AuthenticationValidator;