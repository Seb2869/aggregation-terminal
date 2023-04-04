import type { NextPage } from 'next'
import styled from 'styled-components'

import SafeSuspense, { withGenericSuspense } from '@/src/components/helpers/SafeSuspense'
import { Configuration as TradeParams } from '@/src/components/position/PositionParams'
import { Protocol } from '@/src/pagePartials/index/Protocol'
import { useDashboardInfo } from '@/src/providers/dashboardProvider'
import { ProtocolForm, ProtocolStats } from '@/types/utils'

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 3fr;
  grid-column-gap: 20px;
  grid-row-gap: 20px;
  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const Home: NextPage = () => {
  const { protocolAForm, protocolAStats, protocolBForm, protocolBStats, setValues, tradeForm } =
    useDashboardInfo()

  return (
    <Layout>
      <TradeParams />
      <SafeSuspense>
        <Protocol
          protocolForm={protocolAForm}
          protocolStats={protocolAStats}
          protocolStatsForeign={protocolBStats}
          setProtocolForm={(newValues: ProtocolForm) => setValues({ protocolAForm: newValues })}
          setProtocolStats={(newValues: ProtocolStats | null) =>
            setValues({ protocolAStats: newValues })
          }
          tradeForm={tradeForm}
        />
      </SafeSuspense>
      <SafeSuspense>
        <Protocol
          protocolForm={protocolBForm}
          protocolStats={protocolBStats}
          protocolStatsForeign={protocolAStats}
          setProtocolForm={(newValues: ProtocolForm) => setValues({ protocolBForm: newValues })}
          setProtocolStats={(newValues: ProtocolStats | null) =>
            setValues({ protocolBStats: newValues })
          }
          tradeForm={tradeForm}
        />
      </SafeSuspense>
    </Layout>
  )
}
export default withGenericSuspense(Home)
