import React, {
  useState,
  useEffect,
  useContext,
  ChangeEvent,
  FormEvent,
} from "react";
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
import { ContractsContext } from "./ContractContext";
import { RootState } from "../store/store";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectProvider, selectAccount } from "../store/selectors/provider";




const Swap: React.FC = () => {
  const contracts = useContext(ContractsContext);

  const [inputToken, setInputToken] = useState<string | null>(null);
  const [outputToken, setOutputToken] = useState<string | null>(null);
  const [inputAmount, setInputAmount] = useState<string>("0");
  const [outputAmount, setOutputAmount] = useState<string>("0");
  const [bestDeal, setBestDeal] = useState<string | null>(null);
  const [router, setRouter] = useState<string | null>(null);
  const [path, setPath] = useState<string[]>([]);
  const [price, setPrice] = useState<string | number>("N/A");
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const dispatch = useAppDispatch();
  const provider = useAppSelector(selectProvider);
  const account = useAppSelector(state => state.provider.account);
  const isSwapping = useAppSelector(state => state.aggregator.swapping.isSwapping);
  const isSuccess = useAppSelector(state => state.aggregator.swapping.isSuccess);
  const transactionHash = useAppSelector(state => state.aggregator.swapping.transactionHash);
  const symbols = useAppSelector((state: RootState) => state.tokens.symbols) as Record<string, string>;
 

  const connectHandler = async (): Promise<void> => {
    await loadAccount(dispatch);
  };

  const swapHandler = async (e: FormEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();

    if (inputToken === outputToken) {
      window.alert("Invalid Token Pair");
      return;
    }

    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    const slippage = 0;

    await swap(
      provider,
      contracts,
      path,
      router!,
      inputAmount,
      bestDeal!,
      slippage,
      deadline,
      dispatch
    );

    setShowAlert(true);
  };

  const getPrice = (): void => {
    if (inputToken === outputToken) {
      setPrice(0);
    } else if (inputAmount === "0") {
      setPrice("N/A");
    } else if (outputAmount && inputAmount) {
      const calculatedPrice = Number(bestDeal) / Number(inputAmount);
      setPrice(calculatedPrice.toString());
    }
  };

  const handleTokenSelection = (type: "input" | "output", token: string): void => {
    if (type === "input") setInputToken(token);
    else setOutputToken(token);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;

    if (!value) {
      setInputAmount("0");
      setOutputAmount("0");
      return;
    }

    try {
      const enteredAmount = ethers.parseEther(value.toString());
      setInputAmount(enteredAmount.toString());
    } catch (error) {
      alert("Invalid input value.");
      return;
    }

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
      const inputAddr = symbols[inputToken];
      const outputAddr = symbols[outputToken];
      if (inputAddr && outputAddr) {
        setPath([inputAddr, outputAddr]);
      }
    } else {
      setPath([]);
    }
  }, [inputToken, outputToken, symbols]);

  useEffect(() => {
    const fetchBestDeal = async (): Promise<void> => {
      if (path.length === 2 && inputAmount) {
        const result = await contracts.aggregator.getBestAmountsOutOnUniswapForks(path, inputAmount);
        setBestDeal(result[0]);
        setRouter(result[1]);

        const formatted = ethers.formatUnits(result[0], 18);
        setOutputAmount(parseFloat(formatted).toFixed(2));
      }
    };
    fetchBestDeal();
  }, [path, inputAmount, contracts.aggregator]);

  useEffect(() => {
    getPrice();
  }, [inputAmount, inputToken, outputToken, bestDeal]);

  return (
    <Container>
      <SwapContainer>
        {/* INPUT TOKEN */}
        <TokenInfoContainer>
          <InputField
            type="text"
            placeholder="0"
            min="0.0"
            onChange={handleInputChange}
            disabled={!outputToken || !inputToken}
          />
          <StyledDropdown onSelect={(token) => handleTokenSelection("input", token!)}>
            <Dropdown.Toggle>{inputToken ?? "Select token"}</Dropdown.Toggle>
            <Dropdown.Menu>
            {Object.entries(symbols).map(([symbol, address]) => (
              <Dropdown.Item key={address} eventKey={symbol}>
                {symbol}
              </Dropdown.Item>
            ))}
            </Dropdown.Menu>
          </StyledDropdown>
        </TokenInfoContainer>

        {/* OUTPUT TOKEN */}
        <TokenInfoContainer>
          <InputField
            type="text"
            placeholder="0"
            min="0.0"
            value={outputAmount === "0" ? "" : outputAmount}
            disabled
          />
          <StyledDropdown onSelect={(token) => handleTokenSelection("output", token!)}>
            <Dropdown.Toggle>{outputToken ?? "Select token"}</Dropdown.Toggle>
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

        {/* SWAP / CONNECT */}
        {account ? (
          isSwapping ? (
            <SwapButton variant="primary" disabled>
              <Spinner animation="grow" size="sm" role="status" />
              {" "}Swapping ...
            </SwapButton>
          ) : (
            <SwapButton onClick={swapHandler}>Swap</SwapButton>
          )
        ) : (
          <SwapButton onClick={connectHandler}>Connect Wallet</SwapButton>
        )}
      </SwapContainer>

      {/* ALERTS */}
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
