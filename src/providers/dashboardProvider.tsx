import {
  Dispatch,
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useReducer,
} from 'react'

import isEmpty from 'lodash/isEmpty'

import { Chains } from '@/src/config/web3'
import { ProtocolForm, ProtocolStats, TradeForm } from '@/types/utils'

export type DashboardValues = {
  tradeForm: TradeForm
  protocolAForm: ProtocolForm
  protocolAStats: ProtocolStats | null
  protocolBForm: ProtocolForm
  protocolBStats: ProtocolStats | null
}

type DashboardContext = DashboardValues & { setValues: Dispatch<Partial<DashboardValues>> }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dashboardContext = createContext<DashboardContext>({} as any)

export const DashboardProvider: FC<PropsWithChildren> = ({ children }) => {
  const [contextValues, setContextValues] = useReducer(
    (data: DashboardValues, partial: Partial<DashboardValues>): DashboardValues => ({
      ...data,
      ...partial,
    }),
    {
      tradeForm: {
        token: 'ETH',
        leverage: '2',
        position: 'long',
        amount: '',
      },
      protocolAForm: {
        name: 'Kwenta',
        chain: Chains.optimism,
        url: 'https://kwenta.eth.limo/market/?asset=sETH&accountType=cross_margin',
      },
      protocolAStats: null,
      protocolBForm: {
        name: 'GMX',
        chain: Chains.arbitrum,
        url: 'https://app.gmx.io/#/trade',
      },
      protocolBStats: null,
    },
  )

  useEffect(() => {
    setContextValues({
      protocolAStats: null,
      protocolBStats: null,
    })
  }, [contextValues.tradeForm])

  return (
    <dashboardContext.Provider value={{ ...contextValues, setValues: setContextValues }}>
      {children}
    </dashboardContext.Provider>
  )
}

export default DashboardProvider

export function useDashboardInfo(): DashboardContext {
  const context = useContext(dashboardContext)
  if (context === undefined || isEmpty(context)) {
    throw new Error('useWeb3Connection must be used within a Web3ConnectionProvider')
  }
  return useContext(dashboardContext)
}
