import { useEffect } from 'react'
import styled from 'styled-components'

import { parseUnits } from 'ethers/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'

import { BaseCard } from '@/src/components/common/BaseCard'
import { DropdownDirection } from '@/src/components/common/Dropdown'
import { Label } from '@/src/components/form/Label'
import Select from '@/src/components/form/Select'
import { chainsConfig } from '@/src/config/web3'
import { useMarketStats } from '@/src/hooks/useMarketStats'
import { OutputDetails } from '@/src/pagePartials/index/OutputDetails'
import getProtocols from '@/src/utils/getProtocols'
import { ChainsValues } from '@/types/chains'
import { ProtocolForm, ProtocolNames, ProtocolStats, TradeForm } from '@/types/utils'

const Card = styled(BaseCard)`
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
`

const OutputWrapper = styled.div`
  overflow: hidden;
  text-align: center;
`

const PlatformLink = styled.a`
  border-radius: ${({ theme: { card } }) => card.borderRadius};
  outline: none;
  white-space: nowrap;
  transition: all 0.1s ease-in-out 0s;
  background: rgb(37, 37, 37);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: ${({ theme }) => theme.colors.textColor};
  padding: 10px 30px;
  display: inline-flex;
  text-decoration: none;
  margin-top: 30px;
  &:hover,
  &:focus {
    background-color: ${({ theme: { buttonPrimary } }) => buttonPrimary.backgroundColorHover};
    color: ${({ theme: { buttonPrimary } }) => buttonPrimary.colorHover};
  }
`

type Props = {
  tradeForm: TradeForm
  protocolForm: ProtocolForm
  protocolStats: ProtocolStats | null
  protocolStatsForeign: ProtocolStats | null
  setProtocolForm: (newValues: ProtocolForm) => void
  setProtocolStats: (newValues: ProtocolStats | null) => void
}

const chainsStoreNamed = (chainsStore: Array<number>) =>
  chainsStore.reduce((namedArray: string[], chainId) => {
    namedArray.push(chainsConfig[Number(chainId) as ChainsValues]?.shortName || chainId.toString())
    return namedArray
  }, [])

export const Protocol: React.FC<Props> = ({
  protocolForm,
  protocolStats,
  protocolStatsForeign,
  setProtocolForm,
  setProtocolStats,
  tradeForm,
}) => {
  const protocols = getProtocols()
  const { getProtocolChains, protocolsNames } = protocols

  const resSWR = useMarketStats(tradeForm, protocolForm, protocolStats)

  useEffect(() => {
    // Note: we assume that if fillPrice is different, it should update the state
    if (resSWR.data && protocolStats?.fillPrice !== resSWR.data.fillPrice) {
      setProtocolStats(resSWR.data)
    }
  }, [resSWR, protocolStats, setProtocolStats])

  const showOutput =
    protocolStats !== null &&
    tradeForm.amount &&
    tradeForm.amount != '0' &&
    Number(tradeForm.leverage) > 0 &&
    Number(tradeForm.leverage) < 26

  return (
    <Card
      animate={{ opacity: 1, y: 0 }}
      as={motion.div}
      initial={{ opacity: 0, y: -20 }}
      transition={{ ease: 'backInOut', duration: 0.3 }}
    >
      <Label>
        <span>Exchange</span>
        <Select
          defaultItem={protocolForm.name}
          disabled
          onChange={(protocol) =>
            setProtocolForm({ ...protocolForm, name: protocol as ProtocolNames })
          }
          options={protocolsNames}
        />
      </Label>
      <Label>
        <span>Chain</span>
        <Select
          disabled={chainsStoreNamed(getProtocolChains(protocolForm.name)).length < 2}
          dropdownDirection={
            !tradeForm.amount ? DropdownDirection.upwards : DropdownDirection.downwards
          }
          onChange={(chain) =>
            setProtocolForm({ ...protocolForm, chain: chain as unknown as ChainsValues })
          }
          options={chainsStoreNamed(getProtocolChains(protocolForm.name))}
        />
      </Label>
      <AnimatePresence mode="wait">
        {showOutput && (
          <OutputWrapper
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            as={motion.div}
            exit={{
              opacity: 0,
              height: 0,
              transition: { ease: 'easeOut', duration: 0.5 },
            }}
            initial={{ opacity: 0, height: 0, y: -30 }}
            key={protocolForm.name}
            transition={{ ease: 'easeIn', duration: 0.1 }}
          >
            <OutputDetails
              comparison={{
                protocol: protocolForm.name,
                investmentTokenSymbol: protocolForm.name == 'GMX' ? 'USDC' : 'sUSD',
                ...protocolStatsForeign,
              }}
              local={protocolStats}
              margin={parseUnits(tradeForm.amount)}
              positionSide={tradeForm.position}
              tokenSymbol={tradeForm.token}
            />
            <PlatformLink href={protocolForm.url} rel="noreferrer" target="_blank">
              Go to {protocolForm.name}
            </PlatformLink>
          </OutputWrapper>
        )}
      </AnimatePresence>
    </Card>
  )
}
