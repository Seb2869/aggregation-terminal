import { BigNumber, BigNumberish } from 'ethers'

export function expandDecimals(n: BigNumberish, decimals: number) {
  return BigNumber.from(n).mul(BigNumber.from(10).pow(decimals))
}

export function contractDecimals(amount: BigNumber, divDecimals: number, mulDecimals: number) {
  return amount.mul(expandDecimals(1, mulDecimals)).div(expandDecimals(1, divDecimals))
}

export const foldUnfoldDecimals = (n: number) => (number: BigNumber) => {
  if (n === 0) {
    return number
  }
  if (n > 0) {
    return number.mul(expandDecimals(1, n))
  }
  return number.div(expandDecimals(1, -n))
}
