class ExportsHandler {
  constructor(playlistService, producerService, validator) {
    this._playlistService = playlistService;
    this._producerService = producerService;
    this._validator = validator;

    this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this);
  }

  async postExportPlaylistHandler(request, h) {
    this._validator.validatePayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { playlistId } = request.params;
    const { targetEmail } = request.payload;

    await this._playlistService.verifyOwner(playlistId, credentialId);

    const message = {
      playlistId,
      targetEmail: targetEmail,
    };
    await this._producerService.sendMessage('playlist:export', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;