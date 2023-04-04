import { JsonRpcProvider } from '@ethersproject/providers'
import { constants } from 'ethers'

import { getNetworkConfig } from '@/src/config/web3'
import { contracts } from '@/src/contracts/contracts'
import { ChainsValues } from '@/types/chains'
import { ReaderV2__factory } from '@/types/generated/typechain'

export async function getTokenBalances(chainId: ChainsValues) {
  const provider = new JsonRpcProvider(getNetworkConfig(chainId)?.rpcUrl, chainId)

  const gmxReaderV2 = ReaderV2__factory.connect(
    contracts['GMX_ReaderV2'].address[chainId],
    provider,
  )

  // TODO: add more tokens as they are needed
  const tokens = ['0x0000000000000000000000000000000000000000']

  return gmxReaderV2.getTokenBalances(constants.AddressZero, tokens)
}
