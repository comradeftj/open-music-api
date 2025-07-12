require('dotenv').config();

const Hapi = require('@hapi/hapi');
const album = require('./api/album');
const MusicService = require('./services/postgres/albumService');
const albumValidator = require('./validators/album');
const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const musicService = new MusicService();
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register({
    plugin: album,
    options: {
      service: musicService,
      validator: albumValidator,
    },
  });

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
