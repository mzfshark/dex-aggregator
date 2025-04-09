import React, { useState, useEffect, useContext, useCallback } from "react";
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
  TokenActionsRow,
  LabelText,
  ActionText,           
  SwapDirectionText    
} from "../styles/StyledComponents";
import { ContractsContext } from "./ContractContext";

const Swap = () => {
  const contracts = useContext(ContractsContext);

  const [inputToken, setInputToken] = useState(null);
  const [outputToken, setOutputToken] = useState(null);
  const [inputAmount, setInputAmount] = useState(0n);
  const [outputAmount, setOutputAmount] = useState("0");
  const [balance, setBalance] = useState("0");
  const [bestDeal, setBestDeal] = useState(0n);
  const [router, setRouter] = useState(null);
  const [path, setPath] = useState([]);
  const [price, setPrice] = useState("0");
  const [slippage, setSlippage] = useState("0.5"); // default 0.5%
  const [showAlert, setShowAlert] = useState(false);

  const provider = useSelector((state) => state.provider.connection);
  const account = useSelector((state) => state.provider.account);
  const chainId = useSelector((state) => state.provider.chainId);
  const aggregatorState = useSelector((state) => state.aggregator[chainId] || { swapping: {} });
  const symbols = useSelector((state) => state.tokens.symbols);

  const isSwapping = aggregatorState.swapping?.isSwapping;
  const isSuccess = aggregatorState.swapping?.isSuccess;
  const transactionHash = aggregatorState.swapping?.transactionHash;

  const dispatch = useDispatch();

  const connectHandler = async () => {
    await loadAccount(dispatch);
  };

  const swapHandler = async (e) => {
    e.preventDefault();
    if (!inputToken || !outputToken || inputToken === outputToken) {
      window.alert("Invalid Token Pair");
      return;
    }

    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    const slippageAmount = parseFloat(slippage);
    const slippageTolerance = Math.floor((Number(bestDeal) * (100 - slippageAmount)) / 100);

    await swap(
      provider,
      contracts,
      path,
      router,
      inputAmount.toString(),
      slippageTolerance.toString(),
      slippageAmount,
      deadline,
      dispatch,
    );

    setShowAlert(true);
  };

  const getPrice = useCallback(() => {
    if (
      !inputToken ||
      !outputToken ||
      inputToken === outputToken ||
      inputAmount === 0n
    ) {
      setPrice("0");
      return;
    }

    try {
      const rate = (bestDeal * 10n ** 18n) / inputAmount;
      const formattedRate = ethers.formatUnits(rate, 18);
      setPrice(formattedRate);
    } catch (err) {
      setPrice("0");
    }
  }, [inputToken, outputToken, inputAmount, bestDeal]);

  useEffect(() => {
    getPrice();
  }, [getPrice]);

  const fetchBalance = useCallback(async () => {
    if (!account || !inputToken) return;
  
    try {
      const contract = contracts[inputToken.toLowerCase()];
      const rawBalance = await contract.balanceOf(account);
      const decimals = await contract.decimals();
      const formatted = ethers.formatUnits(rawBalance, decimals);
      setBalance(parseFloat(formatted).toFixed(4));
    } catch (err) {
      console.error("Error loading balance", err);
      setBalance("0");
    }
  }, [account, inputToken, contracts]); // certifique-se que `contracts` está estável
  
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);
  

  const useMaxAmount = async () => {
    if (!inputToken || !account) return;

    try {
      const contract = contracts[inputToken.toLowerCase()];
      const rawBalance = await contract.balanceOf(account);
      const decimals = await contract.decimals();
      setInputAmount(rawBalance);
      const formatted = ethers.formatUnits(rawBalance, decimals);
      document.getElementById("input-amount").value = formatted;
    } catch (err) {
      console.error("Error setting max amount", err);
    }
  };

  const handleTokenSelection = (type, token) => {
    if (type === "input") setInputToken(token);
    else setOutputToken(token);
  };

  const handleInputChange = async (e) => {
    const val = e.target.value.trim();

    if (!val || isNaN(val)) {
      setInputAmount(0n);
      setOutputAmount("0");
      return;
    }

    if (!inputToken || !outputToken || inputToken === outputToken) {
      alert("Invalid token pair.");
      return;
    }

    const contractKey = inputToken.toLowerCase();
    const contract = contracts[contractKey];

    try {
      const decimals = await contract.decimals();
      const parsedAmount = ethers.parseUnits(val, decimals);
      setInputAmount(parsedAmount);
    } catch (err) {
      console.error("Error parsing input amount:", err);
      setInputAmount(0n);
    }
  };

  const swapTokens = () => {
    const temp = inputToken;
    setInputToken(outputToken);
    setOutputToken(temp);
    setInputAmount(0n);
    setOutputAmount("0");
  };

  useEffect(() => {
    if (inputToken && outputToken && inputToken !== outputToken) {
      setPath([symbols.get(inputToken), symbols.get(outputToken)]);
    } else {
      setPath([]);
    }
  }, [inputToken, outputToken, symbols]);

  useEffect(() => {
    const fetchBestDeal = async () => {
      if (path.length === 2 && inputAmount > 0n) {
        try {
          const [amountOut, selectedRouter] =
            await contracts.aggregator.getBestAmountsOutOnUniswapForks(
              path,
              inputAmount.toString(),
            );

          setBestDeal(BigInt(amountOut));
          setRouter(selectedRouter);

          const formatted = ethers.formatUnits(amountOut, 18);
          setOutputAmount(parseFloat(formatted).toFixed(4));
        } catch (error) {
          console.error("Error fetching best deal:", error);
          setBestDeal(0n);
          setOutputAmount("0");
        }
      }
    };
    fetchBestDeal();
  }, [path, inputAmount, contracts.aggregator]);

  return (
    <Container>
      <SwapContainer>
        <TokenInfoContainer>
          <InputField
            id="input-amount"
            type="text"
            placeholder="0"
            onChange={handleInputChange}
            disabled={!outputToken || !inputToken}
          />
          <StyledDropdown
            onSelect={(token) => handleTokenSelection("input", token)}
          >
            <Dropdown.Toggle>{inputToken || "Select token"}</Dropdown.Toggle>
            <Dropdown.Menu>
              {symbols && Array.from(symbols).map(([symbol, address]) => (
                <Dropdown.Item key={address} eventKey={symbol}>
                  {symbol}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </StyledDropdown>
          <TokenActionsRow>
            <LabelText>Balance: {balance}</LabelText>
            <ActionText onClick={useMaxAmount}>Use Max Amount</ActionText> {/* ← modificado */}
          </TokenActionsRow>
        </TokenInfoContainer>
  
        <SwapDirectionText onClick={swapTokens}>Swap Tokens ⮂</SwapDirectionText> {/* ← modificado */}
  
        <TokenInfoContainer>
          <InputField
            type="text"
            placeholder="0"
            value={outputAmount === "0" ? "" : outputAmount}
            disabled
          />
          <StyledDropdown
            onSelect={(token) => handleTokenSelection("output", token)}
          >
            <Dropdown.Toggle>{outputToken || "Select token"}</Dropdown.Toggle>
            <Dropdown.Menu>
              {symbols && Array.from(symbols).map(([symbol, address]) => (
                <Dropdown.Item key={address} eventKey={symbol}>
                  {symbol}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </StyledDropdown>
        </TokenInfoContainer>
  
        <ExchangeRateText>Exchange Rate: {price}</ExchangeRateText>
  
        <TokenActionsRow>
          <LabelText>Slippage (%)</LabelText>
          <InputField
            type="number"
            min="0"
            step="0.1"
            value={slippage}
            onChange={(e) => setSlippage(e.target.value)}
            style={{ maxWidth: "80px" }}
          />
        </TokenActionsRow>
  
        {account ? (
          isSwapping ? (
            <SwapButton variant="primary" disabled>
              <Spinner animation="grow" size="sm" /> Swapping ...
            </SwapButton>
          ) : (
            <SwapButton onClick={swapHandler}>Swap</SwapButton>
          )
        ) : (
          <SwapButton onClick={connectHandler}>Connect Wallet</SwapButton>
        )}
      </SwapContainer>
  
      {isSwapping ? (
        <Alert
          message="Swap pending..."
          transactionHash={null}
          variant="info"
          setShowAlert={setShowAlert}
        />
      ) : isSuccess && showAlert ? (
        <Alert
          message="Swap Successful"
          transactionHash={transactionHash}
          variant="success"
          setShowAlert={setShowAlert}
        />
      ) : !isSuccess && showAlert ? (
        <Alert
          message="Swap Failed"
          transactionHash={null}
          variant="danger"
          setShowAlert={setShowAlert}
        />
      ) : null}
    </Container>
  );
};

export default Swap;
