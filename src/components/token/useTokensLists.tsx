import { useEffect, useMemo, useState } from 'react'

import protocolsConfig from '@/public/protocols.json'
import { useTokensInfo } from '@/src/providers/tokenIconsProvider'
import { Token } from '@/types/token'

const typedProtocolsConfig = protocolsConfig as Record<string, Record<string, string[]>>

export const useTokensLists = (onChange?: (token: Token | null) => void) => {
  const [token, setToken] = useState<Token | null>(null)
  const { tokens: allTokens } = useTokensInfo()
  const tokens = useMemo(() => {
    // Filter protocol tokens.
    // First, we gather all the tokens symbols of all the protocols supported.
    // Then, we get the info of each token using the list of symbols.
    // note: we return the first token found, it might be of any chain
    const filteredTokens: string[] = []
    const protocolNames = Object.keys(typedProtocolsConfig)

    protocolNames.forEach((protocolKey) => {
      const protocolTokens = typedProtocolsConfig[protocolKey]
      const protocolTokensByChain = Object.keys(protocolTokens)
      protocolTokensByChain.forEach((chainId) => {
        const tokensByChain = typedProtocolsConfig[protocolKey][chainId]
        tokensByChain.forEach((tokenSymbol) => {
          if (filteredTokens.indexOf(tokenSymbol) == -1) {
            filteredTokens.push(tokenSymbol)
          }
        })
      })
    })

    return allTokens.filter((t) => filteredTokens.includes(t.symbol))
  }, [allTokens])
  const [tokensList, setTokensList] = useState(tokens)
  const [searchString, setSearchString] = useState('')

  const onSelectToken = (token: Token | null) => {
    setToken(token)

    if (typeof onChange !== 'undefined') {
      onChange(token)
    }
  }

  useEffect(() => {
    if (searchString.length === 0) {
      setTokensList(tokens)
    } else {
      const filteredTokens = tokens.filter(
        (item) =>
          (item.name.toLowerCase().indexOf(searchString.toLowerCase()) &&
            item.symbol.toLowerCase().indexOf(searchString.toLowerCase())) !== -1,
      )
      setTokensList(filteredTokens)
    }
  }, [tokens, searchString])

  return {
    allTokens,
    token,
    tokensList,
    onSelectToken,
    searchString,
    setSearchString,
  }
}
