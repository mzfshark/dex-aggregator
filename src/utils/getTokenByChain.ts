// src/utils/getTokenByChain.ts
import rawList from '../lists/tokenList.json';

type Token = {
  address: string;
  chainId: number;
  decimals: number;
  logoURI: string;
  name: string;
  symbol: string;
};

type TokenList = {
  items: {
    operation: string;
    key: string;
    value: {
      enabled: boolean;
      tokens: Token[];
    };
  }[];
};

const tokenList = rawList as TokenList;

const tokenMap: Record<string, Token[]> = {};

for (const item of tokenList.items) {
  if (item.operation === 'set' && item.value.enabled) {
    tokenMap[item.key] = item.value.tokens;
  }
}

export const getTokensByChain = (chainKey: string): Token[] => {
  return tokenMap[chainKey] || [];
};
