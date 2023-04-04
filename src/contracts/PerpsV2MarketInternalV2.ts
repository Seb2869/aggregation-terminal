import BN from 'bn.js'
import { BigNumber } from 'ethers'

import { MarketData } from '@/src/utils/KWENTA/getMarketInternalData'
import { MarketParams } from '@/src/utils/KWENTA/getMarketParameters'
import {
  KWENTA_TRACKING_CODE,
  PotentialTradeStatus,
  UNIT_BIG_NUM,
  UNIT_BN,
  ZERO_BIG_NUM,
  divideDecimal,
  multiplyDecimal,
  zeroBN,
} from 'src/utils/KWENTA/constants'

type TradeParams = {
  sizeDelta: BigNumber
  price: BigNumber
  takerFee: BigNumber
  makerFee: BigNumber
  trackingCode: string
}

type Position = {
  id: string
  lastPrice: BigNumber
  size: BigNumber
  margin: BigNumber
  lastFundingIndex: BigNumber
}

type PostTradeDetailsResponse = {
  newPos: Position
  status: PotentialTradeStatus
  fee: BigNumber
}

// TODO: Delete once fundingRateLastRecomputed is added to proxy
export class FuturesMarketInternal {
  _onChainData: {
    assetPrice: BigNumber
    marketSkew: BigNumber
    marketSize: BigNumber
    fundingSequenceLength: BigNumber
    fundingLastRecomputed: number
    fundingRateLastRecomputed: number
    accruedFunding: BigNumber
    position: Position
    lastFundingVal: BigNumber
    blockTimestamp: number
  }
  _marketParams: MarketParams
  _position: Position

  constructor(marketData: MarketData, marketParams: MarketParams) {
    this._onChainData = {
      assetPrice: marketData.assetPrice,
      marketSkew: marketData.marketSkew,
      marketSize: marketData.marketSize,
      fundingSequenceLength: marketData.fundingSequenceLength,
      fundingLastRecomputed: marketData.fundingLastRecomputed,
      fundingRateLastRecomputed: marketData.fundingRateLastRecomputed as unknown as number,
      accruedFunding: marketData.accruedFunding,
      position: marketData.position,
      lastFundingVal: marketData.lastFundingVal,
      blockTimestamp: 0,
    }
    this._marketParams = marketParams
    this._position = marketData.position
  }

  getTradePreview = (sizeDelta: BigNumber, marginDelta: BigNumber, blockTimestamp: number) => {
    this._onChainData.blockTimestamp = blockTimestamp

    const position = this._position
    const price = this._onChainData.assetPrice
    const takerFee = this._marketParams.takerFee
    const makerFee = this._marketParams.makerFee

    const tradeParams = {
      sizeDelta,
      price: price,
      takerFee,
      makerFee,
      trackingCode: KWENTA_TRACKING_CODE,
    }

    const { fee, newPos, status } = this._postTradeDetails(position, tradeParams, marginDelta)

    const liqPrice = this._approxLiquidationPrice(newPos, newPos.lastPrice)
    return { ...newPos, liqPrice, fee, price: tradeParams.price, status: status }
  }

