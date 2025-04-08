// global scope, and execute the script.
const hre = require("hardhat");
//const { ethers } = require('hardhat');

// const config = require("../config.json");
const DAI = '0xEf977d2f931C1978Db5F6747666fa1eACB0d0339'
const WETH = "0xcF664087a5bB0237a0BAd6742852ec6c8d69A27a";
const ERC20 = require("@openzeppelin/contracts/build/contracts/ERC20.json");

const tokens = (n) => {
  return hre.ethers.parseUnits(n.toString(), 'ether')
}

async function seed(){

    let account1, persona, weth, dai, transaction
    const accountImpersonated = "0xF59de020d650E69eF0755Bf37F3D16B80Ee132F5"

     const accounts  = await hre.ethers.getSigners()
     account1 = accounts[0]

    // Impersonate account
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [accountImpersonated],
    });

    persona = await hre.ethers.getSigner(accountImpersonated);

    // Setup WETH/DAI contracts
    weth = new hre.ethers.Contract(WETH, ERC20.abi, persona);
    dai = new hre.ethers.Contract(DAI, ERC20.abi, persona);

    console.log('Account impersonated WETH balance', await weth.connect(persona).balanceOf(accountImpersonated))
    console.log('Account 1 WETH balance', await weth.connect(persona).balanceOf(account1.address))

    console.log('Account impersonated DAI balance', await dai.connect(persona).balanceOf(accountImpersonated))
    console.log('Account 1 DAI balance', await dai.connect(persona).balanceOf(account1.address))

    transaction = await weth.connect(persona).transfer(account1.address, tokens(100))
    await transaction.wait()

    transaction = await dai.connect(persona).transfer(account1.address, tokens(100))
    await transaction.wait()

    console.log('Account impersonated WETH balance', await weth.connect(persona).balanceOf(accountImpersonated))
    console.log('Account 1 WETH balance', await weth.connect(persona).balanceOf(account1.address))
    console.log('Account 1 DAI balance', account1.address , await dai.connect(persona).balanceOf(account1.address))

  }

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
seed().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
