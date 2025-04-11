// src/utils/fetchTokenPrice.js
import { ethers } from "ethers";

/**
 * Calcula a taxa de conversão entre inputAmount e bestDeal.
 * 
 * @param {bigint} inputAmount - Quantidade em formato BigInt do token de entrada
 * @param {bigint} outputAmount - Quantidade esperada no token de saída (bestDeal)
 * @param {number} inputDecimals - Decimais do token de entrada
 * @param {number} outputDecimals - Decimais do token de saída
 * @param {number} precision - Quantidade de casas decimais no resultado (default: 6)
 * @returns {string} - Preço formatado como string decimal
 */
export const getTokenPrice = (
  inputAmount,
  outputAmount,
  inputDecimals = 18,
  outputDecimals = 18,
  precision = 6
) => {
  try {
    if (!inputAmount || !outputAmount || inputAmount === 0n) return "0";

    const inputFormatted = Number(ethers.formatUnits(inputAmount, inputDecimals));
    const outputFormatted = Number(ethers.formatUnits(outputAmount, outputDecimals));

    const rate = outputFormatted / inputFormatted;
    return rate.toFixed(precision);
  } catch (err) {
    console.error("Erro ao calcular taxa de conversão:", err);
    return "0";
  }
};
