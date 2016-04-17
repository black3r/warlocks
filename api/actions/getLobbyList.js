import { Lobby } from '../models/lobby';

export function getLobbyList() {
  return Lobby.find().exec().then((data) => ({
    response: 'success',
    msg: data
  }));
}
