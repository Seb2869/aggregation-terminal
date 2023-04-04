import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers'
import { isAddress } from 'ethers/lib/utils'
import nullthrows from 'nullthrows'

import { getNetworkConfig } from '@/src/config/web3'
import { ContractsKeys, contracts, isKnownContract } from '@/src/contracts/contracts'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { ChainsValues } from '@/types/chains'
import * as typechainImports from '@/types/generated/typechain'
import { ObjectValues } from '@/types/utils'

type GetFactories<T> = T extends { connect: (...args: never) => unknown } ? T : never

type AppFactories = GetFactories<ObjectValues<typeof typechainImports>>

export const useContractInstance = <F extends AppFactories, RT extends ReturnType<F['connect']>>(
  contractFactory: F,
  contractKey: ContractsKeys | string,
) => {
  const { appChainId, readOnlyAppProvider, web3Provider } = useWeb3Connection()
  const signer = web3Provider?.getSigner() || readOnlyAppProvider
  let address: string
  if (isKnownContract(contractKey)) {
    address = contracts[contractKey].address[appChainId]
  } else if (isAddress(contractKey)) {
    address = contractKey
  } else {
    throw new Error(`Expected a valid address or contractKey, current value: ${contractKey}`)
  }

  nullthrows(signer, 'There is not signer to execute a tx.')

  return contractFactory.connect(address, signer as JsonRpcSigner) as RT
}

export const useReadContractInstance = <
  F extends AppFactories,
  RT extends ReturnType<F['connect']>,
>(
  chainId: ChainsValues,
  contractFactory: F,
  contractKey: ContractsKeys | string,
) => {
  const provider = new JsonRpcProvider(getNetworkConfig(chainId)?.rpcUrl, chainId)

  let contractAddress: string
  if (isKnownContract(contractKey)) {
    contractAddress = contracts[contractKey].address[chainId]
  } else if (isAddress(contractKey)) {
    contractAddress = contractKey
  } else {
    throw new Error(`Expected a valid address or contractKey, current value: ${contractKey}`)
  }

  return contractFactory.connect(contractAddress, provider) as RT
}
