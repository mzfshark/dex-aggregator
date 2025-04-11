// src/store/interactions.js
import { ethers } from "ethers";
import ERC20ABI from "../abis/ERC20.json";
import { getTokensByChainId } from "../utils/loadTokens";
import { loadTokens as loadTokenContracts } from "./tokens";

/**
 * Carrega a lista de tokens da chain e instancia contratos ERC20
 * @param {*} dispatch
 * @param {*} provider
 */
export const loadTokens = async (dispatch, provider) => {
  try {
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    const tokenList = getTokensByChainId(chainId);
    await loadTokenContracts(provider, tokenList, dispatch);
  } catch (error) {
    console.error("Erro ao carregar tokens:", error);
  }
};




// Carrega conta e provider
export const loadAccount = async (dispatch) => {
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  const account = ethers.getAddress(accounts[0]);
  dispatch({ type: "ACCOUNT_LOADED", account });
};


// Busca melhor rota e cotação de swap
export const getBestSwapRoute = async (aggregatorContract, path, inputAmount) => {
  try {
    if (!Array.isArray(path) || path.length < 2 || !inputAmount) {
      throw new Error("Parâmetros inválidos para rota");
    }

    const [amountOut, selectedRouter, fullPath] =
      await aggregatorContract.getBestAmountsOutOnUniswapForks(path, inputAmount.toString());

    return {
      amountOut: BigInt(amountOut),
      router: selectedRouter,
      fullPath,
    };
  } catch (err) {
    console.error("Erro em getBestSwapRoute:", err);
    return {
      amountOut: 0n,
      router: null,
      fullPath: [],
    };
  }
};

// Executa o swap
export const swap = async (
  provider,
  contracts,
  path,
  router,
  amountIn,
  minAmountOut,
  slippage,
  slippageBps,
  deadline,
  dispatch
) => {
  try {
    dispatch({ type: "SWAP_REQUEST" });

    const signer = await provider.getSigner();
    const inputToken = path[0];

    // Aprova o token de entrada se necessário
    const tokenContract = new ethers.Contract(inputToken, ERC20ABI, signer);
    const allowance = await tokenContract.allowance(await signer.getAddress(), contracts.aggregator.target);

    if (allowance < BigInt(amountIn)) {
      const txApprove = await tokenContract.approve(contracts.aggregator.target, amountIn);
      await txApprove.wait();
    }

    // Realiza o swap
    const aggregator = contracts.aggregator.connect(signer);
    const tx = await aggregator.swap(router, path, amountIn, minAmountOut, deadline, slippageBps);
    const receipt = await tx.wait();

    dispatch({
      type: "SWAP_SUCCESS",
      transactionHash: receipt.transactionHash,
    });
  } catch (err) {
    console.error("Erro ao executar swap:", err);
    dispatch({ type: "SWAP_FAIL" });
  }
};
