interface Transaction {
    hash: string;
    status: string;
    timestamp: number;
  }
  
  interface TransactionsProps {
    list: any[]; // Ajuste o tipo real depois
  }
  
  const Transactions: React.FC<TransactionsProps> = ({ list }) => {
    return (
    <ul>
      {list.map((tx) => (
        <li key={tx.hash}>
          <span>{tx.hash}</span> - <span>{tx.status}</span>
        </li>
      ))}
    </ul>
  );
};
  export default Transactions;
