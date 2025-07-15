class CollaborationsHandler {
  constructor(collaborationsService, usersService, playlistService, validator) {
    this._collaborationService = collaborationsService;
    this._playlistService = playlistService;
    this._usersService = usersService;
    this._validator = validator;

    this.postCollabHandler = this.postCollabHandler.bind(this);
    this.deleteCollabHandler = this.deleteCollabHandler.bind(this);
  }

  async postCollabHandler(request, h) {
    this._validator.validatePayload(request.payload);
    const { playlistId, userId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._usersService.verifyUserId(userId);
    await this._playlistService.verifyOwner(playlistId, credentialId);
    const collaborationId = await this._collaborationService.addCollaborator(playlistId, userId);

    const response = h.response({
      status: 'success',
      data: { collaborationId },
    });
    response.code(201);
    return response;
  }

  async deleteCollabHandler(request) {
    this._validator.validatePayload(request.payload);
    const { playlistId, userId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyOwner(playlistId, credentialId);
    await this._collaborationService.deleteCollab(playlistId, userId);
    return {
      status: 'success',
      message: 'Collaboration deleted',
    };
  }
};

module.exports = CollaborationsHandler;