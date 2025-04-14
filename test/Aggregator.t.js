const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");

// Carregar o arquivo config.json
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

describe("Aggregator (real)", () => {
  let deployer, investor, tokenA, tokenB, aggregator, routerAddress;

  beforeEach(async () => {
    [deployer, investor] = await ethers.getSigners();

    // Aqui você pode escolher qualquer router da lista 'ROUTERS'
    // Exemplo: Usar o "VIPERSWAP"
    routerAddress = config.UNISWAP.ROUTERS.VIPERSWAP;

    // Desplegar o contrato RouterMock
    const RouterMock = await ethers.getContractFactory("RouterMock");
    router = await RouterMock.deploy();
    await router.waitForDeployment();
    
    // Desplegar o contrato Aggregator
    const Aggregator = await ethers.getContractFactory("Aggregator");
    aggregator = await Aggregator.deploy();
    await aggregator.waitForDeployment();
  });

  it("Adiciona router autorizado", async () => {
    // Adicionar o router ao Aggregator
    await aggregator.addWhiteListedRouter(routerAddress);
    expect(await aggregator.isWhitelistedRouter(routerAddress)).to.be.true;
  });

  it("Impede não-owner de adicionar router", async () => {
    // Verificar que apenas o owner pode adicionar o router
    await expect(
      aggregator.connect(investor).addWhiteListedRouter(routerAddress)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Realiza swap com erro de slippage por minAmount alto", async () => {
    const path = [tokenA.target, tokenB.target];
    await tokenA.approve(aggregator.target, tokens(10));

    // Forçar slippage erro com um minAmount muito alto
    await expect(
      aggregator.swapOnUniswapFork(
        path,
        ethers.ZeroAddress,
        tokens(10),
        tokens(100), // muito alto, forçando slippage fail
        10,
        Math.floor(Date.now() / 1000) + 600
      )
    ).to.be.revertedWith("Slippage too high");
  });
  
  it("Executa swap e transfere corretamente", async () => {
    const path = [tokenA.address, tokenB.address]; // Use os endereços dos contratos
    const deadline = Math.floor(Date.now() / 1000) + 600;
  
    await tokenA.connect(investor).approve(aggregator.address, tokens(10));
    await tokenB.connect(deployer).transfer(aggregator.address, tokens(100)); // Transferir tokens para o contrato
    
    const beforeA = await tokenA.balanceOf(investor.address);
    const beforeB = await tokenB.balanceOf(investor.address);
  
    await aggregator.connect(investor).swapOnUniswapFork(
      path,
      ethers.ZeroAddress,
      tokens(10),
      tokens(18),
      5,
      deadline
    );
  
    const afterA = await tokenA.balanceOf(investor.address);
    const afterB = await tokenB.balanceOf(investor.address);
  
    // Espera-se que o saldo de tokenA diminua em 10 e o de tokenB aumente
    expect(afterA).to.equal(beforeA - tokens(10));
    expect(afterB).to.be.gt(beforeB);
  });
  
});
