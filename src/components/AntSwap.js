import React, { useState, useEffect, useContext } from "react";
import { Input, Popover, Radio, Modal } from "antd";
import {
  ArrowDownOutlined,
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import tokenList from "../tokenList.json";
import { useSelector, useDispatch } from "react-redux";
import Spinner from "react-bootstrap/Spinner";
import { ethers } from "ethers";
import Alert from "./Alert";
import { swap, loadAccount, loadBalances } from "../store/interactions";
import { ContractsContext } from "./ContractContext";
import { Container } from "../styles/StyledComponents";


const Swap = () => {
  console.log("Swap component re-rendered");
  const contracts = useContext(ContractsContext);
  const [inputAmount, setInputAmount] = useState(0);
  const [outputAmount, setOutputAmount] = useState(0);
  const [bestDeal, setBestDeal] = useState(null);
  const [router, setRouter] = useState(null);
  const [path, setPath] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const provider = useSelector((state) => state.provider.connection);
  const isConnecting = useSelector((state) => state.provider.isConnecting);
  const account = useSelector((state) => state.provider.account);
  const isSwapping = useSelector((state) => state.aggregator.swapping.isSwapping);
  const isSuccess = useSelector((state) => state.aggregator.swapping.isSuccess);
  const transactionHash = useSelector((state) => state.aggregator.swapping.transactionHash);
  const symbols = useSelector((state) => state.tokens.symbols);
  const [tokenFrom, setTokenFrom] = useState(tokenList[1]);
  const [tokenTo, setTokenTo] = useState(tokenList[2]);
  const [isOpen, setIsOpen] = useState(false);
  const [changeToken, setChangeToken] = useState(1);
  const [slippage, setSlippage] = useState(2.5);
  const [price, setPrice] = useState(0);
  const balances = useSelector(state => state.tokens.balances)
  
  const dispatch = useDispatch();

  const connectHandler = async () => {
    await loadAccount(dispatch);
  };


  function handleSlippageChange(e) {
    setSlippage(e.target.value);
  }

  function switchTokens() {
    setPrice(null);
    const input = tokenFrom;
    const output = tokenTo;
    setTokenFrom(output);
    setTokenTo(input);
  }

  function openModal(asset) {
    setChangeToken(asset);
    setIsOpen(true);
  }

  function modifyToken(i){
    setPrice(null);
    setInputAmount(null);
    setOutputAmount(null);
    if (changeToken === 1) {
      setTokenFrom(tokenList[i]);
    } else {
      setTokenTo(tokenList[i]);
    }
    setIsOpen(false);
  }

  const swapHandler = async (e) => {
    e.preventDefault();

    if (tokenFrom === tokenTo) {
      window.alert("Invalid Token Pair");
      return;
    }
    // const _inputAmount = ethers.parseUnits(inputAmount, 'ether')
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    const slippage = 0;
    await swap(
      provider,
      contracts,
      tokenFrom,
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

  const fetchBestDeal = async () => {
    if (path.length === 2 && inputAmount) {
      try {
      const fetchBestDealResult =
        await contracts.aggregator.getBestAmountsOutOnUniswapForks(
          path,
          inputAmount
        );
      console.log("fetchBestDealResult:", fetchBestDealResult);
      setBestDeal(fetchBestDealResult[0]);
      setRouter(fetchBestDealResult[1]);

      // Set the output amount
      let calculatedOutputAmount = ethers.formatUnits(fetchBestDealResult[0],18); // Convert the result to a human-readable format
      setOutputAmount(parseFloat(calculatedOutputAmount).toFixed(5)); // Update the outputAmount state

      } catch (error) {
          console.error('Error fetching best deal:', error);
      }
    } else {
      console.log("path.length/inputAmout", path.length, inputAmount);
    }
  };

  const getPrice = async () => {
    console.log("getPrice/inputAmount", inputAmount);
    if (tokenFrom === tokenTo) {
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
  // const tokenFromContract = contracts[tokenFrom.ticker.toLowerCase()];
  // const tokenToContract = contracts[tokenTo.ticker.toLowerCase()];
  // loadBalances([tokenFromContract,tokenToContract])

  const checkTokenBalances = async () => {
    if (!provider) {
      console.log("Provider is not available.");
      return;
    }
    
    try {
      const fromTokenContract = contracts[tokenFrom.ticker.toLowerCase()];
      const toTokenContract = contracts[tokenTo.ticker.toLowerCase()];
      if (!fromTokenContract || !toTokenContract) {
        console.log("Contract not found for one of the tokens:", tokenFrom.ticker, tokenTo.ticker);
        return;
      }
      
      const [tokenFromBalance, tokenToBalance] = await Promise.all([
        fromTokenContract.balanceOf(account),
        toTokenContract.balanceOf(account),
      ]);
      console.log(`${tokenFrom.ticker} balance for account ${account} is:`, tokenFromBalance.toString());
      console.log(`${tokenTo.ticker} balance for account ${account} is:`, tokenToBalance.toString());
    } catch (error) {
      console.error("Error fetching token balances:", error);
    }
  };
  

  const handleInputChange = async (e) => {
    console.log("handleInputChange triggered"); // Log when the function is triggered
    if (!e.target.value) {
      setOutputAmount("0");
      setInputAmount("0");
      console.log("No input value provided"); // Log if no input value is provided
      return;
    }
    const enteredAmount = ethers.parseEther(e.target.value.toString());
    console.log("Entered amount:", enteredAmount.toString()); // Log the entered amount

    // Set the input amount
    setInputAmount(enteredAmount.toString());

    // Check to make sure the tokens are set before attempting to convert
    if (!tokenFrom || !tokenTo) {
      alert("Please select both input and output tokens.");
      console.log("Input or output token not selected"); // Log if tokens are not selected
      return;
    }

    // Ensure the input token isn't the same as the output token
    if (tokenFrom === tokenTo) {
      alert("Input and output tokens cannot be the same");
      console.log("Input and output tokens are the same"); // Log if input and output tokens are the same
      return;
    }
  };

  const settings = (
    <>
      <div>Slippage Tolerance</div>
      <div>
        {/* <Radio.Group value={slippage} onChange={handleSlippageChange}> */}
        <Radio.Group>
          <Radio.Button value={0.5}>0.5%</Radio.Button>
          <Radio.Button value={2.5}>2.5%</Radio.Button>
          <Radio.Button value={5}>5.0%</Radio.Button>
        </Radio.Group>
      </div>
    </>
  );

  // Effect to update the path whenever inputToken or outputToken changes
  useEffect(() => {
    console.log("use effect 0")
    if (tokenFrom && tokenTo && tokenFrom !== tokenTo) {
      setPath([tokenFrom.address, tokenTo.address]);
      console.log("Path=", tokenFrom.ticker, tokenTo.ticker, path)
    }
    if (tokenFrom && tokenTo && tokenFrom === tokenTo) {
      setPath([]);
    }
  }, [tokenFrom, tokenTo, symbols]);

  // Effect to call getBestAmountsOutOnUniswapForks whenever path or inputAmount changes
  useEffect(() => {
    console.log("use effect 1")
    checkTokenBalances();
    fetchBestDeal();
  }, [path, inputAmount, outputAmount, contracts.aggregator]);

  return (
    <Container>
      <Modal open={isOpen} footer={null} onCancel={() => setIsOpen(false)} title="Select a token">
        <div className="modalContent">
          {tokenList?.map((e, i) => {
            return (
              <div className="tokenChoice" key={i} onClick={() => modifyToken(i)}>
                <img src={e.img} alt={e.ticker} className="tokenLogo"/>
                <div className="tokenChoiceNames">
                  <div className="tokenName">{e.name}</div>
                  <div className="tokenTicker">{e.ticker}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
      <div className="tradeBox">
        <div className="tradeBoxHeader">
          <h4>Swap</h4>
          <Popover content={settings} title="Settings" trigger="click" placement="bottomRight">
            <SettingOutlined className="cog"/>
          </Popover>
        </div>
        <div className="inputs">
          <Input onChange={handleInputChange}/>
          <Input placeholder="0" value={outputAmount} disabled={true}/>
          <div className="switchButton" onClick={switchTokens}>
            <ArrowDownOutlined className="switchArrow"/>
          </div>
          <div className="assetOne" onClick={() => openModal(1)} >
            <img src={tokenFrom.img} alt="assetOneLogo" className="assetLogo"/>
            {tokenFrom.ticker}
            <DownOutlined/>
          </div>
          <div className="assetTwo" onClick={() => openModal(2)} >
            <img src={tokenTo.img} alt="assetOneLogo" className="assetLogo"/>
            {tokenTo.ticker}
            <DownOutlined/>
          </div>
        </div>

        {account ? (
          isSwapping ? (
            <div className="swapButton" disabled={!inputAmount} onClick={swapHandler}>
              <Spinner
                as="span"
                animation="grow"
                size="sm"
                role="status"
                aria-hidden="true"
              />{" "}
              Swapping ...
            </div>  
          ) : (
            <div className="swapButton" disabled={!inputAmount} onClick={swapHandler}>Swap</div>
            )
        ):(
          isConnecting ? (
            <div className="swapButton">
              <span>Connecting wallet</span>
              <Spinner
                as="span"
                animation="grow"
                size="sm"
                role="status"
                aria-hidden="true"
              />
              <Spinner
                as="span"
                animation="grow"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            </div>
          ):(
            <div className="swapButton"  onClick={connectHandler}>Connect Wallet</div>
          )
        )}
      </div>
      {isConnecting ? (
        <Alert
          message={"Connecting your Wallet..."}
          alertMessage={"Follow instructions on Metamask..."}
          transactionHash={null}
          variant={"info"}
          setShowAlert={setShowAlert}
       />
      ) :(<></>)
      }
      {isSwapping ? (
        <Alert
          message={"Swap pending..."}
          alertMessage={"Follow instructions on Metamask"}
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
}

export default Swap;
