import { BigNumber } from 'ethers'

import {
  BASIS_POINTS_DIVISOR,
  PRECISION,
  SWAP_FEE_BASIS_POINTS,
  TAX_BASIS_POINTS,
  USDG_DECIMALS,
} from '@/src/utils/GMX/constants'
import { contractDecimals, foldUnfoldDecimals } from '@/src/utils/GMX/numbers'
import { TokenInfo } from '@/types/GMX/types'
import { ChainsValues } from '@/types/chains'

function getTargetUsdgAmount(
  token: TokenInfo,
  usdgSupply: BigNumber,
  totalTokenWeights: BigNumber,
) {
  if (!token || !token.weight || !usdgSupply) {
    return
  }

  if (usdgSupply.eq(0)) {
    return BigNumber.from(0)
  }

  return token.weight.mul(usdgSupply).div(totalTokenWeights)
}

function getFeeBasisPoints(
  token: TokenInfo,
  tokenUsdgAmount: BigNumber | undefined,
  usdgDelta: BigNumber,
  increment: boolean,
  usdgSupply: BigNumber,
  totalTokenWeights: BigNumber,
) {
  if (!tokenUsdgAmount) {
    throw `tokenUsdgAmount can not be undefined`
  }

  const feeBasisPoints = BigNumber.from(SWAP_FEE_BASIS_POINTS)
  const taxBasisPoints = BigNumber.from(TAX_BASIS_POINTS)

  const initialAmount = tokenUsdgAmount
  let nextAmount = initialAmount.add(usdgDelta)
  if (!increment) {
    nextAmount = usdgDelta.gt(initialAmount) ? BigNumber.from(0) : initialAmount.sub(usdgDelta)
  }

  const targetAmount = getTargetUsdgAmount(token, usdgSupply, totalTokenWeights)
  if (!targetAmount || targetAmount.eq(0)) {
    return feeBasisPoints.toNumber()
  }

  const initialDiff = initialAmount.gt(targetAmount)
    ? initialAmount.sub(targetAmount)
    : targetAmount.sub(initialAmount)
  const nextDiff = nextAmount.gt(targetAmount)
    ? nextAmount.sub(targetAmount)
    : targetAmount.sub(nextAmount)

  if (nextDiff.lt(initialDiff)) {
    const rebateBps = taxBasisPoints.mul(initialDiff).div(targetAmount)
    return rebateBps.gt(feeBasisPoints) ? 0 : feeBasisPoints.sub(rebateBps).toNumber()
  }

  let averageDiff = initialDiff.add(nextDiff).div(2)
  if (averageDiff.gt(targetAmount)) {
    averageDiff = targetAmount
  }
  const taxBps = taxBasisPoints.mul(averageDiff).div(targetAmount)
  return feeBasisPoints.add(taxBps).toNumber()
}

export function getNextToAmount(
  chainId: ChainsValues,
  fromAmount: BigNumber,
  fromToken: TokenInfo,
  collateralToken: TokenInfo,
  usdgSupply: BigNumber,
  totalTokenWeights: BigNumber,
) {
  if (fromToken.address === collateralToken.address) {
    return { amount: fromAmount }
  }

  const fromTokenMinPrice = fromToken.minPrice
  const toTokenMaxPrice = collateralToken.maxPrice

  if (!fromTokenMinPrice || !toTokenMaxPrice) {
    throw `There was an error, fromToken.minPrice and toToken.maxPrice can not be undefined`
  }

  const adjustDecimals = foldUnfoldDecimals(collateralToken.decimals - fromToken.decimals)

  const toAmount = fromAmount.mul(fromTokenMinPrice).div(toTokenMaxPrice)
  let fromTokenToUSDGAmount = fromAmount.mul(fromTokenMinPrice).div(PRECISION)
  fromTokenToUSDGAmount = contractDecimals(fromTokenToUSDGAmount, fromToken.decimals, USDG_DECIMALS)

  const feeBasisPoints0 = getFeeBasisPoints(
    fromToken,
    fromToken.usdgAmount,
    fromTokenToUSDGAmount,
    true,
    usdgSupply,
    totalTokenWeights,
  )

  const feeBasisPoints1 = getFeeBasisPoints(
    collateralToken,
    collateralToken.usdgAmount,
    fromTokenToUSDGAmount,
    false,
    usdgSupply,
    totalTokenWeights,
  )

  const feeBasisPoints = feeBasisPoints0 > feeBasisPoints1 ? feeBasisPoints0 : feeBasisPoints1
  const amount = adjustDecimals(
    toAmount.mul(BASIS_POINTS_DIVISOR - feeBasisPoints).div(BASIS_POINTS_DIVISOR),
  )

  return {
    amount,
    feeBasisPoints,
  }
}
