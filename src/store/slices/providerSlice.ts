import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ethers, providers } from 'ethers';
import {  } from 'ethers/lib/utils';

interface ProviderState {
  connection: ethers.providers | null;
  account: string;
}

const initialState: ProviderState = {
  connection: null,
  account: '',
};

const providerSlice = createSlice({
  name: 'provider',
  initialState,
  reducers: {
    setProvider(state, action: PayloadAction<ethers.providers>) {
      state.connection = action.payload;
    },
    setAccount(state, action: PayloadAction<string>) {
      state.account = action.payload;
    },
  },
});

export const { setProvider, setAccount } = providerSlice.actions;
export default providerSlice.reducer;
