const LOBBY_LIST_LOAD = 'warlocks/lobby/LIST_LOAD';
const LOBBY_LIST_LOAD_SUCCESS = 'warlocks/lobby/LIST_LOAD_SUCCESS';
const LOBBY_LIST_LOAD_FAIL = 'warlocks/lobby/LIST_LOAD_FAIL';

const CREATE_LOBBY = 'warlocks/lobby/CREATE';
const CREATE_LOBBY_SUCCESS = 'warlocks/lobby/CREATE_SUCCESS';
const CREATE_LOBBY_FAIL = 'warlocks/lobby/CREATE_FAIL';

const GET_LOBBY = 'warlocks/lobby/GET';
const GET_LOBBY_SUCCESS = 'warlocks/lobby/GET_SUCCESS';
const GET_LOBBY_FAIL = 'warlocks/lobby/GET_FAIL';

const initialState = {
  loaded: false,
  selecting: false,
  list: null,
  selected: null,
};

export default function lobby(state = initialState, action = {}) {
  switch (action.type) {
    case LOBBY_LIST_LOAD:
      return {
        ...state,
        loading: true,
      };
    case LOBBY_LIST_LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        list: action.result,
      };
    case LOBBY_LIST_LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        list: null,
      };

    case CREATE_LOBBY:
      return {
        ...state,
        selecting: true,
        selectError: null,
        selected: null
      };
    case CREATE_LOBBY_SUCCESS:
      return {
        ...state,
        selecting: false,
        selected: action.result,
        selectError: null,
      };
    case CREATE_LOBBY_FAIL:
      return {
        ...state,
        selecting: false,
        selected: null,
        selectError: action.error,
      };

    case GET_LOBBY:
      return {
        ...state,
        selecting: true,
        selectError: null,
        selected: null,
      };
    case GET_LOBBY_SUCCESS:
      return {
        ...state,
        selecting: false,
        selectError: null,
        selected: action.result
      };
    case GET_LOBBY_FAIL:
      return {
        ...state,
        selecting: false,
        selectError: action.error,
        selected: null,
      };
    default:
      return state;
  }
}

export function isLoaded(globalState) {
  return globalState.lobby && globalState.lobby.loaded;
}

export function load() {
  return {
    types: [LOBBY_LIST_LOAD, LOBBY_LIST_LOAD_SUCCESS, LOBBY_LIST_LOAD_FAIL],
    promise: (client) => client.get('/lobby/list/').then((data) => {
      if (data.response !== 'success') {
        throw data.msg;
      } else {
        return data.msg;
      }
    })
  };
}

export function createLobby(name) {
  return {
    types: [CREATE_LOBBY, CREATE_LOBBY_SUCCESS, CREATE_LOBBY_FAIL],
    promise: (client) => client.post('/lobby/create/', {
      data: {
        name: name
      }
    }).then((data) => {
      if (data.response !== 'success') {
        throw data.msg;
      } else {
        return data.msg;
      }
    })
  };
}

export function selectLobby(id) {
  return {
    types: [GET_LOBBY, GET_LOBBY_SUCCESS, GET_LOBBY_FAIL],
    promise: (client) => client.post('/lobby/get/', {
      data: {
        id: id
      }
    }).then((data) => {
      if (data.response !== 'success') {
        throw data.msg;
      } else {
        return data.msg;
      }
    })
  };
}
