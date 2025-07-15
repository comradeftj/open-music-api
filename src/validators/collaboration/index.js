const InvariantError = require('../../exceptions/InvariantError');
const { collabPayloadSchema } = require('./schema');

const collabValidator = {
  validatePayload: (payload) => {
    const validateResult = collabPayloadSchema.validate(payload);
    if (validateResult.error) {
      throw new InvariantError(validateResult.error.message);
    }
  }
};

module.exports = collabValidator;