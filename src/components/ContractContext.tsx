// contexts/ContractsContext.tsx

import React, {
  createContext,
  useCallback,
  useState,
  useEffect,
  ReactNode,
} from 'react';
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

// Tipagem do formato de contratos fornecidos no contexto
export type Contracts = {
  aggregator: ethers.Contract;
  dai: ethers.Contract;
  weth: ethers.Contract;
};

// Tipagem da configuração esperada no config.json
type ContractAddresses = {
  aggregator: { address: string };
  dai: { address: string };
  weth: { address: string };
};

type ConfigType = {
  [chainId: string]: ContractAddresses;
};

// Garantir tipagem do config
const typedConfig = config as ConfigType;

// Criar contexto com valor inicial `null`
export const ContractsContext = createContext<Contracts | null>(null);

// Props esperadas pelo provider
interface ContractsProviderProps {
  children: ReactNode;
}

// Provider
export const ContractsProvider: React.FC<ContractsProviderProps> = ({ children }) => {
  const [contracts, setContracts] = useState<Contracts | null>(null);
  const dispatch = useDispatch();

  const fetchBlockChainData = useCallback(async () => {
    if (!window.ethereum) {
      console.error('MetaMask não detectado!');
      return null;
    }

    const provider = new BrowserProvider(window.ethereum);
    loadProvider(provider, dispatch);

    const chainId = await loadNetwork(provider, dispatch);
    const networkConfig = typedConfig[chainId];

    if (!networkConfig) {
      console.error(`Configuração não encontrada para a chainId: ${chainId}`);
      return null;
    }

    // Listen for chain/account changes
    window.ethereum.on('chainChanged', () => window.location.reload());
    window.ethereum.on('accountsChanged', async () => {
      await loadAccount(dispatch);
    });

    // Inicialização dos contratos
    const aggregator = new ethers.Contract(
      networkConfig.aggregator.address,
      AGGREGATOR_ABI,
      provider
    );

    const dai = new ethers.Contract(
      networkConfig.dai.address,
      DAI_ABI,
      provider
    );

    const weth = new ethers.Contract(
      networkConfig.weth.address,
      WETH_ABI,
      provider
    );

    // Carrega os tokens no store
    await loadTokens([dai, weth], dispatch);

    return { aggregator, dai, weth };
  }, [dispatch]);

  useEffect(() => {
    fetchBlockChainData().then((contracts) => {
      if (contracts) setContracts(contracts);
    });
  }, [fetchBlockChainData]);

  return (
    <ContractsContext.Provider value={contracts}>
      {children}
    </ContractsContext.Provider>
  );
};
