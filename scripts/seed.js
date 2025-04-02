// global scope, and execute the script.
const hre = require("hardhat");
//const { ethers } = require('hardhat');

const config = require("../config.json");
const tokenList = require("../src/tokenList.json");

const tokens = (n) => {
  return hre.ethers.parseUnits(n.toString(), 'ether')
}

async function seed(){

    let account1, persona, weth, dai, mkr, transaction
    const accounts  = await hre.ethers.getSigners()
    account1 = accounts[0]

    // Impersonate account
    const accountImpersonated = "0x075e72a5eDf65F0A5f44699c7654C1a76941Ddc8"
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [accountImpersonated],
    });
    persona = await hre.ethers.getSigner(accountImpersonated);

    // Setup contracts
    const ERC20 = require("@openzeppelin/contracts/build/contracts/ERC20.json");
    const DAI = tokenList[1].address
    const WETH = tokenList[2].address;
    const MKR = tokenList[6].address;

    weth = new hre.ethers.Contract(WETH, ERC20.abi, persona);
    dai = new hre.ethers.Contract(DAI, ERC20.abi, persona);
    mkr = new hre.ethers.Contract(MKR, ERC20.abi, persona)

    console.log('Account impersonated WETH balance', await weth.connect(persona).balanceOf(accountImpersonated))
    console.log('Account impersonated DAI balance', await dai.connect(persona).balanceOf(accountImpersonated))
    console.log('Account impersonated MKR balance', await mkr.connect(persona).balanceOf(accountImpersonated))

    console.log('Account 1 WETH balance BEFORE transfer', await weth.connect(persona).balanceOf(account1.address))
    console.log('Account 1 DAI balance BEFORE transfer', await dai.connect(persona).balanceOf(account1.address))
    console.log('Account 1 MKR balance BEFORE transfer', await mkr.connect(persona).balanceOf(account1.address))

    console.log('Initiating transfers')
    transaction = await weth.connect(persona).transfer(account1.address, tokens(0.1))
    await transaction.wait()

    transaction = await dai.connect(persona).transfer(account1.address, tokens(0.0001))
    await transaction.wait()

    console.log('Account 1 WETH balance AFTER transfer',await weth.connect(persona).balanceOf(account1.address))
    console.log('Account 1 DAI balance AFTER transfer', await dai.connect(persona).balanceOf(account1.address))
    console.log('Account 1 MKR balance AFTER transfer', await mkr.connect(persona).balanceOf(account1.address))
  }

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
seed().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
