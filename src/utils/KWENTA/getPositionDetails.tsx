import Wei from '@synthetixio/wei'
import { BigNumber } from 'ethers'

import PerpsV2MarketInternalV2 from '@/src/contracts/PerpsV2MarketInternalV2'
import { PotentialTradeStatus } from '@/src/utils/KWENTA/constants'
import { MarketData } from '@/src/utils/KWENTA/getMarketInternalData'
import { MarketParams } from '@/src/utils/KWENTA/getMarketParameters'

type TradePreviewResponse = {
  liqPrice: BigNumber
  fee: BigNumber
  price: BigNumber
  status: PotentialTradeStatus
  id: string
  lastPrice: BigNumber
  size: BigNumber
  margin: BigNumber
  lastFundingIndex: BigNumber
}

const zeroStatePreview = {
  id: '0',
  liqPrice: BigNumber.from(0),
  fee: BigNumber.from(0),
  price: BigNumber.from(0),
  lastPrice: BigNumber.from(0),
  status: PotentialTradeStatus.NIL_ORDER,
  size: BigNumber.from(0),
  margin: BigNumber.from(0),
  lastFundingIndex: BigNumber.from(0),
}

export function getTradePreview(
  sizeDelta: Wei,
  marginDelta: Wei,
  fillPrice: BigNumber,
  marketData: MarketData,
  marketParams: MarketParams,
  blockTimestamp: number,
): TradePreviewResponse {
  const marketInternal = new PerpsV2MarketInternalV2(marketData, marketParams, fillPrice)
  const tradePreview = marketInternal.getTradePreview(
    sizeDelta.toBN(), // sizeDelta => orderSize (SUSD) / assetRate (ETH USD MARKET VALUE)
    marginDelta.toBN(), // marginDelta => sizeDelta * assetRate / leverageInput
    blockTimestamp,
  )
  return tradePreview ?? zeroStatePreview
}
