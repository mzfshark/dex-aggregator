// src/components/ContractContext.js
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import AggregatorABI from '../abis/Aggregator.json';

const ContractContext = createContext();

export const useContract = () => {
  return useContext(ContractContext);
};

const ContractProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [aggregator, setAggregator] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  // Defina o endereço do contrato Aggregator via variável de ambiente ou hard-code
  const aggregatorAddress = process.env.REACT_APP_AGGREGATOR_ADDRESS || '0xYourAggregatorAddress';

  // Memorize a função initBlockchain para que sua referência seja estável
  const initBlockchain = useCallback(async () => {
    if (window.ethereum) {
      try {
        // Solicita permissão ao usuário
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(web3Provider);
        const signer = await web3Provider.getSigner();
        setSigner(signer);
        const userAddress = await signer.getAddress();
        setAccount(userAddress);
        // Cria a instância do contrato Aggregator
        const aggregatorInstance = new ethers.Contract(aggregatorAddress, AggregatorABI, signer);
        setAggregator(aggregatorInstance);
      } catch (error) {
        console.error('Erro ao conectar com o Ethereum:', error);
      }
    } else {
      console.error("Provider Ethereum não encontrado. Instale o MetaMask.");
    }
    setLoading(false);
  }, [aggregatorAddress]);

  useEffect(() => {
    initBlockchain();
  }, [initBlockchain]);

  const contextValue = {
    provider,
    aggregator,
    signer,
    account,
    loading,
  };

  return (
    <ContractContext.Provider value={contextValue}>
      {children}
    </ContractContext.Provider>
  );
};

export default ContractProvider;
