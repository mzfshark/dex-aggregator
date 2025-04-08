import { ethers } from 'hardhat'
import config from '../config.json'

async function main() {
  const Aggregator = await ethers.getContractFactory('Aggregator')

  const routerList = [
    config.VIPERSWAP.V2_ROUTER_02_ADDRESS,
    config.SUSHISWAP.V2_ROUTER_02_ADDRESS,
    config.DFK.V2_ROUTER_02_ADDRESS,
    config.DEFIRA.V2_ROUTER_02_ADDRESS,
    config.SONICSWAP.V2_ROUTER_02_ADDRESS
  ]

  const defaultSlippage = 2
  const gasLimit = 5_000_000 // ✅ agora com '=' ao invés de ':'

  const aggregator = await Aggregator.deploy(
    routerList,
    defaultSlippage,
    {
      gasLimit // ✅ passa como objeto de opções
    }
  )

  await aggregator.waitForDeployment()

  const address = await aggregator.getAddress()
  const { chainId } = await ethers.provider.getNetwork()

  console.log(`
    Aggregator deployed to: ${address}
    on network chainID: ${chainId}
  `)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
