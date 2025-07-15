const routes = (handler) => [
  {
    method: 'POST',
    path: '/collaborations',
    handler: handler.postCollabHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/collaborations',
    handler: handler.deleteCollabHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
];

module.exports = routes;