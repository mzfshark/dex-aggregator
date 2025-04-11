// src/components/Navigation.js
import React, { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { useContracts } from "./ContractContext";

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
  const { provider, account, disconnectWallet } = useContracts();
  const [nativeBalance, setNativeBalance] = useState("0.0000");

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

  const connectWalletHandler = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        window.location.reload(); // força o re-render e re-execução do ContractContext
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
            <DisconnectButton onClick={disconnectWallet} style={{ marginLeft: "10px" }}>
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
