// components/Alert.tsx
import React from "react";
import { Alert as BootstrapAlert } from "react-bootstrap";

type AlertProps = {
  message: string;
  transactionHash?: string;
  variant: "success" | "danger" | "warning" | "info";
  setShowAlert: (show: boolean) => void;
};

const Alert: React.FC<AlertProps> = ({ message, transactionHash, variant, setShowAlert }) => {
  return (
    <BootstrapAlert variant={variant} onClose={() => setShowAlert(false)} dismissible className="alert">
      <BootstrapAlert.Heading>{message}</BootstrapAlert.Heading>
      <hr />
      {transactionHash && (
        <div className="transaction-details">
          <strong>Transaction Hash:</strong>
          <span>
            {transactionHash.slice(0, 6) + "..." + transactionHash.slice(-6)}
          </span>
        </div>
      )}
    </BootstrapAlert>
  );
};

export default Alert;
