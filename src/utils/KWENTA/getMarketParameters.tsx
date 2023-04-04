import { JsonRpcProvider } from '@ethersproject/providers'
import { BigNumber } from 'ethers'

import { getNetworkConfig } from '@/src/config/web3'
import { contracts } from '@/src/contracts/contracts'
import { ChainsValues } from '@/types/chains'
import { PerpsV2MarketSettings__factory } from '@/types/generated/typechain'

export type MarketParams<T = BigNumber> = {
  takerFee: T
  makerFee: T
  minInitialMargin: T
  maxLeverage: T
  maxMarketValue: T
  skewScale: T
  liquidationPremiumMultiplier: T
  maxFundingVelocity: T
  liquidationBufferRatio: T
  liquidationFeeRatio: T
  maxKeeperFee: T
  minKeeperFee: T
}

export async function getMarketParameters(
  chainId: ChainsValues,
  marketKey: string,
): Promise<MarketParams> {
  const provider = new JsonRpcProvider(getNetworkConfig(chainId)?.rpcUrl, chainId)

  const marketSettingsReader = PerpsV2MarketSettings__factory.connect(
    contracts['KWENTA_PerpsV2MarketSettings'].address[chainId],
    provider,
  )

  const marketSettingsParams = await Promise.all([
    marketSettingsReader.takerFeeOffchainDelayedOrder(marketKey),
    marketSettingsReader.makerFeeOffchainDelayedOrder(marketKey),
    marketSettingsReader.minInitialMargin(),
    marketSettingsReader.maxLeverage(marketKey),
    marketSettingsReader.maxMarketValue(marketKey),
    marketSettingsReader.skewScale(marketKey),
    marketSettingsReader.maxFundingVelocity(marketKey),
    marketSettingsReader.liquidationBufferRatio(),
    marketSettingsReader.liquidationFeeRatio(),
    marketSettingsReader.maxKeeperFee(),
    marketSettingsReader.minKeeperFee(),
    marketSettingsReader.liquidationPremiumMultiplier(marketKey),
  ])
  const takerFee = marketSettingsParams[0]
  const makerFee = marketSettingsParams[1]
  const minInitialMargin = marketSettingsParams[2]
  const maxLeverage = marketSettingsParams[3]
  const maxMarketValue = marketSettingsParams[4]
  const skewScale = marketSettingsParams[5]
  const maxFundingVelocity = marketSettingsParams[6]
  const liquidationBufferRatio = marketSettingsParams[7]
  const liquidationFeeRatio = marketSettingsParams[8]
  const maxKeeperFee = marketSettingsParams[9]
  const minKeeperFee = marketSettingsParams[10]
  const liquidationPremiumMultiplier = marketSettingsParams[11]

  return {
    takerFee,
    makerFee,
    minInitialMargin,
    maxLeverage,
    maxMarketValue,
    skewScale,
    liquidationPremiumMultiplier,
    maxFundingVelocity,
    liquidationBufferRatio,
    liquidationFeeRatio,
    maxKeeperFee,
    minKeeperFee,
  }
}