  _postTradeDetails = (
    oldPos: Position,
    tradeParams: TradeParams,
    marginDelta: BigNumber,
  ): PostTradeDetailsResponse => {
    // Reverts if the user is trying to submit a size-zero order.
    if (tradeParams.sizeDelta.eq(0) && marginDelta.eq(0)) {
      return { newPos: oldPos, fee: ZERO_BIG_NUM, status: PotentialTradeStatus.NIL_ORDER }
    }

    const fee = this._orderFee(tradeParams)
    const { margin, status } = this._recomputeMarginWithDelta(
      oldPos,
      tradeParams.price,
      marginDelta.sub(fee),
    )

    if (status !== PotentialTradeStatus.OK) {
      return { newPos: oldPos, fee: ZERO_BIG_NUM, status }
    }

    const lastFundingIndex = this._latestFundingIndex()

    const newPos: Position = {
      id: oldPos.id,
      lastFundingIndex: lastFundingIndex,
      margin: margin,
      lastPrice: tradeParams.price,
      size: oldPos.size.add(tradeParams.sizeDelta),
    }

    const minInitialMargin = this._marketParams.minInitialMargin

    const positionDecreasing =
      oldPos.size.gte(ZERO_BIG_NUM) === newPos.size.gte(ZERO_BIG_NUM) &&
      newPos.size.abs().lt(oldPos.size.abs())

    // avoids INSUFFICIENT_MARGIN for 2 USD or less amounts
    // if (!positionDecreasing) {
    //   if (newPos.margin.add(fee).lt(minInitialMargin)) {
    //     return {
    //       newPos: oldPos,
    //       fee: ZERO_BIG_NUM,
    //       status: PotentialTradeStatus.INSUFFICIENT_MARGIN,
    //     }
    //   }
    // }

    const liqPremium = this._liquidationPremium(newPos.size, tradeParams.price)
    let liqMargin = this._liquidationMargin(newPos.size, tradeParams.price)
    liqMargin = liqMargin.add(liqPremium)
    if (margin.lte(liqMargin)) {
      return { newPos, fee: ZERO_BIG_NUM, status: PotentialTradeStatus.CAN_LIQUIDATE }
    }
    const maxLeverage = this._marketParams.maxLeverage

    const leverage = divideDecimal(multiplyDecimal(newPos.size, tradeParams.price), margin.add(fee))

    if (maxLeverage.add(UNIT_BIG_NUM.div(100)).lt(leverage.abs())) {
      return {
        newPos: oldPos,
        fee: ZERO_BIG_NUM,
        status: PotentialTradeStatus.MAX_LEVERAGE_EXCEEDED,
      }
    }

    // avoids MAX_MARKET_SIZE_EXCEEDED for larger amounts (~10M)
    // const maxMarketValue = this._marketParams.maxMarketValue
    // const tooLarge = this._orderSizeTooLarge(maxMarketValue, oldPos.size, newPos.size)
    // if (tooLarge) {
    //   return {
    //     newPos: oldPos,
    //     fee: ZERO_BIG_NUM,
    //     status: PotentialTradeStatus.MAX_MARKET_SIZE_EXCEEDED,
    //   }
    // }
    return { newPos, fee: fee, status: PotentialTradeStatus.OK }
  }

  _liquidationPremium = (positionSize: BigNumber, currentPrice: BigNumber) => {
    if (positionSize.eq(0)) {
      return 0
    }

    // note: this is the same as fillPrice() where the skew is 0.
    const notional = multiplyDecimal(positionSize, currentPrice).abs()
    const skewScale = this._marketParams.skewScale
    const liqPremiumMultiplier = this._marketParams.liquidationPremiumMultiplier

    const skewedSize = positionSize.abs().div(skewScale)
    const value = multiplyDecimal(skewedSize, notional)
    return multiplyDecimal(value, liqPremiumMultiplier)
  }

  _orderFee = (tradeParams: TradeParams) => {
    const notionalDiff = multiplyDecimal(tradeParams.sizeDelta, tradeParams.price)
    const marketSkew = this._onChainData.marketSkew
    const sameSide = notionalDiff.gte(0) === marketSkew.gte(0)
    const staticRate = sameSide ? tradeParams.takerFee : tradeParams.makerFee
    // IGNORED DYNAMIC FEE //
    return multiplyDecimal(notionalDiff, staticRate).abs()
  }

  _recomputeMarginWithDelta = (position: Position, price: BigNumber, marginDelta: BigNumber) => {
    const marginPlusProfitFunding = this._marginPlusProfitFunding(position, price)
    const newMargin = marginPlusProfitFunding.add(marginDelta)
    if (newMargin.lt(zeroBN.toBN())) {
      return { margin: zeroBN.toBN(), status: PotentialTradeStatus.INSUFFICIENT_MARGIN }
    }

    const lMargin = this._liquidationMargin(position.size, price)

    if (!position.size.isZero() && newMargin.lt(lMargin)) {
      return { margin: newMargin, status: PotentialTradeStatus.CAN_LIQUIDATE }
    }
    return { margin: newMargin, status: PotentialTradeStatus.OK }
  }

  _marginPlusProfitFunding = (position: Position, price: BigNumber) => {
    const funding = this._onChainData.accruedFunding

    return position.margin.add(this._profitLoss(position, price)).add(funding)
  }

  _profitLoss = (position: Position, price: BigNumber) => {
    const priceShift = price.sub(position.lastPrice)
    return multiplyDecimal(position.size, priceShift)
  }

  _nextFundingEntry = (price: BigNumber) => {
    const fundingSequenceVal = this._onChainData.lastFundingVal
    const unrecordedFunding = this._unrecordedFunding(price) // VIAJE DE IDA!
    return fundingSequenceVal.add(unrecordedFunding)
  }

  _latestFundingIndex = () => {
    const fundingSequenceLength = this._onChainData.fundingSequenceLength
    return fundingSequenceLength.sub(1) // at least one element is pushed in constructor
  }

  _netFundingPerUnit = (startIndex: BigNumber, price: BigNumber) => {
    const fundingSequenceVal = this._onChainData.lastFundingVal
    const nextFunding = this._nextFundingEntry(price)
    return nextFunding.sub(fundingSequenceVal)
  }

