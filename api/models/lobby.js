import mongoose from 'mongoose';

const lobbySchema = mongoose.Schema({
  players: [String],
  name: String
});

export const Lobby = mongoose.model('Lobby', lobbySchema);