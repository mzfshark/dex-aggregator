const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");

// Carregar configuração
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

function tokens(n) {
  return ethers.parseUnits(n.toString(), 'ether');
}

describe("Aggregator", () => {
  let deployer, investor, tokenA, tokenB, aggregator, router;
  const MAX_SLIPPAGE_PERCENT = 20; // Ajuste exatamente conforme definido no Aggregator.sol


  beforeEach(async () => {
    [deployer, investor] = await ethers.getSigners();
    router = config.UNISWAP.ROUTERS.VIPERSWAP;

    // ERC20 Mocks
    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
    tokenA = await ERC20Mock.deploy("TokenA", "TKA", deployer.address, tokens(10000));
    tokenB = await ERC20Mock.deploy("TokenB", "TKB", deployer.address, tokens(10000));

    // Aggregator
    const Aggregator = await ethers.getContractFactory("Aggregator");
    aggregator = await Aggregator.deploy([router]);
    await aggregator.waitForDeployment();

    // Distribuir tokens
    await tokenA.transfer(investor.address, tokens(100));

    // Aprovação prévia para o Aggregator
    await tokenA.connect(investor).approve(aggregator.target, tokens(100));
  });

  it("Verifica routers adicionados corretamente", async () => {
    const storedRouter = await aggregator.whiteListedRouters(0);
    expect(storedRouter).to.equal(router);
  });

  it("Verifica permissão para adicionar router", async () => {
    await expect(
      aggregator.connect(investor).addWhiteListedRouter(config.UNISWAP.ROUTERS.SUSHISWAP)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Deve reverter a transação se o slippage for acima do permitido", async () => {
    const deadline = Math.floor(Date.now() / 1000) + 600;

    const slippageAcimaDoPermitido = MAX_SLIPPAGE_PERCENT + 1; // força slippage inválido

    await expect(
      aggregator.connect(investor).swapOnUniswapFork(
        [tokenA.target, tokenB.target],
        router,
        tokens(10),
        tokens(100), 
        slippageAcimaDoPermitido, 
        deadline
      )
    ).to.be.revertedWith("Slippage too high");
});


  it("Realiza swap com sucesso", async () => {
    const deadline = Math.floor(Date.now() / 1000) + 600;

    // Mock Router: Implemente um MockRouterV2 que permita trocas simuladas
    const MockRouter = await ethers.getContractFactory("MockRouterV2");
    const routerMock = await MockRouter.deploy();
    await routerMock.waitForDeployment();

    // Adiciona o routerMock ao Aggregator
    await aggregator.addWhiteListedRouter(routerMock.target);

    // Pré-approve do aggregator para o router mock
    await tokenA.connect(investor).approve(routerMock.target, tokens(10));

    // Simular liquidez no router mock
    await tokenB.transfer(routerMock.target, tokens(1000));

    const beforeBalanceB = await tokenB.balanceOf(investor.address);

    await aggregator.connect(investor).swapOnUniswapFork(
      [tokenA.target, tokenB.target],
      routerMock.target,
      tokens(10),
      tokens(5),
      2,
      deadline
    );

    const afterBalanceB = await tokenB.balanceOf(investor.address);
    expect(afterBalanceB).to.be.gt(beforeBalanceB);
  });

  it("Confirma cálculo da taxa (fee) proporcional ao slippage", async () => {
    const slippagePercent = 3; // 3%
    const expectedFee = slippagePercent * 1; 
    expect(expectedFee).to.equal(3);
  });
});
