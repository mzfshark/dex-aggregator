// src/components/Swap.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import Dropdown from "react-bootstrap/Dropdown";
import { ethers } from "ethers";

import Alert from "./Alert";
import { swap, loadAccount, loadTokens } from "../store/interactions";
import {
  Container,
  InputField,
  SwapContainer,
  TokenInfoContainer,
  StyledDropdown,
  SwapButton,
  ExchangeRateText,
} from "../styles/StyledComponents";
import { useContract } from "./ContractContext";

const Swap = () => {
  console.log("Swap component re-rendered");
  const { aggregator, account, provider } = useContract();
  const dispatch = useDispatch();

  // Obtenha a lista de tokens do Redux
  const tokenListRaw = useSelector((state) => state.tokens.tokens);
  // Use useMemo para garantir que o array seja estável nas dependências
  const tokenList = useMemo(() => tokenListRaw || [], [tokenListRaw]);

  const [inputToken, setInputToken] = useState(null);
  const [outputToken, setOutputToken] = useState(null);
  const [inputAmount, setInputAmount] = useState(0);
  const [outputAmount, setOutputAmount] = useState(0);
  const [bestDeal, setBestDeal] = useState(null);
  const [router, setRouter] = useState(null);
  const [path, setPath] = useState([]);
  const [price, setPrice] = useState(0);
  const [showAlert, setShowAlert] = useState(false);

  // Dispara o carregamento da lista de tokens quando o componente for montado
  useEffect(() => {
    if (provider && tokenList.length === 0) {
      dispatch(loadTokens(provider));
    }
  }, [dispatch, provider, tokenList]);

  const connectHandler = async () => {
    await loadAccount(dispatch);
  };

  const swapHandler = async (e) => {
    e.preventDefault();
    if (!inputToken || !outputToken) {
      window.alert("Por favor, selecione os tokens de entrada e saída.");
      return;
    }
    if (inputToken.symbol === outputToken.symbol) {
      window.alert("Os tokens de entrada e saída não podem ser iguais.");
      return;
    }
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    const slippage = 0; // Ajuste conforme sua lógica

    console.log("Dados do swap:", provider, path, router, inputAmount, bestDeal, slippage, deadline);

    await swap(
      provider,
      { aggregator, account },
      path,
      router,
      inputAmount,
      bestDeal,
      slippage,
      deadline,
      dispatch
    );
    setShowAlert(true);
  };

  const getPrice = useCallback(async () => {
    if (inputToken && outputToken && inputAmount && outputAmount) {
      const computedPrice = Number(bestDeal) / Number(inputAmount);
      setPrice(computedPrice.toString());
    } else {
      setPrice("N/A");
    }
  }, [inputAmount, inputToken, outputToken, bestDeal, outputAmount]);

  useEffect(() => {
    getPrice();
  }, [getPrice]);

  useEffect(() => {
    if (inputToken && outputToken && inputToken.symbol !== outputToken.symbol) {
      setPath([inputToken.address, outputToken.address]);
    } else {
      setPath([]);
    }
  }, [inputToken, outputToken]);

  const handleInputChange = async (e) => {
    if (!e.target.value) {
      setOutputAmount("0");
      setInputAmount("0");
      return;
    }
    const enteredAmount = ethers.parseEther(e.target.value.toString());
    setInputAmount(enteredAmount.toString());

    if (!inputToken || !outputToken) {
      alert("Selecione ambos os tokens de entrada e saída.");
      return;
    }
  };

  const handleTokenSelection = (type, symbol) => {
    const token = tokenList.find((t) => t.symbol === symbol);
    if (!token) return;
    if (type === "input") {
      setInputToken(token);
    } else {
      setOutputToken(token);
    }
  };

  useEffect(() => {
    const fetchBestDeal = async () => {
      if (path.length === 2 && inputAmount && aggregator) {
        try {
          const fetchBestDealResult = await aggregator.getBestAmountsOutOnUniswapForks(path, inputAmount);
          setBestDeal(fetchBestDealResult[0]);
          setRouter(fetchBestDealResult[1]);
          const calculatedOutputAmount = ethers.formatUnits(fetchBestDealResult[0], 18);
          setOutputAmount(parseFloat(calculatedOutputAmount).toFixed(2));
        } catch (error) {
          console.error("Erro ao buscar a melhor oferta:", error);
        }
      }
    };
    fetchBestDeal();
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
            disabled={!inputToken || !outputToken}
          />
          <StyledDropdown onSelect={(symbol) => handleTokenSelection("input", symbol)}>
            <Dropdown.Toggle>
              {inputToken ? inputToken.symbol : "Select"}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {tokenList.map((token) => (
                <Dropdown.Item key={token.address} eventKey={token.symbol}>
                  {token.symbol} – {token.name}
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
            disabled
          />
          <StyledDropdown onSelect={(symbol) => handleTokenSelection("output", symbol)}>
            <Dropdown.Toggle>
              {outputToken ? outputToken.symbol : "Select"}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {tokenList.map((token) => (
                <Dropdown.Item key={token.address} eventKey={token.symbol}>
                  {token.symbol} – {token.name}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </StyledDropdown>
        </TokenInfoContainer>

        <ExchangeRateText>Exchange Rate: {price}</ExchangeRateText>

        {account ? (
          <SwapButton onClick={swapHandler}>Swap</SwapButton>
        ) : (
          <SwapButton onClick={connectHandler}>Connect Wallet</SwapButton>
        )}
      </SwapContainer>
      {showAlert && (
        <Alert
          message={bestDeal ? "Swap realizado com sucesso" : "Swap falhou"}
          transactionHash={bestDeal ? null : ""}
          variant={bestDeal ? "success" : "danger"}
          setShowAlert={setShowAlert}
        />
      )}
    </Container>
  );
};

export default Swap;
