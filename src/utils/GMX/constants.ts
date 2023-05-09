import { parseEther } from 'ethers/lib/utils'

import { expandDecimals } from '@/src/utils/GMX/numbers'

export const BASIS_POINTS_DIVISOR = 10000
export const MARGIN_FEE_BASIS_POINTS = 10
export const DEFAULT_MAX_USDG_AMOUNT = expandDecimals(200 * 1000 * 1000, 18)
export const MAX_PRICE_DEVIATION_BASIS_POINTS = 750
export const PRECISION = expandDecimals(1, 30)
export const USDG_DECIMALS = 18
export const SWAP_FEE_BASIS_POINTS = 30
export const TAX_BASIS_POINTS = 50
export const USD_DECIMALS = 30
export const LIQUIDATION_FEE = expandDecimals(5, USD_DECIMALS)
export const FUNDING_RATE_PRECISION = 1000000
export const MAX_LEVERAGE = 100 * BASIS_POINTS_DIVISOR
export const INCREASE_ORDER_EXECUTION_GAS_FEE = parseEther('0.0002')
