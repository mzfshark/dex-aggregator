// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const config = require("../config.json");

async function main() {
    // Deploy aggregator contract
    aggregator = await hre.ethers.deployContract("Aggregator",[
        [
          config.VIPERSWAP.V2_ROUTER_02_ADDRESS,
          config.SUSHISWAP.V2_ROUTER_02_ADDRESS,
          config.DFK.V2_ROUTER_02_ADDRESS,
          config.DEFIRA.V2_ROUTER_02_ADDRESS
        ],
        2
      ])

    await aggregator.waitForDeployment()


    const { chainId } = await ethers.provider.getNetwork()

    console.log(`
        Aggregator deployed to: ${aggregator.target}
        on network chainID: ${chainId}
        \n`)
    }

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
