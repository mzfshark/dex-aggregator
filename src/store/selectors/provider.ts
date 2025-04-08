// src/store/selectors/provider.ts
import { RootState } from '../store'; // ← ajusta o caminho se necessário

export const selectProvider = (state: RootState) => state.provider.connection;
export const selectAccount = (state: RootState) => state.provider.account;

