import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import AggregatorABI from "../abis/Aggregator.json";
import config from "../config.json";

// Criação do contexto
const ContractContext = createContext(null);

// Hook customizado para acesso ao contexto
export const useContracts = () => useContext(ContractContext);

// Provider
export const ContractProvider = ({ children }) => {
  const [contracts, setContracts] = useState({});
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null); 

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(newProvider);

        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);

        const { chainId } = await newProvider.getNetwork();
        setChainId(chainId); // ✅ ISSO É O QUE FALTAVA

        const aggregatorAddress = config[chainId.toString()]?.aggregator;

        if (!aggregatorAddress) {
          console.warn(`Endereço do contrato não encontrado para chainId ${chainId}`);
          return;
        }

        const aggregator = new ethers.Contract(aggregatorAddress, AggregatorABI, newProvider);
        setContracts({ aggregator });
      }
    };

    init();
  }, []);


  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setChainId(null);
    setContracts({});
  };

  return (
    <ContractContext.Provider value={{ contracts, provider, account, chainId, disconnectWallet }}>
      {children}
    </ContractContext.Provider>
  );
};
