import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import { ContractsProvider } from "./ContractContext";
import styles from "../styles/App.module.css";

import Navigation from "./Navigation";
import Transactions from "./Transactions";
import Swap from "./Swap";

const App: React.FC = () => {
  return (
    <ContractsProvider>
      <Container fluid className={styles.container}>
        <Router>
          <Navigation />
          <Routes>
            <Route path="/swap" element={<Swap />} />
            <Route path="/trx" element={<Transactions />} />
            <Route path="*" element={<Navigate to="/swap" />} />
          </Routes>
        </Router>
      </Container>
    </ContractsProvider>
  );
};

export default App;
