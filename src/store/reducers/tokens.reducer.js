// src/store/reducers/tokens.reducer.js
const initialState = {
  symbols: new Map(),
  balances: {},
};

const tokensReducer = (state = initialState, action) => {
  switch (action.type) {
    case "TOKENS_LOADED":
      return {
        ...state,
        symbols: action.payload, // continua sendo um Map
      };
    case "BALANCES_LOADED":
      return {
        ...state,
        balances: action.payload,
      };
    default:
      return state;
  }
};

export default tokensReducer;

