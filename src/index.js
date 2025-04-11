// index.js
import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.css";
import "./styles/GlobalStyles.css";
import App from "./components/App";
import reportWebVitals from "./reportWebVitals";

import { Provider } from "react-redux";
import { store } from "./store/store";

import { ContractProvider } from "./components/ContractContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <ContractProvider> 
      <App />
    </ContractProvider>
  </Provider>
);

// Optional performance logging
reportWebVitals();
