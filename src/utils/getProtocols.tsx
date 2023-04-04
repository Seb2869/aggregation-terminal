import protocols from '../../public/protocols.json'
import tokens from '../../public/tokens.json'
import { Chains } from '@/src/config/web3'
import { ChainsValues } from '@/types/chains'
import { Token } from '@/types/token'

type Protocols = Record<string, Record<string, string[]>>

type Tokens = Record<'tokens', Token[]>

export default function getProtocols() {
  const protocolsInfo: Protocols = protocols

  const protocolsNames = Object.keys(protocolsInfo)

  const getProtocolByName = (protocolName: string) => {
    const protocolInfo = protocolsInfo[protocolName]
    if (!protocolInfo) {
      throw `Protocol of name ${protocolName} not found`
    }
    return protocolInfo
  }

  const getProtocolChains = (protocolName: string) => {
    const protocolInfo = getProtocolByName(protocolName)
    return Object.keys(protocolInfo)
      .map((chainId) => {
        if (!Object.values(Chains).includes(Number(chainId) as ChainsValues)) {
          throw `Protocol ${protocolName} is configured with chain ${chainId} which is not configured in "web3.ts"`
        }
        return Number(chainId)
      })
      .map((chain) => chain as unknown as ChainsValues)
  }

  const getProtocolTokensSymbols = (protocolName: string, chainId: string) => {
    const tokensInfo: Tokens = tokens
    const protocolInfo = getProtocolByName(protocolName)
    const protocolTokens = protocolInfo[chainId]
    if (!protocolTokens) {
      throw `There are not tokens configured for protocol ${protocolName} and chain ${chainId}`
    }

    protocolTokens.forEach((tokenName) => {
      const tokenInfo = tokensInfo.tokens.find(
        (t) => t.symbol === tokenName && t.chainId.toString() === chainId,
      )
      if (!tokenInfo) {
        throw `protocol ${protocolName} for chain ${chainId} has a token that is not configured on "tokens.json" file.`
      }
    })

    return protocolTokens
  }

  const getProtocolTokens = (protocolName: string, chainId: string) => {
    const protocolInfo = getProtocolByName(protocolName)
    const protocolTokens = protocolInfo[chainId]
    if (!protocolTokens) {
      throw `There are not tokens configured for protocol ${protocolName} and chain ${chainId}`
    }

    return tokens.tokens.filter((t) => t.chainId.toString() == chainId)
  }

  const exitsTokenInProtocol = (protocolName: string, chainId: string, tokenSymbol: string) => {
    const protocolInfo = protocolsInfo[protocolName]
    if (!protocolInfo) {
      return false
    }
    const protocolTokens = protocolInfo[chainId]

    return protocolTokens.includes(tokenSymbol)
  }

  const getTokenBySymbolAndChain = (tokenSymbol: string, chainId: string) =>
    tokens.tokens.find((t) => t.symbol == tokenSymbol && t.chainId.toString() == chainId)

  return {
    protocolsNames,
    getProtocolByName,
    getProtocolChains,
    getProtocolTokensSymbols,
    exitsTokenInProtocol,
    getProtocolTokens,
    getTokenBySymbolAndChain,
  }
}
