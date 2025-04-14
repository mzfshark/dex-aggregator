const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployFixture, tokens } = require("./fixtures");

describe("AggregatorMock", () => {
  let deployer, investor, tokenA, tokenB, aggregatorMock;
  let routerAddress;

  beforeEach(async () => {
    ({ deployer, investor, tokenA, tokenB, aggregatorMock } = await deployFixture());

    await tokenA.transfer(investor.address, tokens(100));
    await tokenB.transfer(investor.address, tokens(100));
  });

  it("Simula melhor rota com mock retornando valores fixos", async () => {
    const path = [tokenA.target, tokenB.target];
    const amounts = await aggregatorMock.getBestAmountsOutOnUniswapForks(
      ethers.ZeroAddress,
      tokens(10),
      path
    );
    expect(amounts[0]).to.equal(tokens(10));
    expect(amounts[1]).to.equal(tokens(20)); // 10 * 2
  });

  it("Executa swap e transfere corretamente", async () => {
    const path = [tokenA.target, tokenB.target];
    const deadline = Math.floor(Date.now() / 1000) + 600;

    await tokenA.connect(investor).approve(aggregatorMock.target, tokens(10));
    await tokenB.connect(deployer).transfer(aggregatorMock.target, tokens(100));

    const beforeA = await tokenA.balanceOf(investor.address);
    const beforeB = await tokenB.balanceOf(investor.address);

    await aggregatorMock.connect(investor).swapOnUniswapFork(
      path,
      ethers.ZeroAddress,
      tokens(10),
      tokens(18),
      5,
      deadline
    );

    const afterA = await tokenA.balanceOf(investor.address);
    const afterB = await tokenB.balanceOf(investor.address);

    expect(afterA).to.equal(beforeA - tokens(10));
    expect(afterB).to.be.gt(beforeB);
  });
});
