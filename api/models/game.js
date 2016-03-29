import mongoose from 'mongoose';

const gameSchema = mongoose.Schema({
  players: [String],
  rounds: [{
    players: [String],
    moves: [{
      player: String,
      type: String,
      coordinates: [Number],
      time: Number,
      type: String
    }]
  }],
  roundCount: Number,
  status: String,
  scores: [{
    player: String,
    value: Number
  }]
});

export const Game = mongoose.model('Game', gameSchema);