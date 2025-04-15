// src/components/Transactions.js
import React, { useState, useEffect } from 'react';
import { useContract } from './ContractContext';
import Loading from './Loading';

const Transactions = () => {
  const { aggregator, loading } = useContract();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!aggregator) return;
    // Cria o filtro para o evento Swap (sem filtrar parâmetros)
    const filter = aggregator.filters.Swap(null, null, null, null, null);
    aggregator.on(filter, (router, path, amountIn, to, feePercent, event) => {
      const swapEvent = {
        router,
        path,
        amountIn: amountIn.toString(),
        to,
        feePercent: feePercent.toString(),
        transactionHash: event.transactionHash,
      };
      setTransactions(prev => [swapEvent, ...prev]);
    });

    // Remove o listener quando o componente for desmontado
    return () => {
      aggregator.removeAllListeners(filter);
    };
  }, [aggregator]);

  if (loading) return <Loading />;

  return (
    <div>
      <h2>Transações Recentes</h2>
      {transactions.length === 0 ? (
        <p>Nenhuma transação encontrada.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Router</th>
              <th>Caminho</th>
              <th>Amount In</th>
              <th>Destinatário</th>
              <th>Fee Percent</th>
              <th>Tx Hash</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => (
              <tr key={index}>
                <td>{tx.router}</td>
                <td>{tx.path.join(' > ')}</td>
                <td>{tx.amountIn}</td>
                <td>{tx.to}</td>
                <td>{tx.feePercent}</td>
                <td>
                  <a href={`https://etherscan.io/tx/${tx.transactionHash}`} target="_blank" rel="noopener noreferrer">
                    {tx.transactionHash.slice(0, 10)}...
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Transactions;

