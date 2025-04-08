import { configureStore } from '@reduxjs/toolkit';
import provider from './slices/providerSlice';
import aggregator from './slices/aggregatorSlice';
import tokens from './slices/tokensSlice';

export const store = configureStore({
  reducer: {
    provider,
    aggregator,
    tokens,
  },
});

// 🔹 Tipos globais
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
