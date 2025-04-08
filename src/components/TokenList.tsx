interface Token {
    address: string;
    symbol: string;
    name: string;
    logoURI: string;
  }
  
  interface TokenListProps {
    tokens: Token[];
    onSelect: (token: Token) => void;
  }
  
  const TokenList: React.FC<TokenListProps> = ({ tokens, onSelect }) => (
    <ul className="token-list">
      {tokens.map((token) => (
        <li key={token.address} onClick={() => onSelect(token)}>
          <img src={token.logoURI} alt={token.symbol} />
          {token.symbol}
        </li>
      ))}
    </ul>
  );
  
