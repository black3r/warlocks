import { Lobby } from '../models/lobby';
import { Game } from '../models/game';

export function startLobby(lobbyId, playerName) {
  return Lobby.findOne({
    _id: lobbyId
  }).exec().then((lobby) => {
    if (!lobby.players.length) {
      return {
        response: 'error',
        msg: 'can\'t start an empty lobby',
      };
    }

    if (lobby.players[0] !== playerName) {
      return {
        response: 'error',
        msg: 'only the lobby owner can start a game',
      };
    }

    const game = new Game({
      players: lobby.players,
      rounds: [{
        players: lobby.players,
        moves: []
      }],
      roundCount: 1,
      status: "loading",
      scores: []
    });

    return game.save().then((gameObj) => {
      // remove the lobby after the game is created..
      return Lobby.find({
        _id: lobby._id
      }).remove().exec().then(() => ({
        response: 'success',
        msg: {
          _id: gameObj._id,
          players: gameObj.players,
          rounds: gameObj.rounds,
          roundCount: gameObj.roundCount,
          status: gameObj.status,
          scores: gameObj.scores,
        }
      }));
    });
  });
}
