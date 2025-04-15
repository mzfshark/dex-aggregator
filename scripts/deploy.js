import { ethers, run } from 'hardhat'
import config from '../config.json'

async function main() {
  const Aggregator = await ethers.getContractFactory('Aggregator')

  const routerList = [
    config.UNISWAP.ROUTERS.VIPERSWAP,
    config.UNISWAP.ROUTERS.SUSHISWAP,
    config.UNISWAP.ROUTERS.DFK,
    config.UNISWAP.ROUTERS.SONICSWAP,
    config.UNISWAP.ROUTERS.DEFIRA,
  ]

  const gasLimit = 5_000_000

  const aggregator = await Aggregator.deploy(routerList, { gasLimit })
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
    constructorArguments: [routerList],
    contract: 'contracts/Aggregator.sol:Aggregator',
  })

  console.log('✅ Verification complete!')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
