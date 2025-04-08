// contexts/ContractsContext.tsx
import React, { createContext, useCallback, useState, useEffect } from 'react';
import { ethers, BrowserProvider } from 'ethers';
import { useDispatch } from 'react-redux';
import DAI_ABI from '../abis/Dai.json';
import WETH_ABI from '../abis/Weth.json';
import AGGREGATOR_ABI from '../abis/Aggregator.json';
import config from '../config.json';

import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
} from '../store/interactions';

type Contracts = {
  aggregator: ethers.Contract;
  dai: ethers.Contract;
  weth: ethers.Contract;
};

export const ContractsContext = createContext<Contracts | null>(null);

export const ContractsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contracts, setContracts] = useState<Contracts | null>(null);
  const dispatch = useDispatch();

  const fetchBlockChainData = useCallback(async () => {
    const provider = new BrowserProvider(window.ethereum);
    loadProvider(provider, dispatch);

    const chainId = await loadNetwork(provider, dispatch);
    window.ethereum.on('chainChanged', () => window.location.reload());
    window.ethereum.on('accountsChanged', async () => await loadAccount(dispatch));

    const aggregator = new ethers.Contract(config[chainId].aggregator.address, AGGREGATOR_ABI, provider);
    const dai = new ethers.Contract(config[chainId].dai.address, DAI_ABI, provider);
    const weth = new ethers.Contract(config[chainId].weth.address, WETH_ABI, provider);

    await loadTokens([dai, weth], dispatch);

    return { aggregator, dai, weth };
  }, [dispatch]);

  useEffect(() => {
    fetchBlockChainData().then(setContracts);
  }, [fetchBlockChainData]);

  return <ContractsContext.Provider value={contracts}>{children}</ContractsContext.Provider>;
};
