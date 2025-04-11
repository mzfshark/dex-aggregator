// store/tokens.js
import { ethers } from "ethers";
import ERC20Abi from "../abis/ERC20.json";

// Action creators
export const setSymbols = (symbols) => ({
  type: "TOKENS_LOADED",
  payload: symbols, // Map<string, Contract>
});

export const balancesLoaded = (balances) => ({
  type: "BALANCES_LOADED",
  payload: balances,
});

/**
 * Carrega os contratos ERC20 a partir da lista de tokens da rede atual.
 * @param {ethers.BrowserProvider} provider 
 * @param {Array} tokenList - lista de tokens do tokenlist.json
 * @param {Function} dispatch 
 */
export const loadTokens = async (provider, tokenList, dispatch) => {
  try {
    const signer = await provider.getSigner();
    const tokenMap = new Map();

    for (const token of tokenList) {
      const contract = new ethers.Contract(token.address, ERC20Abi, signer);
      tokenMap.set(token.symbol, contract);
    }

    dispatch(setSymbols(tokenMap));
  } catch (error) {
    console.error("Erro ao carregar tokens:", error);
  }
};
