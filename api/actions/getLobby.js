import { Lobby } from '../models/lobby';

export function getLobby(lobbyId) {
  return Lobby.findOne({
    _id: lobbyId,
  }).exec().then((lobby) => ({
    response: 'success',
    msg: {
      _id: lobby._id,
      name: lobby.name,
      players: lobby.players
    },
  })).catch((err) => ({
    response: 'error',
    msg: 'There is no such lobby'
  }));
}
