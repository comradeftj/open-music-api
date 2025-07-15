const Joi = require('joi');

const playlistPostPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const playlistPostSongPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

const playlistDeleteSongPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = { playlistPostPayloadSchema, playlistPostSongPayloadSchema, playlistDeleteSongPayloadSchema };