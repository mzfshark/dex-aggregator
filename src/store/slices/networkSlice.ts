// store/networkSlice.ts
export const setChainId = (chainId: string) => ({
  type: 'SET_CHAIN_ID',
  payload: chainId
});
