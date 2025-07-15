class PlaylistHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistHandler = this.getPlaylistHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.postSongsToPlaylistByIdHandler = this.postSongsToPlaylistByIdHandler.bind(this);
    this.getSongsInPlaylistByIdHandler = this.getSongsInPlaylistByIdHandler.bind(this);
    this.deleteSongsInPlaylistByIdHandler = this.deleteSongsInPlaylistByIdHandler.bind(this);
    this.getActivitiesHandler = this.getActivitiesHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylist(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this._service.addPlaylist({ name, owner: credentialId });
    const response = h.response({
      status: 'success',
      data: { playlistId },
    });
    response.code(201);
    return response;
  }

  async getPlaylistHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._service.getAllPlaylist(credentialId);

    return {
      status: 'success',
      data: { playlists },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyOwner(id, credentialId);
    await this._service.removePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist deleted',
    };
  }

  async postSongsToPlaylistByIdHandler(request, h) {
    this._validator.validateSongUpload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    const { songId } = request.payload;

    await this._service.verifyAccesss(playlistId, credentialId);
    await this._service.addSong(playlistId, songId, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Song added to playlist',
    });
    response.code(201);
    return response;
  }

  async getSongsInPlaylistByIdHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    await this._service.verifyAccesss(playlistId, credentialId);

    const playlist = await this._service.getSongsOfPlaylistId(playlistId);
    return {
      status: 'success',
      data: { playlist },
    };
  }

  async deleteSongsInPlaylistByIdHandler(request) {
    this._validator.validateSongDelete(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    const { songId } = request.payload;

    await this._service.verifyAccesss(playlistId, credentialId);
    await this._service.removeSongsOfPlaylist(playlistId, songId, credentialId);
    return {
      status: 'success',
      message: 'Song deleted from playlist',
    };
  }

  async getActivitiesHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    await this._service.verifyAccesss(playlistId, credentialId);

    const activities = await this._service.getActivities(playlistId);
    return {
      status: 'success',
      data: {
        playlistId: playlistId,
        activities,
      },
    };
  }
}

module.exports = PlaylistHandler;