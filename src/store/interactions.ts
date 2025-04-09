import { Web3Provider } from '@ethersproject/providers';
import { Contract, Wallet, formatUnits, ZeroAddress, parseUnits } from 'ethers';
import tokenList from '../lists/tokenList.json';
import { Dispatch } from 'redux';

import {
  setProvider,
  setNetwork,
  setAccount
} from './reducers/provider';

import {
  setSymbols,
  balancesLoaded
} from './reducers/tokens';

import {
  setIsSwapping,
  setIsSuccess,
  setTransactionHash,
  setSwapFail
} from './slices/aggregatorSlice';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
}

const ERC20_ABI = [
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint)',
  'function approve(address spender, uint amount) returns (bool)'
];

// --------------------------------------
// Cria dinamicamente um tokenMap a partir da tokenList
export const createTokenMap = (
  provider: Web3Provider
): { [address: string]: Contract } => {
  const tokenMap: Record<string, Contract> = {};
  for (const token of tokenList as TokenInfo[]) {
    tokenMap[token.address] = new Contract(token.address, ERC20_ABI, provider);
  }
  return tokenMap;
};

// --------------------------------------
// PROVIDER
export const loadProvider = (
  provider: Web3Provider,
  dispatch: Dispatch
) => {
  dispatch(setProvider(provider));
  return provider;
};

// --------------------------------------
// NETWORK
export const loadNetwork = async (
  provider: Web3Provider,
  dispatch: Dispatch
) => {
  const network = await provider.getNetwork();
  dispatch(setNetwork(network.chainId.toString()));
  return network.chainId;
};

// --------------------------------------
// ACCOUNT
export const loadAccount = async (
  dispatch: Dispatch
) => {
  const accounts = await window.ethereum?.request({ method: 'eth_requestAccounts' });
  const account = accounts[0];
  dispatch(setAccount(account));
  return account;
};

// --------------------------------------
// TOKEN SYMBOLS
export const loadTokens = async (
  tokenMap: { [address: string]: Contract },
  dispatch: Dispatch
) => {
  const symbols: Record<string, string> = {};
  for (const [address, contract] of Object.entries(tokenMap)) {
    const symbol = await contract.symbol();
    symbols[address] = symbol;
  }
  dispatch(setSymbols(symbols));
  return symbols;
};

// --------------------------------------
// FETCH TOKENS (Thunk Style)
export const fetchTokens = (
  provider: Web3Provider
) => {
  return async (dispatch: Dispatch) => {
    try {
      const symbols: Record<string, string> = {};
      for (const token of tokenList as TokenInfo[]) {
        const contract = new Contract(token.address, ERC20_ABI, provider);
        const symbol = await contract.symbol();
        symbols[token.address] = symbol;
      }
      dispatch(setSymbols(symbols));
    } catch (error) {
      console.error('Erro ao carregar símbolos dos tokens:', error);
    }
  };
};

// --------------------------------------
// LOAD BALANCES
export const loadBalances = async (
  tokenMap: { [address: string]: Contract },
  account: string,
  dispatch: Dispatch
) => {
  const balances: Record<string, string> = {};

  for (const token of tokenList as TokenInfo[]) {
    const contract = tokenMap[token.address];
    const rawBalance = await contract.balanceOf(account);
    balances[token.address] = formatUnits(rawBalance, token.decimals);
  }

  dispatch(balancesLoaded(balances));
  return balances;
};

// --------------------------------------
// SWAP
export const swap = async (
  provider: Web3Provider,
  tokenMap: { [address: string]: Contract },
  aggregator: Contract,
  path: string[],
  router: string,
  amount: string,
  minAmountOut: string,
  slippage: number,
  deadline: number,
  dispatch: Dispatch
) => {
  try {
    dispatch(setIsSwapping(true));

    const signer = await provider.getSigner();
    const fromToken = tokenMap[path[0]].connect(signer);

    // approve
    const tx1 = await fromToken.approve(aggregator.target, amount);
    await tx1.wait();

    // swap
    const tx2 = await aggregator.connect(signer).swapOnUniswapFork(
      path,
      router,
      amount,
      minAmountOut,
      slippage,
      deadline
    );

    await tx2.wait();
    dispatch(setIsSuccess(tx2.hash));
  } catch (error) {
    console.error('Erro no swap:', error);
    dispatch(setSwapFail(true));
  }
};
