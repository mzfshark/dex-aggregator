import { ethers } from "ethers";

import { setProvider, setNetwork, setAccount } from "./reducers/provider";

import {
  setSymbols,
  //balancesLoaded
} from "./reducers/tokens";

import {
  // swapsLoaded,
  setIsSwapping,
  setSwapSuccess,
  setSwapFail,
} from "./reducers/aggregator";

export const loadProvider = (provider, dispatch) => {
  dispatch(setProvider(provider));

  return provider;
};

export const loadNetwork = async (provider, dispatch) => {
  const { chainId } = await provider.getNetwork();
  dispatch(setNetwork(chainId.toString()));

  return chainId;
};

export const loadAccount = async (dispatch) => {
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  const account = ethers.getAddress(accounts[0]);
  dispatch(setAccount(account));

  return account;
};

// ------------------------------------------------------------------------------
// LOAD CONTRACTS

export const loadTokens = async (erc20s, dispatch) => {
  console.log("load tokens called");

  const symbols = new Map();

  for (let i = 0; i < erc20s.length; i++) {
    const symbol = await erc20s[i].symbol();
    const address = erc20s[i].address; // ✅ propriedade, não função
    symbols.set(symbol, address);
  }

  dispatch(setSymbols(symbols));
  console.log("symbols:", symbols);

  return symbols;
};

// export const fetchTokens = (contracts) => {
//   return async dispatch => {
//     try {
//       dispatch(setSymbols([await contracts.dai.symbol(), await contracts.weth.symbol()]))
//     } catch (error) {
//       console.error('Error fetching tokens info: ', error);
//       // Optionally dispatch an error action
//       // dispatch(fetchDataError(error));
//     }
//   };
// };

// ------------------------------------------------------------------------------
// LOAD BALANCES

// export const loadBalances = async (tokens, account, dispatch) => {
//   const balance1 = await tokens[0].balanceOf(account)
//   const balance2 = await tokens[1].balanceOf(account)

//   dispatch(balancesLoaded([
//     ethers.formatUnits(balance1.toString(), 'ether'),
//     ethers.formatUnits(balance2.toString(), 'ether')
//   ]))

// }

// ------------------------------------------------------------------------------
// SWAP
export const swap = async (
  provider,
  contracts,
  path,
  router,
  amount,
  minAmountOut,
  slippage,
  deadline,
  dispatch,
) => {
  try {
    dispatch(setIsSwapping(true));

    // VALIDATIONS ----------------------------------------------------------
    if (!provider) throw new Error("Provider não definido.");
    if (!contracts || !contracts.dai || !contracts.aggregator) {
      throw new Error("Contratos não definidos corretamente.");
    }
    if (
      !path ||
      !Array.isArray(path) ||
      path.length < 2 ||
      !path[0] ||
      !path[1]
    ) {
      throw new Error("Caminho inválido (path).");
    }
    if (!router) throw new Error("Router está vazio ou nulo.");
    if (!amount) throw new Error("Quantidade (amount) inválida.");
    if (!minAmountOut) throw new Error("minAmountOut inválido.");
    if (!slippage && slippage !== 0) throw new Error("Slippage não definido.");
    if (!deadline) throw new Error("Deadline não definido.");

    console.log(">>> swap() params:");
    console.log("path:", path);
    console.log("router:", router);
    console.log("amount:", amount);
    console.log("minAmountOut:", minAmountOut);

    const signer = await provider.getSigner();

    // APPROVE
    const aggregatorAddress = await contracts.aggregator.getAddress();
    const approveTx = await contracts.dai
      .connect(signer)
      .approve(aggregatorAddress, amount);
    await approveTx.wait();

    // SWAP
    const swapTx = await contracts.aggregator
      .connect(signer)
      .swapOnUniswapFork(
        path,
        router,
        amount,
        minAmountOut,
        slippage,
        deadline,
      );

    await swapTx.wait();
    dispatch(setSwapSuccess(swapTx.hash));
  } catch (error) {
    console.error("Erro no swap:", error);
    dispatch(setSwapFail());
  }
};

// ------------------------------------------------------------------------------
// LOAD ALL SWAPS

// export const loadAllSwaps = async (provider, aggregator, dispatch) => {
//   const block = await provider.getBlockNumber()

//   const swapStream = await aggregator.queryFilter('Swap', 0, block)

//   const swaps = swapStream.map(event => {
//     return { hash: event.transactionHash, args: event.args }
//   })

//   dispatch(swapsLoaded(swaps))
// }
