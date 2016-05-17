import { Game } from '../models/game';

export function gameOver(gameId, moves, user) {
  return Game.findOne({
    _id: gameId
  }).exec().then((game) => {
    game.rounds[0].moves = moves;
    game.status = 'finished';
    game.winner = user;

    // calculate scores:
    for (let moveNum = 0; moveNum < moves.length; moveNum++) {
      const move = moves[moveNum];
      if (move.moveType === 'died') {
        game.scores.push({
          player: move.player,
          value: move.time,
        });
      }
    }

    return game.save();
  }).then(() => true)
    .catch(() => false);
}
