import { JsonRpcProvider } from '@ethersproject/providers'
import { wei } from '@synthetixio/wei'
import { BigNumber, ethers } from 'ethers'

import { divideDecimal } from './constants'
import { getNetworkConfig } from '@/src/config/web3'
import { contracts } from '@/src/contracts/contracts'
import { MarketParams } from '@/src/utils/KWENTA/getMarketParameters'
import { ChainsValues } from '@/types/chains'
import { PerpsV2Market__factory } from '@/types/generated/typechain'

const zeroBN = wei(0)

type PositionStructOutput = {
  id: string
  lastPrice: BigNumber
  size: BigNumber
  margin: BigNumber
  lastFundingIndex: BigNumber
}

export type MarketData<T = BigNumber> = {
  assetPrice: T
  marketSkew: T
  marketSize: T
  accruedFunding: T
  fundingSequenceLength: T
  fundingLastRecomputed: number
  fundingRateLastRecomputed: T
  position: PositionStructOutput
  currentFundingRate: T
  lastFundingVal: T
}

export async function getMarketInternalData(chainId: ChainsValues): Promise<MarketData> {
  const provider = new JsonRpcProvider(getNetworkConfig(chainId)?.rpcUrl, chainId)

  const marketInternalReader = PerpsV2Market__factory.connect(
    contracts['KWENTA_PerpsV2Market'].address[chainId],
    provider,
  )
  // pasar esto a promiseAll
  const addressZero = ethers.constants.AddressZero
  const marketInternalData = await Promise.all([
    marketInternalReader.assetPrice(),
    marketInternalReader.marketSkew(),
    marketInternalReader.marketSize(),
    marketInternalReader.fundingSequenceLength(),
    marketInternalReader.fundingLastRecomputed(),
    marketInternalReader.currentFundingRate(),
    marketInternalReader.accruedFunding(addressZero),
  ])
  const assetPrice = marketInternalData[0]
  const marketSkew = marketInternalData[1]
  const marketSize = marketInternalData[2]
  const fundingSequenceLength = marketInternalData[3]
  const fundingLastRecomputed = marketInternalData[4]
  const currentFundingRate = marketInternalData[5]
  const accruedFunding = marketInternalData[6]

  // skipped since error typing object || !Position -> PositionStructOutput ??
  // const position = await marketInternalReader.positions(addressZero)
  const position = {
    id: '0x00',
    lastPrice: BigNumber.from(0),
    size: BigNumber.from(0),
    margin: BigNumber.from(0),
    lastFundingIndex: BigNumber.from(0),
  }

  const lastestFundingIndex = fundingSequenceLength.sub(1)
  const fundingSequenceVal = await marketInternalReader.fundingSequence(lastestFundingIndex)

  const marketStateReader = PerpsV2Market__factory.connect(
    contracts['KWENTA_PerpsV2MarketState'].address[chainId],
    provider,
  )
  const fundingRateLastRecomputed = await marketStateReader.fundingRateLastRecomputed()

  return {
    assetPrice: assetPrice.price,
    marketSkew,
    marketSize,
    accruedFunding: accruedFunding.funding,
    fundingSequenceLength,
    fundingLastRecomputed,
    fundingRateLastRecomputed,
    position,
    currentFundingRate,
    lastFundingVal: fundingSequenceVal,
  }
}

export function extractMarketInfo(marketData: MarketData, marketParams: MarketParams) {
  // oneHourlyFundingRate
  const oneHourlyFundingRate = wei(marketData.currentFundingRate).div(24) // wei(futuresMarket.currentFundingRate).div(24)
  const skewAdjustedPrice = marketData.assetPrice
    ? wei(marketData.assetPrice).mul(wei(marketData.marketSkew).div(marketParams.skewScale).add(1))
    : zeroBN

  return { oneHourlyFundingRate, skewAdjustedPrice }
}

export function getFillPrice(
  size: BigNumber,
  price: BigNumber,
  marketSkew: BigNumber,
  marketSkewScale: BigNumber,
) {
  const skew = marketSkew
  const skewScale = marketSkewScale

  const oneScaled = BigNumber.from(10).pow(18)

  const pdBefore = divideDecimal(skew, skewScale)
  const pdAfter = divideDecimal(skew.add(size), skewScale)
  const priceBefore = price.mul(oneScaled.add(pdBefore))
  const priceAfter = price.mul(oneScaled.add(pdAfter))

  // original code from syntethix
  // const pdBefore = divideDecimal(skew, skewScale)
  // const pdAfter = divideDecimal(size.add(skew), skewScale)
  // const priceBefore = price.add(multiplyDecimal(pdBefore, price))
  // const priceAfter = price.add(multiplyDecimal(pdAfter, price))
  // How is the p/d-adjusted price calculated using an example:
  //
  // price      = $1200 USD (oracle)
  // size       = 100
  // skew       = 0
  // skew_scale = 1,000,000 (1M)
  //
  // Then,
  //
  // pd_before = 0 / 1,000,000
  //           = 0
  // pd_after  = (0 + 100) / 1,000,000
  //           = 100 / 1,000,000
  //           = 0.0001
  //
  // price_before = 1200 * (1 + pd_before)
  //              = 1200 * (1 + 0)
  //              = 1200
  // price_after  = 1200 * (1 + pd_after)
  //              = 1200 * (1 + 0.0001)
  //              = 1200 * (1.0001)
  //              = 1200.12
  // Finally,
  //
  // fill_price = (price_before + price_after) / 2
  //            = (1200 + 1200.12) / 2
  //            = 1200.06

  const sumPrices = priceBefore.add(priceAfter)
  const sumPriceDiv2 = sumPrices.div(2)
  const fillPrice = sumPriceDiv2.div(oneScaled)

  return fillPrice
}
