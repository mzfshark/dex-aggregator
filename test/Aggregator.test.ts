import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('Aggregator', function () {
  let aggregator: any
  let routers: string[]

  beforeEach(async () => {
    const [owner] = await ethers.getSigners()

    // Criar endereços fictícios
    routers = [
      ethers.Wallet.createRandom().address,
      ethers.Wallet.createRandom().address,
      ethers.Wallet.createRandom().address,
      ethers.Wallet.createRandom().address,
    ]

    const Aggregator = await ethers.getContractFactory('Aggregator')
    aggregator = await Aggregator.deploy(routers, 2)
    await aggregator.waitForDeployment()
  })

  it('deve armazenar os routers corretamente', async () => {
    const storedRouters = await aggregator.getRouters()
    expect(storedRouters).to.deep.equal(routers)
  })

  it('deve retornar o router padrão correto', async () => {
    const defaultRouter = await aggregator.getDefaultRouter()
    expect(defaultRouter).to.equal(routers[2])
  })

  it('deve permitir atualizar o índice padrão', async () => {
    await aggregator.setDefaultIndex(1)
    const newDefault = await aggregator.getDefaultRouter()
    expect(newDefault).to.equal(routers[1])
  })

  it('deve falhar ao definir índice padrão inválido', async () => {
    await expect(aggregator.setDefaultIndex(routers.length)).to.be.revertedWith('Aggregator: Invalid index')
  })

  it('deve permitir adicionar novo router', async () => {
    const newRouter = ethers.Wallet.createRandom().address
    await aggregator.addRouter(newRouter)

    const updatedRouters = await aggregator.getRouters()
    expect(updatedRouters.length).to.equal(routers.length + 1)
    expect(updatedRouters[routers.length]).to.equal(newRouter)
  })
})
