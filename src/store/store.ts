// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import providerReducer from './reducers/provider';
import tokensReducer from './reducers/tokens';
import aggregatorReducer from './reducers/aggregator';

export const store = configureStore({
  reducer: {
    provider: providerReducer,
    tokens: tokensReducer,
    aggregator: aggregatorReducer,
  },
});

// 👇 Exporta o tipo RootState baseado na store atual
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
