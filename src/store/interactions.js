import { ethers } from 'ethers'

import {
  setProvider,
  setNetwork,
  setAccount,
  setIsConnecting,
  setIsConnected
} from './reducers/provider'

import {
  setSymbols,
  balancesLoaded
} from './reducers/tokens'

import {
  // swapsLoaded,
  setIsSwapping,
  setSwapSuccess,
  setSwapFail
} from './reducers/aggregator'
import { result } from 'lodash'


export const loadProvider = (provider, dispatch) => {
  dispatch(setProvider(provider))
  return provider
}

export const loadNetwork = async (provider, dispatch) => {
  const { chainId } = await provider.getNetwork()
  dispatch(setNetwork(chainId.toString()))
  return chainId
}

export const loadAccount = async (dispatch) => {
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = ethers.getAddress(accounts[0])
    dispatch(setAccount(account))
    dispatch(setIsConnected())
    return account
  } catch (error) {
    dispatch(setIsConnecting())
    console.error(error)
  }

}

// ------------------------------------------------------------------------------
// LOAD CONTRACTS

// export const loadTokens = async (erc20s, dispatch) => {
//   console.log("load tokens called")
//   let symbols = new Map()
//   let i = 0
//   for (i=0; i < erc20s.length; i++){
//     symbols.set(await erc20s[i].symbol(), await erc20s[i].getAddress())
//   }
//   dispatch(setSymbols(symbols))
//   console.log('symbols:', symbols)
//   return symbols

// }


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

export const loadBalances = async (tokens, account, dispatch) => {
  const balance1 = await tokens[0].balanceOf(account)
  const balance2 = await tokens[1].balanceOf(account)

  dispatch(balancesLoaded([
    ethers.formatUnits(balance1.toString(), 'ether'),
    ethers.formatUnits(balance2.toString(), 'ether')
  ]))

}

// ------------------------------------------------------------------------------
// SWAP

 export const swap = async (provider, contracts, tokenFrom, path, router, amount, minAmountOut, slippage, deadline, dispatch) => {
 try{
     dispatch(setIsSwapping(true))

     let transaction
     const signer = await provider.getSigner()

     const tokenContract = contracts[tokenFrom.ticker.toLowerCase()];
     console.log('tokenContract:',tokenContract)
     if (!tokenContract) {
         console.error(`No contract found for token: ${tokenFrom.ticker}`);
         // Optionally, list all keys currently available in contracts for debugging
         console.log('Available contracts:', Object.keys(contracts));
         return; // Exit the function or handle this case as appropriate
     }

     transaction = await tokenContract.connect(signer).approve(contracts.aggregator.getAddress(), amount)
     result = await transaction.wait()

     transaction = await contracts.aggregator.connect(signer)
       .swapOnUniswapFork(
        path,
        router,
        amount,
        minAmountOut,
        slippage,
        deadline
        )

     await transaction.wait()
     dispatch(setSwapSuccess(transaction.hash))

   } catch (error) {
      console.error(error);
      dispatch(setSwapFail(error.reason))
  }
}


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
