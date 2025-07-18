class SongHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getAllSongsHandler = this.getAllSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const { title, year, performer, genre, duration = 0, albumId } = request.payload;
    const songId = await this._service.addSong({ title, year, performer, genre, duration, albumId });

    const response = h.response({
      status: 'success',
      message: 'Song added',
      data: { songId },
    });
    response.code(201);
    return response;
  }

  async getAllSongsHandler(request) {
    const { title, performer } = request.query;
    const songs = await this._service.getAllSongs(title, performer);
    return {
      status: 'success',
      data: { songs },
    };
  }

  async getSongByIdHandler(request) {
    const { id } = request.params;
    const song = await this._service.getSongById(id);
    return {
      status: 'success',
      data: { song },
    };
  }

  async putSongByIdHandler(request) {
    this._validator.validateSongPayload(request.payload);
    const { id } = request.params;
    const { title, year, performer, genre, duration = 0, albumId } = request.payload;
    await this._service.editSongById(id, { title, year, performer, genre, duration, albumId });

    return {
      status: 'success',
      message: 'Edit is successful',
    };
  }

  async deleteSongByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteSongById(id);

    return {
      status: 'success',
      message: 'Song deleted',
    };
  }
}

module.exports = SongHandler;