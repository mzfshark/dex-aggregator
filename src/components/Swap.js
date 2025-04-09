import React, { useState, useEffect, useContext } from "react";
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
import { ContractsContext } from "./ContractContext";

const Swap = () => {
  const contracts = useContext(ContractsContext);

  const [inputToken, setInputToken] = useState(null);
  const [outputToken, setOutputToken] = useState(null);
  const [inputAmount, setInputAmount] = useState(0n);
  const [outputAmount, setOutputAmount] = useState("0");
  const [bestDeal, setBestDeal] = useState(0n);
  const [router, setRouter] = useState(null);
  const [path, setPath] = useState([]);
  const [price, setPrice] = useState("0");
  const [showAlert, setShowAlert] = useState(false);

  const provider = useSelector((state) => state.provider.connection);
  const account = useSelector((state) => state.provider.account);
  const isSwapping = useSelector(
    (state) => state.aggregator.swapping.isSwapping,
  );
  const isSuccess = useSelector((state) => state.aggregator.swapping.isSuccess);
  const transactionHash = useSelector(
    (state) => state.aggregator.swapping.transactionHash,
  );
  const symbols = useSelector((state) => state.tokens.symbols);
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
    const slippage = 0;

    await swap(
      provider,
      contracts,
      path,
      router,
      inputAmount.toString(),
      bestDeal.toString(),
      slippage,
      deadline,
      dispatch,
    );

    setShowAlert(true);
  };

  const getPrice = () => {
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

    if (!inputToken || !outputToken) {
      alert("Please select both input and output tokens.");
      return;
    }

    if (inputToken === outputToken) {
      alert("Input and output tokens cannot be the same");
      return;
    }

    const decimals = await contracts[inputToken.toLowerCase()].decimals();
    const parsedAmount = ethers.parseUnits(val, decimals);
    setInputAmount(parsedAmount);
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
          setOutputAmount(parseFloat(formatted).toFixed(2));
        } catch (error) {
          console.error("Error fetching best deal:", error);
          setBestDeal(0n);
          setOutputAmount("0");
        }
      }
    };
    fetchBestDeal();
  }, [path, inputAmount, contracts.aggregator]);

  useEffect(() => {
    getPrice();
  }, [inputAmount, bestDeal]);

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
            onSelect={(token) => handleTokenSelection("input", token)}
          >
            <Dropdown.Toggle>{inputToken || "Select token"}</Dropdown.Toggle>
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
            disabled={true}
          />
          <StyledDropdown
            onSelect={(token) => handleTokenSelection("output", token)}
          >
            <Dropdown.Toggle>{outputToken || "Select token"}</Dropdown.Toggle>
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
