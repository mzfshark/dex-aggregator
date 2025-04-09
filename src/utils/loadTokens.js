import harmonyTokenList from '../lists/harmony-tokenlist.json';
import bscTokenList from '../lists/bsc-tokenlist.json';
import sepoliaTokenList from '../lists/sepolia-tokenlist.json';
// ...adicione os imports necessários para outras redes

const CHAIN_ID_TO_NAME = {
  1666600000: 'harmony',
  56: 'bsc',
  97: 'bsc_testnet',
  11155111: 'sepolia',
  // ...adicione outros mapeamentos
};

/**
 * Retorna a lista de tokens da rede específica com base no chainId.
 * @param {number} chainId
 * @returns {Array} lista de tokens
 */
export function getTokensByChainId(chainId) {
  const chainName = CHAIN_ID_TO_NAME[chainId];

  if (!chainName) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }

  let tokenList;

  switch (chainName) {
    case 'harmony':
      tokenList = harmonyTokenList;
      break;
    case 'bsc':
      tokenList = bscTokenList;
      break;
    case 'sepolia':
      tokenList = sepoliaTokenList;
      break;
    // ...adicione outros cases
    default:
      throw new Error(`Token list not found for chain: ${chainName}`);
  }

  const swapItem = tokenList.items.find((item) => item.key === 'swap');
  return swapItem?.value?.tokens || [];
}
