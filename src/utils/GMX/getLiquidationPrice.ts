import { BigNumber } from 'ethers'

import {
  BASIS_POINTS_DIVISOR,
  FUNDING_RATE_PRECISION,
  LIQUIDATION_FEE,
  MARGIN_FEE_BASIS_POINTS,
  MAX_LEVERAGE,
} from '@/src/utils/GMX/constants'

export function getMarginFee(sizeDelta: BigNumber) {
  const afterFeeUsd = sizeDelta
    .mul(BASIS_POINTS_DIVISOR - MARGIN_FEE_BASIS_POINTS)
    .div(BASIS_POINTS_DIVISOR)
  return sizeDelta.sub(afterFeeUsd)
}

export function getLiquidationPriceFromDelta(
  liquidationAmount: BigNumber,
  size: BigNumber,
  collateral: BigNumber,
  averagePrice: BigNumber,
  isLong: boolean,
) {
  if (liquidationAmount.gt(collateral)) {
    const liquidationDelta = liquidationAmount.sub(collateral)
    const priceDelta = liquidationDelta.mul(averagePrice).div(size)

    return isLong ? averagePrice.add(priceDelta) : averagePrice.sub(priceDelta)
  }

  const liquidationDelta = collateral.sub(liquidationAmount)
  const priceDelta = liquidationDelta.mul(averagePrice).div(size)

  return isLong ? averagePrice.sub(priceDelta) : averagePrice.add(priceDelta)
}

export function getLiquidationPrice(
  isLong: boolean,
  averagePrice: BigNumber,
  sizeDelta: BigNumber, // max
  collateralDelta: BigNumber, // min
  // increaseCollateral = true,
  // increaseSize = true,
) {
  const size = BigNumber.from(0)
  // const collateral = BigNumber.from(0)
  const entryFundingRate = BigNumber.from(0)
  const cumulativeFundingRate = BigNumber.from(0)
  let nextSize = BigNumber.from(0)
  let remainingCollateral = BigNumber.from(0)

  // GMX if(sizeDelta && increaseSize)
  nextSize = size.add(sizeDelta)
  const marginFee = getMarginFee(sizeDelta)
  remainingCollateral = remainingCollateral.sub(marginFee)

  // GMX if(collateralDelta && increaseCollateral)
  remainingCollateral = remainingCollateral.add(collateralDelta)

  let positionFee = LIQUIDATION_FEE

  // GMX if (entryFundingRate && cumulativeFundingRate) {
  const fundingFee = size
    .mul(cumulativeFundingRate.sub(entryFundingRate))
    .div(FUNDING_RATE_PRECISION)
  positionFee = positionFee.add(fundingFee)

  const liquidationPriceForFees = getLiquidationPriceFromDelta(
    positionFee,
    nextSize,
    remainingCollateral,
    averagePrice,
    isLong,
  )

  const liquidationPriceForMaxLeverage = getLiquidationPriceFromDelta(
    nextSize.mul(BASIS_POINTS_DIVISOR).div(MAX_LEVERAGE),
    nextSize,
    remainingCollateral,
    averagePrice,
    isLong,
  )

  if (!liquidationPriceForFees) {
    return liquidationPriceForMaxLeverage
  }

  if (!liquidationPriceForMaxLeverage) {
    return liquidationPriceForFees
  }

  if (isLong) {
    // return the higher price
    return liquidationPriceForFees.gt(liquidationPriceForMaxLeverage)
      ? liquidationPriceForFees
      : liquidationPriceForMaxLeverage
  }

  // return the lower price
  return liquidationPriceForFees.lt(liquidationPriceForMaxLeverage)
    ? liquidationPriceForFees
    : liquidationPriceForMaxLeverage
}
