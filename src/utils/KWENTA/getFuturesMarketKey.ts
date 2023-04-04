import { formatBytes32String } from '@ethersproject/strings'

import { FuturesMarketKey } from '@/src/utils/KWENTA/constants'

export function getFuturesMarketKey() {
  const marketKey = FuturesMarketKey.sETHPERP
  const marketKeyBytes = formatBytes32String(marketKey)

  return { marketKey, marketKeyBytes }
}
