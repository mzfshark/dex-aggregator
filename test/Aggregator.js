const { expect } = require("chai")
const { ethers } = require('hardhat');

const UniswapV2Router02 = require('@uniswap/v2-periphery/build/IUniswapV2Router02.json')
const ERC20 = require("@openzeppelin/contracts/build/contracts/ERC20.json");
const config = require("../config.json");
const tokens = (n) => {
  return ethers.parseUnits(n.toString(), 'ether')
}

const tokenList = require("../src/tokenList.json");
const ether = tokens

describe("Aggregator", () => {

  let deployer, aggregator
  let amountOut, weth, dai, mkr, uRouter,
    tokenFromBalanceBeforeSwap, tokenToBalanceBeforeSwap

  // Holds WETH, USDC & MKR
  const patricio_address = "0x57757E3D981446D585Af0D9Ae4d7DF6D64647806"

  const LINK = tokenList[0].address
  const DAI = tokenList[1].address
  const WETH = tokenList[2].address;
  const MATIC = tokenList[3].address;
  const MKR = tokenList[6].address;
  const SHIB = tokenList[7].address;

  //const path = [WETH, DAI]
  const DEADLINE = Math.floor(Date.now() / 1000) + 60 * 20
  const AMOUNT = hre.ethers.parseUnits('1', 'ether')


  //WETH = await aggregator.WETH()

  beforeEach(async () => {

    [deployer] = await ethers.getSigners()

    // Impersonate account patricio_address
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [patricio_address],
    });

    investor1 = await ethers.getSigner(patricio_address);

    // Setup Uniswap V2 Router contract...
    // uRouter = new hre.ethers.Contract(
    //   config.UNISWAP.V2_ROUTER_02_ADDRESS,
    //   UniswapV2Router02.abi,
    //   deployer)


    // Deploy aggregator contract
    aggregator = await hre.ethers.deployContract("Aggregator",[
        [
          config.UNISWAP.V2_ROUTER_02_ADDRESS,
          config.SUSHISWAP.V2_ROUTER_02_ADDRESS,
       //   config.SMARTDEX.V2_ROUTER_02_ADDRESS
        ],
        2
      ])

    await aggregator.waitForDeployment()

    // Delgate investor1 tokens to DEX Aggregator contract
    // transaction = await weth.connect(investor1).approve(aggregator, tokens(200))
    // transaction.wait()

  })

  describe("Deployment", () => {
    it("Whitelists DEXs", async () => {
     expect(await aggregator.whiteListedRouters(0)).to.equal(config.UNISWAP.V2_ROUTER_02_ADDRESS)
     expect(await aggregator.whiteListedRouters(1)).to.equal(config.SUSHISWAP.V2_ROUTER_02_ADDRESS)
    })

    it("Sets the owner", async () => {
      expect(await aggregator.owner()).to.equal(await deployer.getAddress())
    })
  })

//  describe('Aggregates routes from several DEXs', () => {

//     it('Returns the best route', async () => {
//       amountOut = await aggregator.connect(investor1)
//         .getBestAmountsOutOnUniswapForks(
//           path,
//           tokens(100)
//         )

//       expect(amountOut[1]).to.be.properAddress;
//       expect(typeof amountOut[0]).to.equal('bigint')
//     })

//     it('Swaps tokens on the best route', async () => {
//       transaction = await aggregator.connect(investor1)
//       .swapOnUniswapFork(
//           path,
//           amountOut[1],  //router address
//           tokens(100),
//           amountOut[0],  //best deal
//           0,
//           DEADLINE
//           )
//       expect( await transaction.wait()).to.not.be.reverted;
//     })
//  })s

  describe('Trades', () => {
    let contractFrom, contractTo
    const paths = [
      {path: [WETH, DAI], pair: 'WETH/DAI'},
      {path: [WETH, MKR], pair: 'WETH/MKR'},
      {path: [WETH, MKR], pair: 'MKR/DAI'},

    ];
    paths.forEach(({path, pair}) => {
      it(`Decreases the source token balance (${pair})`, async () => {
        
        contractFrom = new hre.ethers.Contract(path[0], ERC20.abi, deployer);
        contractTo = new hre.ethers.Contract(path[1], ERC20.abi, deployer);
        transaction = await contractFrom.connect(investor1).approve(aggregator, tokens(100))
        transaction.wait()
        amountOut = await aggregator.connect(investor1)
        .getBestAmountsOutOnUniswapForks(
          path,
          tokens(100)
        )

        tokenFromBalanceBeforeSwap = await contractFrom.balanceOf(investor1)
        transaction = await aggregator.connect(investor1)
        .swapOnUniswapFork(
            path,
            amountOut[1],  //router address
            tokens(100),
            amountOut[0],  //best deal
            0,
            DEADLINE,
          )
        result = await transaction.wait()

        expect(
          await contractFrom.balanceOf(investor1)).to.equal(
            tokenFromBalanceBeforeSwap - tokens(100))
      })
      
      it('Increases the destination token balance', async () => {

        tokenToBalanceBeforeSwap = await contractTo.balanceOf(investor1)
        transaction = await contractFrom.connect(investor1).approve(aggregator, tokens(10))
        transaction.wait()

        //Get best deal
        amountOut = await aggregator.connect(investor1)
        .getBestAmountsOutOnUniswapForks(
          path,
          tokens(10)
        )
      // Swap tokens
        transaction = await aggregator.connect(investor1)
        .swapOnUniswapFork(
            path,
            amountOut[1],  //best router address
            tokens(10),
            amountOut[0],  //best deal
            0,
            DEADLINE
          )

        result = await transaction.wait()
        //console.log(result)

        // // Fast forward 5 blocks...
        // // New blocks are validated roughly every ~ 12 seconds
        // const BLOCKS_TO_MINE = 5
        // console.log(`\nFast forwarding ${BLOCKS_TO_MINE} Blocks...\n`)
        // await mine(BLOCKS_TO_MINE, { interval: 12 })

        expect(await contractTo.balanceOf(investor1)).to.be.above(tokenToBalanceBeforeSwap)

      })

      it('Decreases allowance after the transaction', async () => {
        expect(await contractFrom.connect(investor1)
          .allowance(
            await investor1.getAddress(),
            aggregator)
        ).to.equal(tokens(0))
      })

      it('Emits Swap events', async () => {

        tokenToBalanceBeforeSwap = await contractTo.balanceOf(investor1)

        transaction = await contractFrom.connect(investor1).approve(aggregator, tokens(10))
        transaction.wait()

        //Get best deal
        amountOut = await aggregator.connect(investor1)
        .getBestAmountsOutOnUniswapForks(
          path,
          tokens(10)
        )
      // Swap tokens
        transaction = await aggregator.connect(investor1)
        .swapOnUniswapFork(
            path,
            amountOut[1],  //best router address
            tokens(10),
            amountOut[0],  //best deal
            0,
            DEADLINE
          )

        result = await transaction.wait()
          
        expect(transaction).to.emit(aggregator, "Swap")
        .withArgs(
          amountOut[1], // router address
          path,
          tokens(10),
          investor1.getAddress()
          )
        })
      })
   })
})
