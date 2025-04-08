interface Transaction {
    hash: string;
    status: string;
    timestamp: number;
  }
  
  interface TransactionsProps {
    list: Transaction[];
  }
  
  const Transactions: React.FC<TransactionsProps> = ({ list }) => (
    <ul>
      {list.map((tx) => (
        <li key={tx.hash}>
          <span>{tx.hash}</span> - <span>{tx.status}</span>
        </li>
      ))}
    </ul>
  );
  
