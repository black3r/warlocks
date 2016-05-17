import { Game } from '../models/game';

export function gameOver(gameId, moves) {
  return Game.findOne({
    _id: gameId
  }).exec().then((game) => {
    game.rounds[0].moves = moves;
    game.status = 'finished';
    return game.save();
  }).then(() => true)
    .catch(() => false);
}
