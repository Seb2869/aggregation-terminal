import { JsonRpcProvider } from '@ethersproject/providers'

import { getNetworkConfig } from '@/src/config/web3'
import { contracts } from '@/src/contracts/contracts'
import { ChainsValues } from '@/types/chains'
import { ERC20__factory } from '@/types/generated/typechain/factories/ERC20__factory'

export function getUSDGStats(chainId: ChainsValues) {
  const provider = new JsonRpcProvider(getNetworkConfig(chainId)?.rpcUrl, chainId)

  const usdg = ERC20__factory.connect(contracts['USDG'].address[chainId], provider)

  return usdg.totalSupply()
}
