import { createSlice } from '@reduxjs/toolkit'

export const provider = createSlice({
  name: 'provider',
  initialState: {
    connection: null,
    chainId: null,
    account: null,
    isConnecting: false,
    isConnected: false
  },
  reducers: {
    setProvider: (state, action) => {
      state.connection = action.payload
    },
    setNetwork: (state, action) => {
      state.chainId = action.payload
    },
    setAccount: (state, action) => {
      state.account = action.payload
    },
    setIsConnecting: (state, action) => {
      state.isConnecting = true
    },
    setIsConnected: (state, action) => {
      state.isConnecting = false
      state.isConnected = true
    }
  }
})

export const {  setProvider, setNetwork, setAccount,setIsConnecting, setIsConnected } = provider.actions;

export default provider.reducer;
