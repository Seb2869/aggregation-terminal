import { JsonRpcProvider } from '@ethersproject/providers'

import { getNetworkConfig } from '@/src/config/web3'
import { contracts } from '@/src/contracts/contracts'
import { ChainsValues } from '@/types/chains'
import { GMXVault__factory } from '@/types/generated/typechain'

export async function getGMXVaultStats(chainId: ChainsValues) {
  const provider = new JsonRpcProvider(getNetworkConfig(chainId)?.rpcUrl, chainId)

  const gmxReaderV2 = GMXVault__factory.connect(contracts['GMX_Vault'].address[chainId], provider)

  return await gmxReaderV2.totalTokenWeights()
}
