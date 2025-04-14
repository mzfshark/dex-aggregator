const { ethers } = require("hardhat");

/// Função utilitária para converter números para BigInt com base nos decimais
const tokens = (n, decimals = 18) => ethers.parseUnits(n.toString(), decimals);

async function deployFixture() {
  const [deployer, investor] = await ethers.getSigners();

  // Deploy dos tokens mock com 18 casas decimais
  const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
  const tokenA = await ERC20Mock.deploy("TokenA", "TKA", 18);
  const tokenB = await ERC20Mock.deploy("TokenB", "TKB", 18);
  await tokenA.waitForDeployment();
  await tokenB.waitForDeployment();

  // Mintando supply inicial para o deployer
  await tokenA.mint(deployer.address, tokens(1000));
  await tokenB.mint(deployer.address, tokens(1000));

  // Mint opcional para investor (se necessário nos testes)
  await tokenA.mint(investor.address, tokens(500));
  await tokenB.mint(investor.address, tokens(500));

  // Deploy do RouterMock
  const RouterMock = await ethers.getContractFactory("RouterMock");
  const router = await RouterMock.deploy();
  await router.waitForDeployment();

  // Deploy do Aggregator real com o tokenA como WETH-like
  const Aggregator = await ethers.getContractFactory("Aggregator");
  const aggregator = await Aggregator.deploy(tokenA.target);
  await aggregator.waitForDeployment();

  // Deploy do AggregatorMock com 5% de fee
  const AggregatorMock = await ethers.getContractFactory("AggregatorMock");
  const aggregatorMock = await AggregatorMock.deploy([router.target], 5);
  await aggregatorMock.waitForDeployment();

  return {
    deployer,
    investor,
    tokenA,
    tokenB,
    router,
    aggregator,
    aggregatorMock
  };
}

module.exports = { deployFixture, tokens };
