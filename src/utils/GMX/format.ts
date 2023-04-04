import { BigNumberish, ethers } from 'ethers'

export const limitDecimals = (amount: BigNumberish, maxDecimals?: number) => {
  let amountStr = amount.toString()
  if (maxDecimals === undefined) {
    return amountStr
  }
  if (maxDecimals === 0) {
    return amountStr.split('.')[0]
  }
  const dotIndex = amountStr.indexOf('.')
  if (dotIndex !== -1) {
    const decimals = amountStr.length - dotIndex - 1
    if (decimals > maxDecimals) {
      amountStr = amountStr.substr(0, amountStr.length - (decimals - maxDecimals))
    }
  }
  return amountStr
}

export const padDecimals = (amount: BigNumberish, minDecimals: number) => {
  let amountStr = amount.toString()
  const dotIndex = amountStr.indexOf('.')
  if (dotIndex !== -1) {
    const decimals = amountStr.length - dotIndex - 1
    if (decimals < minDecimals) {
      amountStr = amountStr.padEnd(amountStr.length + (minDecimals - decimals), '0')
    }
  } else {
    amountStr = amountStr + '.00'
  }
  return amountStr
}

export function formatAmount(amount: BigNumberish | undefined, tokenDecimals = 18, decimals = 4) {
  let amountStr = ethers.utils.formatUnits(amount || ethers.constants.Zero, tokenDecimals)
  amountStr = limitDecimals(amountStr, decimals)
  amountStr = padDecimals(amountStr, decimals)

  return amountStr
  //   if (useCommas) {
  //     return numberWithCommas(amountStr)
  //   }
}
