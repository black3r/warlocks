import { Game } from '../models/game';

export function getMatchHistory(player) {
  return Game.find({
    players: {
      status: "finished",
      $in: [player],
    }
  }).exec().then((games) => {
    return games.map((game) => {
      return {
        _id: game._id,
        players: game.players,
        rounds: game.rounds,
        roundCount: game.roundCount,
        status: game.status,
        scores: game.scores,
      };
    });
  });
}
