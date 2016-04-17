import { Lobby } from '../models/lobby';

export function createLobby(lobbyName) {
  const lobby = new Lobby({
    name: lobbyName
  });
  return lobby.save().then((data) => ({
    response: 'success',
    msg: {
      _id: data._id,
      name: data.name
    }
  }));
}
