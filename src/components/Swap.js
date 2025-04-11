// src/components/Swap.js
import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ethers } from "ethers";
import Dropdown from "react-bootstrap/Dropdown";
import Spinner from "react-bootstrap/Spinner";

import { useContracts } from "./ContractContext";
import Alert from "./Alert";
import { getTokensByChainId } from "../utils/loadTokens";
import { fetchOraclePrice } from "../utils/fetchOraclePrice";
import { loadTokens } from "../store/tokens";
import { loadAccount, swap, getBestSwapRoute } from "../store/interactions";
import { getTokenPrice } from "../utils/fetchTokenPrice";

import {
  Container,
  InputField,
  SwapContainer,
  TokenInfoContainer,
  StyledDropdown,
  SwapButton,
  ExchangeRateText,
  TokenActionsRow,
  LabelText,
  InputWrapper,
  MaxButton,
  InputSlipageField,
  BalanceText,
  SwapDirectionText,
} from "../styles/StyledComponents";

// Utilitário local
const truncateDecimals = (value, digits = 4) => {
  if (!value || typeof value !== "string") return "0";
  const [intPart, decPart] = value.split(".");
  return decPart ? `${intPart}.${decPart.slice(0, digits)}` : intPart;
};

const Swap = () => {
  const { account, contracts, provider, chainId } = useContracts();
  const dispatch = useDispatch();

  const symbols = useSelector((state) => state.tokens.symbols);
  const aggregatorState = useSelector((state) => state.aggregator[chainId] || { swapping: {} });

  const [inputToken, setInputToken] = useState(null);
  const [outputToken, setOutputToken] = useState(null);
  const [inputAmount, setInputAmount] = useState(0n);
  const [outputAmount, setOutputAmount] = useState("0");
  const [balances, setBalances] = useState(new Map());
  const [bestDeal, setBestDeal] = useState(0n);
  const [router, setRouter] = useState(null);
  const [path, setPath] = useState([]);
  const [routeSymbols, setRouteSymbols] = useState([]);
  const [price, setPrice] = useState("0");
  const [slippage, setSlippage] = useState("0.5");
  const [showAlert, setShowAlert] = useState(false);
  const [oraclePrice, setOraclePrice] = useState(null);

  const { isSwapping, isSuccess, transactionHash } = aggregatorState.swapping || {};
  const slippageBps = Math.floor(parseFloat(slippage) * 100);

  // Carrega lista de tokens
  useEffect(() => {
    const init = async () => {
      if (!provider || !chainId || !account) return;
      try {
        const tokenList = getTokensByChainId(chainId);
        await loadTokens(provider, tokenList, dispatch);
      } catch (err) {
        console.error("Erro ao carregar tokens:", err);
      }
    };
    init();
  }, [provider, chainId, account, dispatch]);

  // Atualiza saldo do token selecionado
  const fetchBalance = useCallback(async () => {
    if (!account || !symbols || symbols.size === 0) return;
  
    const newBalances = new Map();
  
    for (const [symbol, contract] of symbols.entries()) {
      try {
        const raw = await contract.balanceOf(account);
        const decimals = await contract.decimals();
        const formatted = ethers.formatUnits(raw, decimals);
        newBalances.set(symbol, truncateDecimals(formatted, 4));
      } catch (err) {
        console.error(`Erro ao buscar saldo do token ${symbol}`, err);
        newBalances.set(symbol, "0");
      }
    }
  
    setBalances(newBalances);
  }, [account, symbols]);
  
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);
  
  // Seleção de tokens
  const handleTokenSelection = (type, token) => {
    if (type === "input") setInputToken(token);
    else setOutputToken(token);
  };

  const useMaxAmount = async () => {
    const contract = symbols.get(inputToken);
    if (!contract || !account) return;
    try {
      const rawBalance = await contract.balanceOf(account);
      const decimals = await contract.decimals();
      setInputAmount(rawBalance);
      document.getElementById("input-amount").value = ethers.formatUnits(rawBalance, decimals);
    } catch (err) {
      console.error("Erro ao definir valor máximo:", err);
    }
  };

  const handleInputChange = async (e) => {
    const val = e.target.value.trim();
    if (!val || isNaN(val)) {
      setInputAmount(0n);
      setOutputAmount("0");
      return;
    }

    const tokenAddress = symbols.get(inputToken);
    const contract = contracts[tokenAddress];
    if (!contract) return;

    try {
      const decimals = await contract.decimals();
      const parsed = ethers.parseUnits(val, decimals);
      setInputAmount(parsed);
    } catch (err) {
      console.error("Erro ao interpretar valor de entrada:", err);
      setInputAmount(0n);
    }
  };

  // Inverter tokens
  const swapTokens = () => {
    setInputToken(outputToken);
    setOutputToken(inputToken);
    setInputAmount(0n);
    setOutputAmount("0");
    setRouteSymbols([]);
  };

  // Atualiza path direto (2 tokens)
  useEffect(() => {
    if (inputToken && outputToken && inputToken !== outputToken) {
      const from = symbols.get(inputToken);
      const to = symbols.get(outputToken);
      if (from && to) setPath([from, to]);
    } else {
      setPath([]);
    }
  }, [inputToken, outputToken, symbols]);
  
  // prices from oracle
  useEffect(() => {
    if (inputToken && outputToken && provider) {
      fetchOraclePrice(provider, inputToken, "USDC").then((oraclePrice) => {
        if (oraclePrice !== null) setOraclePrice(oraclePrice);
      });      
    }
  }, [inputToken, outputToken, provider]);
  
  
  // Busca rota ideal de swap
  useEffect(() => {
    const fetchRoute = async () => {
      if (Array.isArray(path) && path.length >= 2 && inputAmount > 0n) {
        try {
          const { amountOut, router, fullPath } = await getBestSwapRoute(contracts.aggregator, path, inputAmount);
          setBestDeal(amountOut);
          setRouter(router);
          setPath(fullPath);

          const formatted = ethers.formatUnits(amountOut, 18);
          setOutputAmount(truncateDecimals(formatted, 4));

          const symbolPath = fullPath.map((addr) =>
            [...symbols].find(([, contract]) => contract.target === addr)?.[0] || addr
          );
          setRouteSymbols(symbolPath);
        } catch (err) {
          console.error("Erro ao buscar melhor rota:", err);
          setBestDeal(0n);
          setOutputAmount("0");
          setRouteSymbols([]);
        }
      }
    };

    fetchRoute();
  }, [path, inputAmount, contracts, symbols]);

  useEffect(() => {
    const updatePrice = async () => {
      if (
        !inputToken || !outputToken || inputAmount === 0n || inputToken === outputToken ||
        !symbols.has(inputToken) || !symbols.has(outputToken)
      ) {
        setPrice("0");
        return;
      }
  
      try {
        const inputContract = symbols.get(inputToken);
        const outputContract = symbols.get(outputToken);
  
        const inputDecimals = await inputContract.decimals();
        const outputDecimals = await outputContract.decimals();
  
        const rate = getTokenPrice(inputAmount, bestDeal, inputDecimals, outputDecimals, 6);
        setPrice(rate);
      } catch (err) {
        console.error("Erro ao calcular taxa de conversão:", err);
        setPrice("0");
      }
    };
  
    updatePrice();
  }, [inputToken, outputToken, inputAmount, bestDeal, symbols]);
  
  

  // Execução do swap
  const swapHandler = async (e) => {
    e.preventDefault();
    if (!inputToken || !outputToken || inputToken === outputToken || path.length < 2) {
      alert("Selecione um par de tokens válido.");
      return;
    }

    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    const slippageAmount = parseFloat(slippage);
    const slippageTolerance = Math.floor(Number(bestDeal) * (100 - slippageAmount) / 100);

    await swap(
      provider,
      contracts,
      path,
      router,
      inputAmount.toString(),
      slippageTolerance.toString(),
      slippageAmount,
      slippageBps,
      deadline,
      dispatch
    );

    setShowAlert(true);
    fetchBalance();
  };

  return (
    <Container>
      <SwapContainer>
        {/* INPUT */}
        <TokenInfoContainer>
          <InputWrapper>
            <InputField
              id="input-amount"
              type="text"
              placeholder="0"
              onChange={handleInputChange}
              disabled={!inputToken || !outputToken}
            />
            <MaxButton onClick={useMaxAmount}>Max</MaxButton>
          </InputWrapper>

          <StyledDropdown onSelect={(token) => handleTokenSelection("input", token)}>
            <Dropdown.Toggle>{inputToken || "Select token"}</Dropdown.Toggle>
            <Dropdown.Menu>
              {symbols && Array.from(symbols).map(([symbol]) => (
                <Dropdown.Item key={symbol} eventKey={symbol}>
                  {symbol} — {balances.get(symbol) || "0"}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </StyledDropdown>
        </TokenInfoContainer>
        {oraclePrice && (  
          <BalanceText>
            <strong>Value:</strong> 1 {inputToken} ≈ {oraclePrice.toFixed(4)} USDC
          </BalanceText>
        )}

        <SwapDirectionText onClick={swapTokens}>⮂</SwapDirectionText>

        {/* OUTPUT */}
        <TokenInfoContainer>
          <InputWrapper>
            <InputField type="text" placeholder="0" value={outputAmount} disabled />
          </InputWrapper>

          <StyledDropdown onSelect={(token) => handleTokenSelection("output", token)}>
            <Dropdown.Toggle>{outputToken || "Select token"}</Dropdown.Toggle>
            <Dropdown.Menu>
              {symbols && Array.from(symbols).map(([symbol]) => (
                <Dropdown.Item key={symbol} eventKey={symbol}>
                  {symbol} — {balances.get(symbol) || "0"}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </StyledDropdown>
        </TokenInfoContainer>

        <ExchangeRateText>Exchange Rate: {price}</ExchangeRateText>

        <TokenActionsRow>
          <LabelText>Slippage (%)</LabelText>
          <InputSlipageField
            type="number"
            min="0"
            step="0.1"
            value={slippage}
            onChange={(e) => setSlippage(e.target.value)}
            style={{ maxWidth: "80px" }}
          />
        </TokenActionsRow>

        {routeSymbols.length > 1 && (
          <ExchangeRateText>Route: {routeSymbols.join(" → ")}</ExchangeRateText>
        )}

        {/* BOTÃO DE SWAP */}
        {account ? (
          isSwapping ? (
            <SwapButton disabled>
              <Spinner animation="grow" size="sm" /> Swapping ...
            </SwapButton>
          ) : (
            <SwapButton onClick={swapHandler}>Swap</SwapButton>
          )
        ) : (
          <SwapButton onClick={() => loadAccount(dispatch)}>Connect Wallet</SwapButton>
        )}
      </SwapContainer>

      {/* ALERTAS */}
      {isSwapping ? (
        <Alert message="Swap pending..." variant="info" setShowAlert={setShowAlert} />
      ) : isSuccess && showAlert ? (
        <Alert
          message="Swap Successful"
          transactionHash={transactionHash}
          variant="success"
          setShowAlert={setShowAlert}
        />
      ) : !isSuccess && showAlert ? (
        <Alert message="Swap Failed" variant="danger" setShowAlert={setShowAlert} />
      ) : null}
    </Container>
  );
};

export default Swap;
