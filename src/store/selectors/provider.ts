// store/selectors/provider.ts
export const selectProvider = (state: RootState) => state.provider.connection;
export const selectAccount = (state: RootState) => state.provider.account;
