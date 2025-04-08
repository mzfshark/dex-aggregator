// src/components/Alert.tsx

import React from 'react';

export interface AlertProps {
  message: string;
  type: 'success' | 'danger' | 'warning' | 'info'; // Bootstrap types
  onClose?: () => void;
  transactionHash?: string | null;
}

const Alert: React.FC<AlertProps> = ({ message, type, onClose, transactionHash }) => {
  return (
    <div className={`alert alert-${type} alert-dismissible`} role="alert">
      <div>{message}</div>

      {transactionHash && (
        <div>
          <a
            href={`https://etherscan.io/tx/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-light text-decoration-underline"
          >
            View on Etherscan
          </a>
        </div>
      )}

      {onClose && (
        <button
          type="button"
          className="btn-close"
          onClick={onClose}
          aria-label="Close"
        ></button>
      )}
    </div>
  );
};

export default Alert;


