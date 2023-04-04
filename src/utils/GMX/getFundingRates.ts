import { JsonRpcProvider } from '@ethersproject/providers'

import { getNetworkConfig } from '@/src/config/web3'
import { contracts } from '@/src/contracts/contracts'
import getProtocols from '@/src/utils/getProtocols'
import { ChainsValues } from '@/types/chains'
import { ReaderV2__factory } from '@/types/generated/typechain'

export async function getFundingRates(
  protocols: ReturnType<typeof getProtocols>,
  chainId: ChainsValues,
) {
  const provider = new JsonRpcProvider(getNetworkConfig(chainId)?.rpcUrl, chainId)

  const gmxReaderV2 = ReaderV2__factory.connect(
    contracts['GMX_ReaderV2'].address[chainId],
    provider,
  )

  return await gmxReaderV2.getFundingRates(
    contracts['GMX_Vault'].address[chainId],
    contracts['WETH'].address[chainId],
    protocols.getProtocolTokens('GMX', chainId.toString()).map((t) => t.address),
  )
}
