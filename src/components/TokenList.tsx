// components/TokenList.tsx
import { useSelector } from 'react-redux';
import { getTokensByChain } from '../utils/getTokensByChain';

const TokenList = () => {
  const chainId = useSelector(state => state.network.chainId);
  const tokens = getTokensByChain(chainId);

  return (
    <ul>
      {tokens.map(token => (
        <li key={token.address}>{token.symbol}</li>
      ))}
    </ul>
  );
};
