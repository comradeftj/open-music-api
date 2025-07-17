require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const ClientError = require('./exceptions/ClientError');

//album
const album = require('./api/album');
const MusicService = require('./services/postgres/albumService');
const albumValidator = require('./validators/album');

//song
const song = require('./api/song');
const SongService = require('./services/postgres/songService');
const songValidator = require('./validators/song');

//users
const users = require('./api/users');
const UsersService = require('./services/postgres/usersService');
const userValidator = require('./validators/users');

//authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/authenticationsService');
const TokenManager = require('./tokenizer/tokenManager');
const authenticationValidator = require('./validators/authentication');

//playlist
const playlist = require('./api/playlist');
const PlaylistService = require('./services/postgres/playlistService');
const playlistValidator = require('./validators/playlist');

//collaborations
const collaboration = require('./api/collaborations');
const CollaborationService = require('./services/postgres/collaborationService');
const collabValidator = require('./validators/collaboration');

//exports
const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/producerService');
const exportValidator = require('./validators/exports');

const init = async () => {
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationService();
  const musicService = new MusicService();
  const songService = new SongService();
  const usersService = new UsersService();
  const playlistService = new PlaylistService(songService, collaborationsService);

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
      plugin: Jwt
    },
  ]);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
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
    {
      plugin: users,
      options: {
        service: usersService,
        validator: userValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: authenticationValidator,
      },
    },
    {
      plugin: playlist,
      options: {
        service: playlistService,
        validator: playlistValidator,
      },
    },
    {
      plugin: collaboration,
      options: {
        collaborationsService,
        usersService,
        playlistService,
        validator: collabValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        playlistService: playlistService,
        producerService: ProducerService,
        validator: exportValidator,
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
