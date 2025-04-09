import { createSlice } from "@reduxjs/toolkit";

// Factory function para garantir cópia nova a cada rede
const createInitialSwapState = () => ({
  contract: null,
  swaps: [],
  swapping: {
    isSwapping: false,
    isSuccess: false,
    transactionHash: null,
  },
});

const initialState = {};

export const aggregator = createSlice({
  name: "aggregator",
  initialState,
  reducers: {
    initAggregatorState: (state, action) => {
      const chainId = action.payload;
      if (!state[chainId]) {
        state[chainId] = createInitialSwapState();
      }
    },
    setAggregatorContract: (state, action) => {
      const { chainId, contract } = action.payload;
      if (!state[chainId]) state[chainId] = createInitialSwapState();
      state[chainId].contract = contract;
    },
    setSwapsLoaded: (state, action) => {
      const { chainId, swaps } = action.payload;
      if (!state[chainId]) state[chainId] = createInitialSwapState();
      state[chainId].swaps = swaps;
    },
    setIsSwapping: (state, action) => {
      const chainId = action.payload;
      if (!state[chainId]) state[chainId] = createInitialSwapState();
      state[chainId].swapping = {
        isSwapping: true,
        isSuccess: false,
        transactionHash: null,
      };
    },
    setSwapSuccess: (state, action) => {
      const { chainId, hash } = action.payload;
      if (!state[chainId]) state[chainId] = createInitialSwapState();
      state[chainId].swapping = {
        isSwapping: false,
        isSuccess: true,
        transactionHash: hash,
      };
    },
    setSwapFail: (state, action) => {
      const chainId = action.payload;
      if (!state[chainId]) state[chainId] = createInitialSwapState();
      state[chainId].swapping = {
        isSwapping: false,
        isSuccess: false,
        transactionHash: null,
      };
    },
  },
});

export const {
  initAggregatorState,
  setAggregatorContract,
  setSwapsLoaded,
  setIsSwapping,
  setSwapSuccess,
  setSwapFail,
} = aggregator.actions;

export default aggregator.reducer;
