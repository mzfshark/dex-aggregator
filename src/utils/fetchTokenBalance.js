// utils/fetchTokenBalance.js
import { ethers } from "ethers";
import ERC20_ABI from "../abis/ERC20.json";

/**
 * Busca o saldo de um token (ERC-20 ou nativo)
 * @param {Object} token Objeto do token (precisa ter symbol, address, isNative)
 * @param {ethers.Provider} provider
 * @param {string} account
 * @returns {string} saldo formatado
 */
export const fetchTokenBalance = async (token, provider, account) => {
  if (!token || !provider || !account) return "0";

  
  try {
    // Se for token nativo (ONE)
    if (token.isNative || token.address === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
      const balance = await provider.getBalance(account);
      return parseFloat(ethers.formatUnits(balance, 18)).toFixed(4);
    }

    // Token ERC-20
    const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
    const rawBalance = await contract.balanceOf(account);
    const decimals = await contract.decimals();
    return parseFloat(ethers.formatUnits(rawBalance, decimals)).toFixed(4);
  } catch (err) {
    console.error(`Erro ao buscar saldo do token ${token.symbol}:`, err);
    return "0";
  }
};
