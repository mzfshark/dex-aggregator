// utils/tokenParser.ts
import rawTokenList from '../lists/tokenList.json';

export interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
  chainId: number;
  name?: string;
  logoURI?: string;
}

export const extractTokens = (): TokenInfo[] => {
  const items = (rawTokenList as any).items;

  const swapItem = items.find(
    (item: any) => item.key === 'swap' && item.value?.tokens
  );

  return swapItem?.value?.tokens || [];
};
