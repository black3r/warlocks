import { Game } from '../models/game';

export function getMatchHistory(player) {
  return Game.find({
    status: "finished",
    players: {
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
        winner: game.winner,
      };
    });
  });
}
