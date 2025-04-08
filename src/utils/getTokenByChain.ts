// utils/getTokensByChain.ts
import config from '../config.json';

export const getTokensByChain = (chainId) => {
  const chainConfig = config[chainId];
  if (!chainConfig) return [];

  return Object.entries(chainConfig).map(([key, value]) => ({
    symbol: key.toUpperCase(),
    address: value.address,
  }));
};
