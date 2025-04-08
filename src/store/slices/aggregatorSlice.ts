import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SwappingState {
  isSwapping: boolean;
  isSuccess: boolean;
  transactionHash: string | null;
}

interface AggregatorState {
  swapping: SwappingState;
}

const initialState: AggregatorState = {
  swapping: {
    isSwapping: false,
    isSuccess: false,
    transactionHash: null,
  },
};

const aggregatorSlice = createSlice({
  name: 'aggregator',
  initialState,
  reducers: {
    setIsSwapping(state, action: PayloadAction<boolean>) {
      state.swapping.isSwapping = action.payload;
    },
    setIsSuccess(state, action: PayloadAction<boolean>) {
      state.swapping.isSuccess = action.payload;
    },
    setTransactionHash(state, action: PayloadAction<string | null>) {
      state.swapping.transactionHash = action.payload;
    },
    resetSwapState(state) {
      state.swapping = {
        isSwapping: false,
        isSuccess: false,
        transactionHash: null,
      };
    },
  },
});

export const {
  setIsSwapping,
  setIsSuccess,
  setTransactionHash,
  resetSwapState,
} = aggregatorSlice.actions;

export default aggregatorSlice.reducer;
