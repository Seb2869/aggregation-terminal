import { JsonRpcProvider } from '@ethersproject/providers'
import axios from 'axios'
import { BigNumber } from 'ethers'

import { getNetworkConfig } from '@/src/config/web3'
import { contracts } from '@/src/contracts/contracts'
import { useContractCallWithChain } from '@/src/hooks/useContractCall'
import { useReadContractInstance } from '@/src/hooks/useContractInstance'
import { GMX_URL } from '@/src/utils/GMX/backend'
import {
  BASIS_POINTS_DIVISOR,
  DEFAULT_MAX_USDG_AMOUNT,
  MAX_PRICE_DEVIATION_BASIS_POINTS,
} from '@/src/utils/GMX/constants'
import { getFundingRates } from '@/src/utils/GMX/getFundingRates'
import { expandDecimals } from '@/src/utils/GMX/numbers'
import getProtocols from '@/src/utils/getProtocols'
import { InfoTokens, TokenInfo } from '@/types/GMX/types'
import { ChainsValues } from '@/types/chains'
import { VaultReader__factory } from '@/types/generated/typechain'
import { Token } from '@/types/token'

export async function getGMXTokensInfo(
  protocols: ReturnType<typeof getProtocols>,
  chainId: ChainsValues,
) {
  const tokens = protocols.getProtocolTokens('GMX', chainId.toString())

  const tokensAddresses = tokens.map((t) => t.address)
  const fundingRateInfo = await getFundingRates(protocols, chainId)
  const gmxPrices = (await axios.get(`${GMX_URL[chainId]}/prices`)).data

  const provider = new JsonRpcProvider(getNetworkConfig(chainId)?.rpcUrl, chainId)

  const vaultReader = VaultReader__factory.connect(
    contracts['GMX_VaultReader'].address[chainId],
    provider,
  )

  const vaultTokenInfoV4 = await vaultReader.getVaultTokenInfoV4(
    contracts['GMX_Vault'].address[chainId],
    contracts['GMX_PositionRouter'].address[chainId],
    contracts['WETH'].address[chainId],
    expandDecimals(1, 18),
    tokensAddresses,
  )

  return {
    infoTokens: getInfoTokens(
      tokens,
      vaultTokenInfoV4,
      gmxPrices,
      contracts['WETH'].address[chainId],
      fundingRateInfo,
    ),
  }
}

