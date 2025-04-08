import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TokensState {
  symbols: Record<string, string>;
}

const initialState: TokensState = {
  symbols: {},
};

const tokensSlice = createSlice({
  name: 'tokens',
  initialState,
  reducers: {
    setSymbols(state, action: PayloadAction<Record<string, string>>) {
      state.symbols = action.payload;
    },
    // outros reducers, como setBalances etc.
  },
});

export const { setSymbols } = tokensSlice.actions;
export default tokensSlice.reducer;
