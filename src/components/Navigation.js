// src/components/Navigation.js
import React, { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { useContract } from "./ContractContext";

import {
  Nav,
  NavItem,
  Logo,
  AccountInfo,
  ConnectButton,
  BalanceWrapper,
  DisconnectButton
} from "../styles/StyledComponents";

const Navigation = () => {
  const { provider, account, disconnectWallet } = useContract();
  const [nativeBalance, setNativeBalance] = useState("0.0000");

  // Carrega o saldo nativo da conta conectada
  const loadNativeBalance = useCallback(async () => {
    if (provider && account) {
      try {
        const balance = await provider.getBalance(account);
        const formatted = ethers.formatEther(balance);
        setNativeBalance(parseFloat(formatted).toFixed(4));
      } catch (err) {
        console.error("Erro ao buscar saldo nativo:", err);
        setNativeBalance("0.0000");
      }
    }
  }, [provider, account]);

  useEffect(() => {
    loadNativeBalance();
  }, [loadNativeBalance]);

  // Função para conectar a carteira via MetaMask
  const connectWalletHandler = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        window.location.reload(); // Força re-render para atualizar o contexto
      } catch (err) {
        console.error("Erro ao conectar wallet:", err);
      }
    } else {
      alert("MetaMask não detectado!");
    }
  };

  return (
    <Nav>
      <NavItem>
        <Logo src="logo.jpg" alt="Recovery Harmony" />
      </NavItem>

      <NavItem>
        {account ? (
          <AccountInfo>
            <BalanceWrapper>
              <strong>{nativeBalance}</strong> ONE
            </BalanceWrapper>
            <span>{`${account.slice(0, 6)}...${account.slice(-4)}`}</span>
            <DisconnectButton
              onClick={disconnectWallet}
              style={{ marginLeft: "10px" }}
            >
              Disconnect
            </DisconnectButton>
          </AccountInfo>
        ) : (
          <ConnectButton onClick={connectWalletHandler}>
            Connect Wallet
          </ConnectButton>
        )}
      </NavItem>
    </Nav>
  );
};

export default Navigation;
