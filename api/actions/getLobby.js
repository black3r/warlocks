import { Lobby } from '../models/lobby';

export function getLobby(lobbyId) {
  return Lobby.findOne({
    _id: lobbyId,
  }).then((lobby) => ({
    response: 'success',
    msg: {
      _id: lobby._id,
      name: lobby.name
    },
  }));
}
