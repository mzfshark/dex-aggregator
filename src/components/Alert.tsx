import React from 'react';

interface AlertProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, type, onClose }) => {
  return (
    <div className={`alert alert-${type}`}>
      {message}
      {onClose && <button onClick={onClose}>x</button>}
    </div>
  );
};

export default Alert;
