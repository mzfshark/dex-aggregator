import tokens from "../lists/harmony-tokenlist.json";

const tokenList = tokens;
const CHAIN_ID_TO_NAME = {
  1666600000: "harmony",
};

/**
 * Retorna a lista de tokens da rede específica com base no chainId.
 * Inclui o token nativo manualmente.
 * @param {number} chainId
 * @returns {Array} lista de tokens
 */
export function getTokensByChainId(chainId) {
  const chainName = CHAIN_ID_TO_NAME[chainId];

  if (!chainName) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }

  let tokens;

  switch (chainName) {
    case "harmony":
      tokens = tokenList.tokens;
      break;
    default:
      throw new Error(`Token list not found for chain: ${chainName}`);
  }

  // Adiciona o token nativo ONE
  const nativeToken = {
    name: "Harmony ONE",
    symbol: "ONE",
    address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Placeholder padrão para nativos
    decimals: 18,
    logoURI: "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/one.jpg", // caminho relativo da imagem
    isNative: true,
  };

  return [nativeToken, ...tokens];
}
