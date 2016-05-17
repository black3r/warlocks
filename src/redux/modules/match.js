const LOAD_START = 'warlocks/match/LOAD_START';
const LOAD_FINISHED = 'warlocks/match/LOAD_FINISHED';
const LOAD_ERROR = 'warlocks/match/LOAD_ERROR';

const OPEN_DETAILS = 'warlocks/match/OPEN_DETAILS';

const initialState = {
  loaded: false,
  list: null,
  openMatch: null,
};

export default function match(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD_START:
      return initialState;
    case LOAD_FINISHED:
      return {
        list: action.result,
        loaded: true,
        openMatch: null,
      };
    case LOAD_ERROR:
      return initialState;
    case OPEN_DETAILS:
      return {
        ...state,
        openMatch: action.result,
      };
    default:
      return state;
  }
}

export function selectMatch(selected) {
  return {
    type: OPEN_DETAILS,
    result: selected,
  };
}

export function load() {
  return {
    types: [LOAD_START, LOAD_FINISHED, LOAD_ERROR],
    promise: (client) => client.get('/match/list/')
  };
}
