require('dotenv').config();
const Hapi = require('@hapi/hapi');
const ClientError = require('./exceptions/ClientError');

const album = require('./api/album');
const MusicService = require('./services/postgres/albumService');
const albumValidator = require('./validators/album');

const song = require('./api/song');
const SongService = require('./services/postgres/songService');
const songValidator = require('./validators/song');

const init = async () => {
  const musicService = new MusicService();
  const songService = new SongService();
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: album,
      options: {
        service: musicService,
        validator: albumValidator,
      },
    },
    {
      plugin: song,
      options: {
        service: songService,
        validator: songValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof ClientError) {
      const currResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      currResponse.code(response.statusCode);
      return currResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
