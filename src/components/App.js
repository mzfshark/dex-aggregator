// src/components/App.js
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Container } from "react-bootstrap";
import styles from "../styles/App.module.css";

// Components
import Navigation from "./Navigation";
import Transactions from "./Transactions";
import Swap from "./Swap";

// Interactions
import { loadTokens } from "../store/interactions";

function App() {
  const dispatch = useDispatch();
  const provider = useSelector(state => state.provider.connection);

  useEffect(() => {
    if (provider) {
      loadTokens(dispatch, provider);
    }
  }, [provider, dispatch]);

  return (
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
  );
}

export default App;
