import { BigNumber, constants } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'

import {
  BASIS_POINTS_DIVISOR,
  MARGIN_FEE_BASIS_POINTS,
  USD_DECIMALS,
} from '@/src/utils/GMX/constants'
import { getGMXTokensInfo } from '@/src/utils/GMX/getGMXTokensInfo'
import { getGMXVaultStats } from '@/src/utils/GMX/getGMXVaultStats'
import { getLiquidationPrice } from '@/src/utils/GMX/getLiquidationPrice'
import { getNextToAmount } from '@/src/utils/GMX/getNextToAmount'
import { getUSDGStats } from '@/src/utils/GMX/getUSDGStats'
import { expandDecimals } from '@/src/utils/GMX/numbers'
import getProtocols from '@/src/utils/getProtocols'
import { ChainsValues } from '@/types/chains'
import { ProtocolStats, TradeForm } from '@/types/utils'

export async function getGMXStatsFetcher(
  protocols: ReturnType<typeof getProtocols>,
  chainId: ChainsValues,
  tradeForm: TradeForm,
): Promise<ProtocolStats> {
  const fromTokenSymbol = 'USDC'
  const toTokenSymbol = tradeForm.token
  const amount = tradeForm.amount
  const position = tradeForm.position
  const leverage = Number(tradeForm.leverage)

  const gmxTokensInfo = await getGMXTokensInfo(protocols, chainId)
  const gmxVaultStats = await getGMXVaultStats(chainId)
  const usdgStats = await getUSDGStats(chainId)

  const totalTokenWeights = gmxVaultStats
  const usdgTotalSupply = usdgStats
  const fromTokenInfo = protocols.getTokenBySymbolAndChain(fromTokenSymbol, chainId.toString())
  const toTokenInfo = protocols.getTokenBySymbolAndChain(toTokenSymbol, chainId.toString())
  const gmxFromTokenInfo = gmxTokensInfo.infoTokens[fromTokenInfo?.address as string]
  const gmxToTokenInfo = gmxTokensInfo.infoTokens[toTokenInfo?.address as string]

  const fromAmountBN = parseUnits(amount, 6) // USDC fixed
  // const toAmountBN = parseUnits(amount, toTokenInfo?.decimals)

  if (!usdgTotalSupply) {
    throw `There was not possible to get USDG total supply`
  }

  if (!totalTokenWeights) {
    throw `There was not possible to get GMX total token weights`
  }

  if (!fromTokenInfo) {
    throw `There was not possible to get token USDC for chain ${chainId}.`
  }

  if (!toTokenInfo) {
    throw `There was not possible to get token ${toTokenSymbol} for chain ${chainId}.`
  }

  if (!gmxFromTokenInfo || !gmxFromTokenInfo.minPrice || !gmxFromTokenInfo.maxPrice) {
    throw `There was not possible to get GMX token stats for ${fromTokenSymbol}. (token.minPrice and token.minPrice are required)`
  }

  if (!gmxToTokenInfo || !gmxToTokenInfo.minPrice || !gmxToTokenInfo.maxPrice) {
    throw `There was not possible to get GMX token stats for ${toTokenSymbol}. (token.minPrice and token.minPrice are required)`
  }

  // ----------------------
  // Generic calculations
  // ----------------------
  const fromUsdMin = fromAmountBN
    .mul(gmxFromTokenInfo.minPrice)
    .div(expandDecimals(1, fromTokenInfo.decimals))

  const toTokenPriceUsd = gmxToTokenInfo.maxPrice

  const { feeBasisPoints } = getNextToAmount(
    chainId,
    fromAmountBN,
    fromTokenInfo,
    position == 'long' ? toTokenInfo : fromTokenInfo,
    usdgTotalSupply,
    totalTokenWeights,
  )

  // Following calculations were taken following the fronted code of GMX.
  // file: SwapBox.js
  // the logic starts in a useEffect containing a function called: updateLeverageAmounts

  // ----------------------
  // Order size
  // ----------------------

  let fromUsdMinAfterFee = fromUsdMin
  if (feeBasisPoints) {
    fromUsdMinAfterFee = fromUsdMin
      .mul(BASIS_POINTS_DIVISOR - feeBasisPoints)
      .div(BASIS_POINTS_DIVISOR)
  }

  const leverageMultiplier = leverage * BASIS_POINTS_DIVISOR
  const toNumerator = fromUsdMinAfterFee.mul(leverageMultiplier).mul(BASIS_POINTS_DIVISOR)
  const toDenominator = BigNumber.from(MARGIN_FEE_BASIS_POINTS)
    .mul(leverageMultiplier)
    .add(BigNumber.from(BASIS_POINTS_DIVISOR).mul(BASIS_POINTS_DIVISOR))

  const nextToUsd = toNumerator.div(toDenominator)
  const nextToAmount = nextToUsd.mul(expandDecimals(1, toTokenInfo.decimals)).div(toTokenPriceUsd)
  //  const nextToValue = formatUnits(nextToAmount, toTokenInfo.decimals)

  // ----------------------
  // entry/exit price
  // ----------------------
  const entryMarkPrice = position === 'long' ? gmxToTokenInfo.maxPrice : gmxToTokenInfo.minPrice
  // const exitMarkPrice = position === 'long' ? gmxToTokenInfo.minPrice : gmxToTokenInfo.maxPrice

  // ----------------------
  // liquidation price
  // ----------------------
  const sizeDelta = nextToAmount
    .mul(gmxToTokenInfo.maxPrice)
    .div(expandDecimals(1, toTokenInfo.decimals))

  const liquidationPrice = getLiquidationPrice(
    position === 'long',
    entryMarkPrice, //averagePrice
    sizeDelta, // sizeDelta
    fromUsdMin, // collateralDelta
  )

  // ----------------------
  // Fees
  // ----------------------

  const positionFee = sizeDelta.mul(MARGIN_FEE_BASIS_POINTS).div(BASIS_POINTS_DIVISOR)
  let feesUsd = positionFee
  let swapFees = constants.Zero

  if (feeBasisPoints) {
    swapFees = fromUsdMin.mul(feeBasisPoints).div(BASIS_POINTS_DIVISOR)
    feesUsd = feesUsd.add(swapFees)
  }

  // ----------------------
  // 1h funding
  // ----------------------

  const borrowFee =
    (position == 'long' ? gmxToTokenInfo.fundingRate : gmxFromTokenInfo.fundingRate) ||
    BigNumber.from(0)

  const borrowFeeAmount = nextToUsd.mul(borrowFee).div(BASIS_POINTS_DIVISOR).div(100)

  // ----------------------
  // Set values
  // ----------------------

  return {
    protocol: 'GMX',
    position: nextToUsd.div(BigNumber.from(10).pow(USD_DECIMALS - 18)),
    investmentTokenSymbol: 'USDC',
    fillPrice: toTokenPriceUsd.div(BigNumber.from(10).pow(USD_DECIMALS - 18)),
    orderSize: nextToAmount, // 18
    priceImpact: undefined,
    protocolFee: feesUsd.div(BigNumber.from(10).pow(USD_DECIMALS - 18)),
    swapFee: swapFees.div(BigNumber.from(10).pow(USD_DECIMALS - 18)),
    executionFee: positionFee.div(BigNumber.from(10).pow(USD_DECIMALS - 18)),
    liquidationPrice: liquidationPrice.div(BigNumber.from(10).pow(USD_DECIMALS - 18)),
    oneHourFunding: borrowFeeAmount.div(BigNumber.from(10).pow(USD_DECIMALS - 18)),
  }
}
