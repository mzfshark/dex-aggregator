import React, { useState, useEffect, useContext, FormEvent, ChangeEvent } from "react";
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
import { useContracts } from "../contexts/ContractContext";
import { RootState } from "../store"; // <- Ajuste conforme sua tipagem de Redux

const Swap = () => {
  const { aggregator } = useContracts();

  const [inputToken, setInputToken] = useState<string | null>(null);
  const [outputToken, setOutputToken] = useState<string | null>(null);
  const [inputAmount, setInputAmount] = useState<string>("0");
  const [outputAmount, setOutputAmount] = useState<string>("0");
  const [bestDeal, setBestDeal] = useState<string>("0");
  const [router, setRouter] = useState<string | null>(null);
  const [path, setPath] = useState<string[]>([]);
  const [price, setPrice] = useState<string>("0");
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const provider = useSelector((state: RootState) => state.provider.connection);
  const account = useSelector((state: RootState) => state.provider.account);
  const isSwapping = useSelector((state: RootState) => state.aggregator.swapping.isSwapping);
  const isSuccess = useSelector((state: RootState) => state.aggregator.swapping.isSuccess);
  const transactionHash = useSelector((state: RootState) => state.aggregator.swapping.transactionHash);
  const symbols = useSelector((state: RootState) => state.tokens.symbols);

  const dispatch = useDispatch();

  const connectHandler = async () => {
    await loadAccount(dispatch);
  };

  const swapHandler = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputToken || !outputToken || inputToken === outputToken) {
      window.alert("Invalid Token Pair");
      return;
    }

    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    const slippage = 0;

    await swap(
      provider,
      { aggregator } as any,
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

  const getPrice = () => {
    if (inputToken === outputToken) {
      setPrice("0");
    }

    if (inputAmount === "0" || Number(inputAmount) === 0) {
      setPrice("N/A");
      return;
    }

    if (bestDeal && inputAmount) {
      const priceValue = Number(bestDeal) / Number(inputAmount);
      setPrice(priceValue.toFixed(6));
    }
  };

  const handleTokenSelection = (type: "input" | "output", token: string) => {
    if (type === "input") {
      setInputToken(token);
    } else {
      setOutputToken(token);
    }

    if (inputToken && outputToken && inputToken !== outputToken) {
      setPath([symbols.get(inputToken), symbols.get(outputToken)]);
    } else {
      setPath([]);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (!value || isNaN(Number(value))) {
      setInputAmount("0");
      setOutputAmount("0");
      return;
    }

    try {
      const amountInWei = ethers.parseEther(value).toString();
      setInputAmount(amountInWei);
    } catch (err) {
      console.error("Invalid ether amount", err);
      setInputAmount("0");
    }
  };

  // Atualiza path se inputToken ou outputToken mudarem
  useEffect(() => {
    if (inputToken && outputToken && inputToken !== outputToken) {
      setPath([symbols.get(inputToken), symbols.get(outputToken)]);
    } else {
      setPath([]);
    }
  }, [inputToken, outputToken, symbols]);

  // Busca o melhor retorno da agregação (Aggregator)
  useEffect(() => {
    const fetchBestDeal = async () => {
      if (path.length === 2 && inputAmount !== "0" && aggregator) {
        try {
          const result = await aggregator.getBestAmountsOutOnUniswapForks(path, inputAmount);
          const [amountOut, bestRouter] = result;

          setBestDeal(amountOut.toString());
          setRouter(bestRouter);

          const formatted = ethers.formatUnits(amountOut, 18);
          setOutputAmount(parseFloat(formatted).toFixed(6));
        } catch (error) {
          console.error("Erro ao buscar melhor rota:", error);
        }
      }
    };
    fetchBestDeal();
  }, [path, inputAmount, aggregator]);

  useEffect(() => {
    getPrice();
  }, [inputAmount, inputToken, outputToken, bestDeal]);

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
          <StyledDropdown onSelect={(token: string | null) => handleTokenSelection("input", token!)}>
            <Dropdown.Toggle>{inputToken || "Select token"}</Dropdown.Toggle>
            <Dropdown.Menu>
              {Array.from(symbols).map(([symbol]) => (
                <Dropdown.Item key={symbol} eventKey={symbol}>{symbol}</Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </StyledDropdown>
        </TokenInfoContainer>

        <TokenInfoContainer>
          <InputField
            type="text"
            placeholder="0"
            value={outputAmount === "0" ? "" : outputAmount}
            disabled
          />
          <StyledDropdown onSelect={(token: string | null) => handleTokenSelection("output", token!)}>
            <Dropdown.Toggle>{outputToken || "Select token"}</Dropdown.Toggle>
            <Dropdown.Menu>
              {Array.from(symbols).map(([symbol]) => (
                <Dropdown.Item key={symbol} eventKey={symbol}>{symbol}</Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </StyledDropdown>
        </TokenInfoContainer>

        <ExchangeRateText>Exchange Rate: {price}</ExchangeRateText>

        {account ? (
          isSwapping ? (
            <SwapButton disabled>
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
        <Alert message="Swap pending..." transactionHash={null} variant="info" setShowAlert={setShowAlert} />
      ) : isSuccess && showAlert ? (
        <Alert message="Swap Successful" transactionHash={transactionHash} variant="success" setShowAlert={setShowAlert} />
      ) : !isSuccess && showAlert ? (
        <Alert message="Swap Failed" transactionHash={null} variant="danger" setShowAlert={setShowAlert} />
      ) : null}
    </Container>
  );
};

export default Swap;
