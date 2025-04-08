import React, {
  useState,
  useEffect,
  useContext,
  FormEvent,
  ChangeEvent,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { parseEther, formatUnits } from 'ethers/lib/utils';
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

interface RootState {
  provider: {
    connection: ethers.utils.Web3Provider;
    account: string;
  };
  aggregator: {
    swapping: {
      isSwapping: boolean;
      isSuccess: boolean;
      transactionHash: string;
    };
  };
  tokens: {
    symbols: Map<string, string>;
  };
}

const Swap: React.FC = () => {
  const contracts = useContext(ContractsContext);
  const [inputToken, setInputToken] = useState<string | null>(null);
  const [outputToken, setOutputToken] = useState<string | null>(null);
  const [inputAmount, setInputAmount] = useState<string>("0");
  const [outputAmount, setOutputAmount] = useState<string>("0");
  const [bestDeal, setBestDeal] = useState<string | null>(null);
  const [router, setRouter] = useState<string | null>(null);
  const [path, setPath] = useState<string[]>([]);
  const [price, setPrice] = useState<string | number>(0);
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const provider = useAppSelector((state) => state.provider.connection);
  const account = useAppSelector((state) => state.provider.account);
  const isSwapping = useAppSelector((state) => state.aggregator.swapping.isSwapping);
  const symbols = useAppSelector((state) => state.tokens.symbols);
  
  const dispatch = useAppDispatch();
  
  const isSuccess = useSelector(
    (state: RootState) => state.aggregator.swapping.isSuccess
  );
  const transactionHash = useSelector(
    (state: RootState) => state.aggregator.swapping.transactionHash
  );
  const connectHandler = async () => {
    await loadAccount(dispatch);
  };

  const swapHandler = async (e: FormEvent) => {
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

  const getPrice = () => {
    if (inputToken === outputToken) {
      setPrice(0);
    }
    if (inputAmount === "0") {
      setPrice("N/A");
      return;
    }

    if (outputAmount && inputAmount) {
      const price = Number(bestDeal) / Number(inputAmount);
      setPrice(price.toString());
    }
  };

  const handleTokenSelection = (type: "input" | "output", token: string) => {
    if (type === "input") {
      setInputToken(token);
    } else {
      setOutputToken(token);
    }

    if (
      inputToken &&
      outputToken &&
      inputToken !== outputToken
    ) {
      setPath([
        symbols.get(inputToken) as string,
        symbols.get(outputToken) as string,
      ]);
    }

    if (
      inputToken &&
      outputToken &&
      inputToken === outputToken
    ) {
      setPath([]);
    }
  };

  const handleInputChange = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
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
      setPath([
        symbols.get(inputToken) as string,
        symbols.get(outputToken) as string,
      ]);
    }
    if (inputToken && outputToken && inputToken === outputToken) {
      setPath([]);
    }
  }, [inputToken, outputToken, symbols]);

  useEffect(() => {
    const fetchBestDeal = async () => {
      if (path.length === 2 && inputAmount) {
        const fetchBestDealResult =
          await contracts.aggregator.getBestAmountsOutOnUniswapForks(
            path,
            inputAmount
          );

        setBestDeal(fetchBestDealResult[0]);
        setRouter(fetchBestDealResult[1]);

        const calculatedOutputAmount = ethers.formatUnits(
          fetchBestDealResult[0],
          18
        );
        setOutputAmount(parseFloat(calculatedOutputAmount).toFixed(2));
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
        <TokenInfoContainer>
          <InputField
            type="text"
            placeholder="0"
            min="0.0"
            onChange={handleInputChange}
            disabled={!outputToken || !inputToken}
          />
          <StyledDropdown
            onSelect={(token) =>
              token && handleTokenSelection("input", token)
            }
          >
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
            value={outputAmount === "0" ? "" : outputAmount}
            disabled
          />
          <StyledDropdown
            onSelect={(token) =>
              token && handleTokenSelection("output", token)
            }
          >
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
          isSwapping ? (
            <SwapButton variant="primary" disabled>
              <Spinner
                as="span"
                animation="grow"
                size="sm"
                role="status"
                aria-hidden="true"
              />{" "}
              Swapping ...
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
          message={"Swap pending..."}
          transactionHash={null}
          variant={"info"}
          setShowAlert={setShowAlert}
        />
      ) : isSuccess && showAlert ? (
        <Alert
          message={"Swap Successful"}
          transactionHash={transactionHash}
          variant={"success"}
          setShowAlert={setShowAlert}
        />
      ) : !isSuccess && showAlert ? (
        <Alert
          message={"Swap Failed"}
          transactionHash={null}
          variant={"danger"}
          setShowAlert={setShowAlert}
        />
      ) : null}
    </Container>
  );
};

export default Swap;
