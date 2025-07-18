class LikesHandler {
  constructor(service) {
    this._service = service;

    this.postLikeHandler = this.postLikeHandler.bind(this);
    this.getLikesHandler = this.getLikesHandler.bind(this);
    this.deleteLikeHandler = this.deleteLikeHandler.bind(this);
  }

  async postLikeHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;
    await this._service.verifyAlbum(albumId);
    await this._service.verifyLiked(credentialId, albumId);

    await this._service.addLike(credentialId, albumId);
    const response = h.response({
      status: 'success',
      message: 'Liked an album',
    });
    response.code(201);
    return response;
  }

  async getLikesHandler(request, h) {
    const { id: albumId } = request.params;

    await this._service.verifyAlbum(albumId);
    const { count, source } = await this._service.getLikes(albumId);
    const response = h.response({
      status: 'success',
      data: { likes: parseInt(count.likes) },
    }).header('X-Data-Source', source);
    response.code(200);
    return response;
  }

  async deleteLikeHandler(request) {
    const { id: albumId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyAlbum(albumId);
    await this._service.removeLike(credentialId, albumId);
    return {
      status: 'success',
      message: 'Unliked an album',
    };
  }
}

module.exports = LikesHandler;