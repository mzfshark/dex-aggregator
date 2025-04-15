// src/components/Swap.js
import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import Dropdown from "react-bootstrap/Dropdown";
import Spinner from "react-bootstrap/Spinner";
import { ethers } from "ethers";

import Alert from "./Alert";
import { swap, loadAccount } from "../store/interactions";
import {
  Container,
  InputField,
  SwapContainer,
  TokenInfoContainer,
  StyledDropdown,
  SwapButton,
  ExchangeRateText,
} from "../styles/StyledComponents";
// Use apenas o hook do contexto para obter a conta conectada
import { useContract } from "./ContractContext";

const Swap = () => {
  console.log("Swap component re-rendered");
  const { aggregator, account, provider } = useContract(); // aqui usamos a conta e provider do contexto
  const [inputToken, setInputToken] = useState(null);
  const [outputToken, setOutputToken] = useState(null);
  const [inputAmount, setInputAmount] = useState(0);
  const [outputAmount, setOutputAmount] = useState(0);
  const [bestDeal, setBestDeal] = useState(null);
  const [router, setRouter] = useState(null);
  const [path, setPath] = useState([]);
  const [price, setPrice] = useState(0);
  const [showAlert, setShowAlert] = useState(false);

  // Remova ou comente esta linha se você optar por usar o context:
  // const accountRedux = useSelector((state) => state.provider.account);

  // Se ainda precisar usar Redux para outras coisas, mantenha os demais selectors.
  const dispatch = useDispatch();
  const symbols = useSelector((state) => state.tokens.symbols);
  
  // Função para conectar carteira via Redux (se continuar usando) ou via context
  const connectHandler = async () => {
    // Se estiver usando o ContractContext, a conexão já ocorre automaticamente
    // Caso contrário, você pode disparar aqui uma ação para conectar a carteira
    await loadAccount(dispatch);
  };

  const swapHandler = async (e) => {
    e.preventDefault();

    if (inputToken === outputToken) {
      window.alert("Invalid Token Pair");
      return;
    }

    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    const slippage = 0;

    console.log(provider, path, router, inputAmount, bestDeal, slippage, deadline);

    await swap(provider, { aggregator, account }, path, router, inputAmount, bestDeal, slippage, deadline, dispatch);

    setShowAlert(true);
  };

  const getPrice = useCallback(async () => {
    console.log("getPrice/inputAmount", inputAmount);
    if (inputToken === outputToken) {
      setPrice(0);
      return;
    }
    if (inputAmount === "0") {
      setPrice("N/A");
      return;
    }
    if (outputAmount && inputAmount) {
      const computedPrice = Number(bestDeal) / Number(inputAmount);
      setPrice(computedPrice.toString());
    }
  }, [inputAmount, inputToken, outputToken, outputAmount, bestDeal]);

  useEffect(() => {
    getPrice();
  }, [getPrice]);

  const handleTokenSelection = (type, token) => {
    if (type === "input") {
      setInputToken(token);
    } else {
      setOutputToken(token);
    }
    if (inputToken && outputToken && inputToken !== outputToken) {
      setPath([symbols.get(inputToken), symbols.get(outputToken)]);
    }
    if (inputToken && outputToken && inputToken === outputToken) {
      setPath([]);
    }
  };

  const handleInputChange = async (e) => {
    if (!e.target.value) {
      setOutputAmount("0");
      setInputAmount("0");
      return;
    }
    const enteredAmount = ethers.parseEther(e.target.value.toString());
    setInputAmount(enteredAmount.toString());

    if (!inputToken || !outputToken) {
      alert("Please select both input and output tokens.");
      return;
    }

    if (inputToken === outputToken) {
      alert("Input and output tokens cannot be the same");
      return;
    }
  };

  useEffect(() => {
    if (inputToken && outputToken && inputToken !== outputToken) {
      setPath([symbols.get(inputToken), symbols.get(outputToken)]);
    } else if (inputToken && outputToken && inputToken === outputToken) {
      setPath([]);
    }
  }, [inputToken, outputToken, symbols]);

  useEffect(() => {
    const fetchBestDeal = async () => {
      if (path.length === 2 && inputAmount) {
        const fetchBestDealResult = await aggregator.getBestAmountsOutOnUniswapForks(path, inputAmount);
        setBestDeal(fetchBestDealResult[0]);
        setRouter(fetchBestDealResult[1]);
        let calculatedOutputAmount = ethers.formatUnits(fetchBestDealResult[0], 18);
        setOutputAmount(parseFloat(calculatedOutputAmount).toFixed(2));
      }
    };
    if (aggregator) {
      fetchBestDeal();
    }
  }, [path, inputAmount, aggregator]);

  return (
    <Container>
      <SwapContainer>
        <TokenInfoContainer>
          <InputField
            type="text"
            placeholder="0"
            min="0.0"
            onChange={handleInputChange}
            disabled={!outputToken || !inputToken}
          />
          <StyledDropdown onSelect={(token) => handleTokenSelection("input", token)}>
            <Dropdown.Toggle>
              {inputToken ? inputToken : "Select token"}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {Array.from(symbols).map(([symbol, address]) => (
                <Dropdown.Item key={address} eventKey={symbol}>
                  {symbol}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </StyledDropdown>
        </TokenInfoContainer>

        <TokenInfoContainer>
          <InputField
            type="text"
            placeholder="0"
            min="0.0"
            value={outputAmount === 0 ? "" : outputAmount}
            disabled={true}
          />
          <StyledDropdown onSelect={(token) => handleTokenSelection("output", token)}>
            <Dropdown.Toggle>
              {outputToken ? outputToken : "Select token"}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {Array.from(symbols).map(([symbol, address]) => (
                <Dropdown.Item key={address} eventKey={symbol}>
                  {symbol}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </StyledDropdown>
        </TokenInfoContainer>

        <ExchangeRateText>Exchange Rate: {price}</ExchangeRateText>

        {account ? (
          <div>
            { /* Se a wallet estiver conectada (pelo contexto), exibe o swap */ }
            <SwapButton onClick={swapHandler}>Swap</SwapButton>
          </div>
        ) : (
          <SwapButton onClick={connectHandler}>Connect Wallet</SwapButton>
        )}
      </SwapContainer>
      {/* Exibição de alertas omitida para foco na conexão */}
    </Container>
  );
};

export default Swap;
