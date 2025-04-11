import { ethers } from "ethers";
import AggregatorAbi from "../abis/Aggregator.json";

const ORACLE_ADDRESS = "0xDA7a001b254CD22e46d3eAB04d937489c93174C3";

export async function fetchOraclePrice(provider, baseSymbol, quoteSymbol = "USDC") {
  try {
    const contract = new ethers.Contract(ORACLE_ADDRESS, AggregatorAbi, provider);
    const data = await contract.getReferenceData(baseSymbol, quoteSymbol);
    
    // Converte o valor de BigNumber para número com 18 casas decimais
    const rate = ethers.formatUnits(data.rate, 18);
    return parseFloat(rate);
  } catch (error) {
    console.error("Erro ao buscar preço no Oracle:", error);
    return null;
  }
}