function getInfoTokens(
  tokens: Token[],
  vaultTokenInfo: BigNumber[] | undefined,
  indexPrices: { [address: string]: BigNumber },
  wethAddress: string,
  fundingRateInfo: BigNumber[] | undefined,
): InfoTokens {
  const vaultPropsLength = 15

  const fundingRatePropsLength = 2
  const infoTokens: InfoTokens = {}

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i] as TokenInfo
    infoTokens[token.address] = token

    if (vaultTokenInfo) {
      token.poolAmount = vaultTokenInfo[i * vaultPropsLength]
      token.reservedAmount = vaultTokenInfo[i * vaultPropsLength + 1]
      token.availableAmount = token.poolAmount.sub(token.reservedAmount)
      token.usdgAmount = vaultTokenInfo[i * vaultPropsLength + 2]
      token.redemptionAmount = vaultTokenInfo[i * vaultPropsLength + 3]
      token.weight = vaultTokenInfo[i * vaultPropsLength + 4]
      token.bufferAmount = vaultTokenInfo[i * vaultPropsLength + 5]
      token.maxUsdgAmount = vaultTokenInfo[i * vaultPropsLength + 6]
      token.globalShortSize = vaultTokenInfo[i * vaultPropsLength + 7]
      token.maxGlobalShortSize = vaultTokenInfo[i * vaultPropsLength + 8]
      token.maxGlobalLongSize = vaultTokenInfo[i * vaultPropsLength + 9]
      token.minPrice = vaultTokenInfo[i * vaultPropsLength + 10]
      token.maxPrice = vaultTokenInfo[i * vaultPropsLength + 11]
      token.guaranteedUsd = vaultTokenInfo[i * vaultPropsLength + 12]
      token.maxPrimaryPrice = vaultTokenInfo[i * vaultPropsLength + 13]
      token.minPrimaryPrice = vaultTokenInfo[i * vaultPropsLength + 14]

      // save minPrice and maxPrice as setTokenUsingIndexPrices may override it
      token.contractMinPrice = token.minPrice
      token.contractMaxPrice = token.maxPrice

      token.maxAvailableShort = BigNumber.from(0)

      token.hasMaxAvailableShort = false
      if (token.maxGlobalShortSize.gt(0)) {
        token.hasMaxAvailableShort = true
        if (token.maxGlobalShortSize.gt(token.globalShortSize)) {
          token.maxAvailableShort = token.maxGlobalShortSize.sub(token.globalShortSize)
        }
      }

      if (token.maxUsdgAmount.eq(0)) {
        token.maxUsdgAmount = DEFAULT_MAX_USDG_AMOUNT
      }

      token.availableUsd = token.isStable
        ? token.poolAmount.mul(token.minPrice).div(expandDecimals(1, token.decimals))
        : token.availableAmount.mul(token.minPrice).div(expandDecimals(1, token.decimals))

      token.maxAvailableLong = BigNumber.from(0)
      token.hasMaxAvailableLong = false
      if (token.maxGlobalLongSize.gt(0)) {
        token.hasMaxAvailableLong = true

        if (token.maxGlobalLongSize.gt(token.guaranteedUsd)) {
          const remainingLongSize = token.maxGlobalLongSize.sub(token.guaranteedUsd)
          token.maxAvailableLong = remainingLongSize.lt(token.availableUsd)
            ? remainingLongSize
            : token.availableUsd
        }
      } else {
        token.maxAvailableLong = token.availableUsd
      }

      token.maxLongCapacity =
        token.maxGlobalLongSize.gt(0) &&
        token.maxGlobalLongSize.lt(token.availableUsd.add(token.guaranteedUsd))
          ? token.maxGlobalLongSize
          : token.availableUsd.add(token.guaranteedUsd)

      token.managedUsd = token.availableUsd.add(token.guaranteedUsd)
      token.managedAmount = token.managedUsd
        .mul(expandDecimals(1, token.decimals))
        .div(token.minPrice)

      setTokenUsingIndexPrices(token, indexPrices, wethAddress)
    }

    if (fundingRateInfo) {
      token.fundingRate = fundingRateInfo[i * fundingRatePropsLength]
      token.cumulativeFundingRate = fundingRateInfo[i * fundingRatePropsLength + 1]
    }

    if (infoTokens[token.address]) {
      token.balance = infoTokens[token.address].balance
    }

    infoTokens[token.address] = token
  }

  return infoTokens
}

function setTokenUsingIndexPrices(
  token: TokenInfo,
  indexPrices: { [address: string]: BigNumber },
  wethAddress: string,
) {
  if (!indexPrices) {
    return
  }

  const tokenAddress = token.isNative ? wethAddress : token.address

  const indexPrice = indexPrices[tokenAddress]

  if (!indexPrice) {
    return
  }

  const indexPriceBn = BigNumber.from(indexPrice)

  if (indexPriceBn.eq(0)) {
    return
  }

  const spread = token.maxPrice!.sub(token.minPrice!)
  const spreadBps = spread
    .mul(BASIS_POINTS_DIVISOR)
    .div(token.maxPrice!.add(token.minPrice!).div(2))

  if (spreadBps.gt(MAX_PRICE_DEVIATION_BASIS_POINTS - 50)) {
    // only set one of the values as there will be a spread between the index price and the Chainlink price
    if (indexPriceBn.gt(token.minPrimaryPrice!)) {
      token.maxPrice = indexPriceBn
    } else {
      token.minPrice = indexPriceBn
    }
    return
  }

  const halfSpreadBps = spreadBps.div(2).toNumber()
  token.maxPrice = indexPriceBn.mul(BASIS_POINTS_DIVISOR + halfSpreadBps).div(BASIS_POINTS_DIVISOR)
  token.minPrice = indexPriceBn.mul(BASIS_POINTS_DIVISOR - halfSpreadBps).div(BASIS_POINTS_DIVISOR)
}
