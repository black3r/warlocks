const GAME_START = 'warlocks/game/GAME_START';
const START_LOBBY = 'warlocks/lobby/START';

const initialState = {
  loaded: false,
  game: null,
  positions: null,
};

export default function game(state = initialState, action = {}) {
  switch (action.type) {
    case GAME_START:
    case START_LOBBY:
      return {
        ...state,
        loaded: true,
        game: action.result
      };
    default:
      return state;
  }
}
