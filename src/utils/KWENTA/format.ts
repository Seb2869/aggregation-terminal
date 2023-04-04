import Wei, { wei } from '@synthetixio/wei'
import { BigNumber } from 'ethers'

import { Position } from '@/types/utils'

export type PostTradeDetailsResponse = {
  margin: BigNumber
  size: BigNumber
  price: BigNumber
  liqPrice: BigNumber
  fee: BigNumber
  status: number
}

export const formatPosition = (
  preview: PostTradeDetailsResponse,
  basePrice: Wei,
  nativeSizeDelta: Wei,
  leverageSide: Position,
) => {
  const { fee, liqPrice, margin, price, size, status } = preview

  const tradeValueWithoutSlippage = wei(nativeSizeDelta).abs().mul(wei(basePrice))
  const notionalValue = wei(size).mul(wei(basePrice))
  const leverage = notionalValue.div(wei(margin))

  const priceImpact = wei(price).sub(basePrice).div(basePrice)
  const slippageDirection = nativeSizeDelta.gt(0)
    ? priceImpact.gt(0)
      ? -1
      : nativeSizeDelta.lt(0)
      ? priceImpact.lt(0)
      : -1
    : 1
  return {
    positionStats: {
      fee: wei(fee),
      liqPrice: wei(liqPrice),
      margin: wei(margin),
      price: wei(price),
      size: wei(size),
      sizeDelta: nativeSizeDelta,
      side: leverageSide,
      leverage: leverage,
      notionalValue: notionalValue,
      status,
      showStatus: status > 0, // 0 is success
      priceImpact: priceImpact,
      slippageAmount: priceImpact.mul(slippageDirection).mul(tradeValueWithoutSlippage),
    },
  }
}

export const formatOrderSizes = (
  size: string,
  leverage: number,
  assetRate: Wei,
  position: string,
) => {
  const sizeWei = wei(size)
  const susdSize = wei(leverage).mul(sizeWei)
  const nativeSize = wei(leverage).mul(sizeWei).div(assetRate)
  const susdSizeDelta = position == 'long' ? susdSize : susdSize.neg()
  const nativeSizeDelta = position == 'long' ? nativeSize : nativeSize.neg()
  const sizeDelta = nativeSizeDelta
  const marginDelta = sizeWei
  return {
    susdSize,
    nativeSize,
    susdSizeDelta,
    nativeSizeDelta,
    sizeDelta,
    marginDelta,
  }
}
