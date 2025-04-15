// src/store/reducers/aggregator.js
import { createSlice } from "@reduxjs/toolkit";

// Função que retorna o estado inicial para cada chainId
const createInitialSwapState = () => ({
  contract: null,
  swaps: [],
  swapping: {
    isSwapping: false,
    isSuccess: false,
    transactionHash: null,
  },
});

// Estado inicial geral do slice, contendo o chainId atual e os dados para cada rede
const initialState = {
  currentChainId: null,
  data: {},
};

const aggregatorSlice = createSlice({
  name: "aggregator",
  initialState,
  reducers: {
    // Define o chainId atual e garante que exista um estado para ele
    setCurrentChainId: (state, action) => {
      const chainId = action.payload;
      state.currentChainId = chainId;
      if (!state.data[chainId]) {
        state.data[chainId] = createInitialSwapState();
      }
    },
    // Armazena a instância do contrato para determinado chainId
    setAggregatorContract: (state, action) => {
      const { chainId, contract } = action.payload;
      if (!state.data[chainId]) {
        state.data[chainId] = createInitialSwapState();
      }
      state.data[chainId].contract = contract;
    },
    // Atualiza os swaps carregados para determinado chainId
    setSwapsLoaded: (state, action) => {
      const { chainId, swaps } = action.payload;
      if (!state.data[chainId]) {
        state.data[chainId] = createInitialSwapState();
      }
      state.data[chainId].swaps = swaps;
    },
    // Marca o início de uma operação de swap para determinado chainId
    setIsSwapping: (state, action) => {
      const { chainId } = action.payload;
      if (!state.data[chainId]) {
        state.data[chainId] = createInitialSwapState();
      }
      state.data[chainId].swapping = {
        isSwapping: true,
        isSuccess: false,
        transactionHash: null,
      };
    },
    // Define que o swap foi bem-sucedido para determinado chainId
    setSwapSuccess: (state, action) => {
      const { chainId, transactionHash } = action.payload;
      if (!state.data[chainId]) {
        state.data[chainId] = createInitialSwapState();
      }
      state.data[chainId].swapping = {
        isSwapping: false,
        isSuccess: true,
        transactionHash,
      };
    },
    // Define que o swap falhou para determinado chainId
    setSwapFail: (state, action) => {
      const { chainId } = action.payload;
      if (!state.data[chainId]) {
        state.data[chainId] = createInitialSwapState();
      }
      state.data[chainId].swapping = {
        isSwapping: false,
        isSuccess: false,
        transactionHash: null,
      };
    },
  },
});

export const {
  setCurrentChainId,
  setAggregatorContract,
  setSwapsLoaded,
  setIsSwapping,
  setSwapSuccess,
  setSwapFail,
} = aggregatorSlice.actions;

export default aggregatorSlice.reducer;
