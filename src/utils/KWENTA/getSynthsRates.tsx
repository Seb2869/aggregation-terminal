import { JsonRpcProvider } from '@ethersproject/providers'
import { BigNumber } from 'ethers'

import { getNetworkConfig } from '@/src/config/web3'
import { contracts } from '@/src/contracts/contracts'
import { ChainsValues } from '@/types/chains'
import { SynthUtil__factory } from '@/types/generated/typechain'

export async function getSUSDRate(chainId: ChainsValues): Promise<BigNumber> {
  const provider = new JsonRpcProvider(getNetworkConfig(chainId)?.rpcUrl, chainId)

  const synthUtilReader = SynthUtil__factory.connect(
    contracts['KWENTA_SynthUtil'].address[chainId],
    provider,
  )
  const synthRates = await synthUtilReader.synthsRates()
  const sUSDRate = synthRates[1][0]

  return sUSDRate
}
