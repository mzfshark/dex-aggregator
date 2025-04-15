// src/components/Alert.js
import React from 'react';

const Alert = ({ type, message, onClose }) => {
  if (!message) return null;

  return (
    <div className={`alert alert-${type || 'info'}`} role="alert">
      {message}
      {onClose && (
        <button type="button" className="close" onClick={onClose}>
          <span>&times;</span>
        </button>
      )}
    </div>
  );
};

export default Alert;
