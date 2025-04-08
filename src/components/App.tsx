import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { ContractsProvider } from "./ContractContext";
import {
  Container,
  SwapContainer,
  TokenInfoContainer,
  TokenSelector,
  TokenText
} from '../styles/StyledComponents';

import Navigation from "./Navigation";
import Transactions from "./Transactions";
import Swap from "./Swap";

const App: React.FC = () => {
  return (
    <ContractsProvider>
      <Container>
        <Router>
          <Navigation />
          <Routes>
            <Route path="/swap" element={<Swap />} />
            <Route path="/trx" element={<Transactions list={[]} />} />
            <Route path="*" element={<Navigate to="/swap" />} />
          </Routes>
        </Router>
      </Container>
    </ContractsProvider>
  );
};

export default App;
