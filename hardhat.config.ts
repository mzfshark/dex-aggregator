import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import 'dotenv/config'
import '@nomicfoundation/hardhat-verify'
//import 'hardhat-blockscout-verify' // plugin opcional para Blockscout

const privateKey = process.env.PKEY || ''

const config: HardhatUserConfig = {
  solidity: '0.8.18',
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {},
    harmony: {
      url: process.env.RPC_URL_HARMONY || '',
      accounts: privateKey ? [`0x${privateKey}`] : []
    },
    bsc: {
      url: process.env.RPC_URL_BSC || '',
      accounts: privateKey ? [`0x${privateKey}`] : []
    }
  },
  etherscan: {
    apiKey: {
      // Pode deixar vazio se estiver usando Blockscout e não Etherscan
      harmony: 'xxx'
    },
    customChains: [
      {
        network: 'harmony',
        chainId: 1666600000,
        urls: {
          apiURL: 'https://explorer.harmony.one/api',
          browserURL: 'https://explorer.harmony.one'
        }
      }
    ]
  },
  typechain: {
    outDir: 'typechain-types',
    target: 'ethers-v6'
  }
}

export default config
