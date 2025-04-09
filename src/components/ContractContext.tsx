import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { BrowserProvider, Contract } from 'ethers'
import AggregatorABI from '../abis/Aggregator.json'
import DAI_ABI from '../abis/Dai.json'
import WETH_ABI from '../abis/Weth.json'
import config from '../config.json'

interface Contracts {
  aggregator: Contract | null
  dai: Contract | null
  weth: Contract | null
  provider: BrowserProvider | null
}

const ContractContext = createContext<Contracts>({
  aggregator: null,
  dai: null,
  weth: null,
  provider: null
})

export const useContracts = () => useContext(ContractContext)

interface ContractProviderProps {
  children: ReactNode
}

export const ContractProvider = ({ children }: ContractProviderProps) => {
  const [contracts, setContracts] = useState<Contracts>({
    aggregator: null,
    dai: null,
    weth: null,
    provider: null
  })

  useEffect(() => {
    const loadContracts = async () => {
      if (!window.ethereum) return

      try {
        const provider = new BrowserProvider(window.ethereum)
        const network = await provider.getNetwork()
        const chainId = Number(network.chainId)

        const networkConfig = config[chainId]
        if (!networkConfig) {
          console.warn('Unsupported network:', chainId)
          return
        }

        const aggregator = new Contract(
          networkConfig.aggregator.address,
          AggregatorABI,
          provider
        )

        const dai = new Contract(
          networkConfig.dai.address,
          DAI_ABI,
          provider
        )

        const weth = new Contract(
          networkConfig.weth.address,
          WETH_ABI,
          provider
        )

        setContracts({ aggregator, dai, weth, provider })
      } catch (error) {
        console.error('Error loading contracts:', error)
      }
    }

    loadContracts()

    // reload contracts if network changes
    window.ethereum?.on('chainChanged', () => window.location.reload())
    window.ethereum?.on('accountsChanged', () => window.location.reload())
  }, [])

  return (
    <ContractContext.Provider value={contracts}>
      {children}
    </ContractContext.Provider>
  )
}
