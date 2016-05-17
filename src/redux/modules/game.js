const GAME_START = 'warlocks/game/GAME_START';
const START_LOBBY = 'warlocks/lobby/START';
const GAME_OVER = 'warlocks/game/GAME_OVER';
const CLEAR_GAME = 'warlocks/game/CLEAR_GAME';

const initialState = {
  loaded: false,
  game: null,
  positions: null,
  winner: null,
};

export default function game(state = initialState, action = {}) {
  switch (action.type) {
    case GAME_START:
    case START_LOBBY:
      return {
        ...state,
        loaded: true,
        game: action.result,
        winner: null,
      };
    case GAME_OVER:
      return {
        ...state,
        winner: action.result,
      };
    case CLEAR_GAME:
      return initialState;
    default:
      return state;
  }
}

export function gameOver(winner) {
  return {
    type: GAME_OVER,
    result: winner,
  };
}

export function clearGame() {
  return {
    type: CLEAR_GAME,
    result: null,
  };
}
