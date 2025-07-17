const InvariantError = require('../../exceptions/InvariantError');
const { exportPayloadSchema } = require('./schema');

const ExportValidator = {
  validatePayload: (payload) => {
    const validateResult = exportPayloadSchema.validate(payload);
    if (validateResult.error) {
      throw new InvariantError(validateResult.error.message);
    }
  }
};

module.exports = ExportValidator;