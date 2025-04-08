import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import 'dotenv/config'

const privateKey = process.env.PKEY || ''

const config: HardhatUserConfig = {
  solidity: '0.8.18',
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {},
    harmony: {
      url: process.env.RPC_URL_HARMONY || '',
      accounts: [privateKey ? `0x${privateKey}` : '']
    },
    bsc: {
      url: process.env.RPC_URL_BSC || '',
      accounts: [privateKey ? `0x${privateKey}` : '']
    }
  },
  typechain: {
    outDir: 'typechain-types',
    target: 'ethers-v6'
  }
}

export default config