  _proportionalElapsed = () => {
    const blockTimestamp = this._onChainData.blockTimestamp
    const fundingLastRecomputed = this._onChainData.fundingLastRecomputed
    const rate = BigNumber.from(blockTimestamp).sub(fundingLastRecomputed)
    return divideDecimal(rate, BigNumber.from(86400))
  }

  _currentFundingVelocity = () => {
    const maxFundingVelocity = this._marketParams.maxFundingVelocity
    const skew = this._proportionalSkew()
    return multiplyDecimal(skew, maxFundingVelocity)
  }

  _currentFundingRate = () => {
    const fundingRateLastRecomputed = this._onChainData.fundingRateLastRecomputed
    const elapsed = this._proportionalElapsed()
    const velocity = this._currentFundingVelocity()
    return BigNumber.from(fundingRateLastRecomputed).add(multiplyDecimal(velocity, elapsed))
  }

  _unrecordedFunding = (price: BigNumber) => {
    const fundingRateLastRecomputed = BigNumber.from(this._onChainData.fundingRateLastRecomputed)
    const nextFundingRate = this._currentFundingRate()
    const elapsed = this._proportionalElapsed()
    const avgFundingRate = divideDecimal(
      fundingRateLastRecomputed.add(nextFundingRate).mul(-1),
      UNIT_BIG_NUM.mul(2),
    )
    return multiplyDecimal(multiplyDecimal(avgFundingRate, elapsed), price)
  }

  _proportionalSkew = () => {
    const marketSkew = this._onChainData.marketSkew
    const skewScale = this._marketParams.skewScale
    const pSkew = divideDecimal(marketSkew, skewScale)

    // Ensures the proportionalSkew is between -1 and 1.
    const proportionalSkew = BN.min(BN.max(UNIT_BN.neg(), new BN(pSkew.toString())), UNIT_BN)
    return BigNumber.from(proportionalSkew.toString())
  }

  _approxLiquidationPrice = (position: Position, currentPrice: BigNumber) => {
    if (position.size.isZero()) {
      return BigNumber.from('0')
    }
    const fundingPerUnit = this._netFundingPerUnit(position.lastFundingIndex, currentPrice)
    const liqMargin = this._liquidationMargin(position.size, currentPrice)
    const result = position.lastPrice
      .add(divideDecimal(liqMargin.sub(position.margin), position.size))
      .sub(fundingPerUnit)
    return result.lt(0) ? BigNumber.from(0) : result
  }

  _liquidationMargin = (positionSize: BigNumber, price: BigNumber) => {
    const liquidationBufferRatio = this._marketParams.liquidationBufferRatio
    const liquidationBuffer = multiplyDecimal(
      multiplyDecimal(positionSize.abs(), price),
      liquidationBufferRatio,
    )
    const fee = this._liquidationFee(positionSize, price)
    return liquidationBuffer.add(fee)
  }

  _liquidationFee = (positionSize: BigNumber, price: BigNumber) => {
    const liquidationFeeRatio = this._marketParams.liquidationFeeRatio
    const proportionalFee = multiplyDecimal(
      multiplyDecimal(positionSize.abs(), price),
      liquidationFeeRatio,
    )
    const maxFee = this._marketParams.maxKeeperFee
    const cappedProportionalFee = proportionalFee.gt(maxFee) ? maxFee : proportionalFee
    const minFee = this._marketParams.minKeeperFee
    return cappedProportionalFee.gt(minFee) ? proportionalFee : minFee
  }

  _orderSizeTooLarge = (maxSize: BigNumber, oldSize: BigNumber, newSize: BigNumber) => {
    if (this._sameSide(oldSize, newSize) && newSize.abs().lte(oldSize.abs())) {
      return false
    }

    const marketSkew = this._onChainData.marketSkew
    const marketSize = this._onChainData.marketSize

    const newSkew = marketSkew.sub(oldSize).add(newSize)
    const newMarketSize = marketSize.sub(oldSize.abs()).add(newSize.abs())

    let newSideSize
    if (newSize.gt(ZERO_BIG_NUM)) {
      newSideSize = newMarketSize.add(newSkew)
    } else {
      newSideSize = newMarketSize.sub(newSkew)
    }

    if (maxSize.lt(newSideSize.div(2).abs())) {
      return true
    }

    return false
  }

  _sameSide(a: BigNumber, b: BigNumber) {
    return a.gte(ZERO_BIG_NUM) === b.gte(ZERO_BIG_NUM)
  }
}

export default FuturesMarketInternal
