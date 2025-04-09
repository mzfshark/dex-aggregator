import { ethers, run } from 'hardhat'
import config from '../config.json'

async function main() {
  const Aggregator = await ethers.getContractFactory('Aggregator')

  const routerList = [
    config.VIPERSWAP.V2_ROUTER_02_ADDRESS,
    config.SUSHISWAP.V2_ROUTER_02_ADDRESS,
    config.DFK.V2_ROUTER_02_ADDRESS,
    config.DEFIRA.V2_ROUTER_02_ADDRESS,
    config.SONICSWAP.V2_ROUTER_02_ADDRESS,
  ]

  const defaultSlippage = 20 // 2% (base 1000)
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
  const { chainId, name } = await ethers.provider.getNetwork()

  console.log(`
    ✅ Aggregator deployed to: ${address}
    🌐 Network: ${name} (chainId: ${chainId})
  `)

  console.log('⌛ Waiting for 6 confirmations before verification...')
  await aggregator.deploymentTransaction()?.wait(6)

  console.log('🔍 Verifying contract on Etherscan...')
  await run('verify:verify', {
    address,
    constructorArguments: [routerList, defaultSlippage],
    contract: 'contracts/Aggregator.sol:Aggregator',
  })

  console.log('✅ Verification complete!')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
