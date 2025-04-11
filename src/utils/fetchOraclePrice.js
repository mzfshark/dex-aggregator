import { ethers } from "ethers";
import OracleAggregator from "../abis/BandOracleAggregator.json";

// Endereço oficial da Harmony para o contrato Oracle
const ORACLE_ADDRESS = "0xC6F8d0Ae87B7aAd86c0b61dE1A778400C4b4702C";

export async function fetchOraclePrice(provider, baseSymbol, quoteSymbol = "USDC") {
  try {
    const oracle = new ethers.Contract(ORACLE_ADDRESS, OracleAggregator, provider);
    const result = await oracle.getReferenceData(baseSymbol, quoteSymbol);

    // `rate` é escalado em 1e18
    const price = Number(result.rate) / 1e18;
    return price;
  } catch (err) {
    console.error(`Erro ao obter preço do oracle para ${baseSymbol}/${quoteSymbol}`, err);
    return null;
  }
}
