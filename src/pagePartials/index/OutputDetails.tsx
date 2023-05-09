import { wei } from '@synthetixio/wei'
import { BigNumber } from 'ethers'
import { motion } from 'framer-motion'

import { Tooltip } from '@/src/components/common/Tooltip'
import { List, Stats } from '@/src/components/text/List'
import { formatAmount } from '@/src/utils/GMX/format'
import { ZERO_BIG_NUM } from '@/src/utils/KWENTA/constants'
import { Position, ProtocolStats } from '@/types/utils'

function setStyle(value?: BigNumber, comparison?: BigNumber) {
  if (!comparison) return value?.lte(ZERO_BIG_NUM) ? 'negative' : 'positive'
  if (!value || value.eq(comparison)) return 'equal'
  return comparison.gt(value) ? 'better' : 'worse'
}

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
}

type Props = {
  tokenSymbol: string
  margin: BigNumber
  local: ProtocolStats
  comparison?: ProtocolStats
  positionSide: Position
}
export function OutputDetails({ comparison, local, margin, positionSide, tokenSymbol }: Props) {
  const getTradeFeeText = (protocol: string) => {
    const text =
      protocol === 'Kwenta'
        ? 'Fees are displayed as maker / taker. Maker fees apply to orders that reduce the market skew. Taker fees apply to orders that increase the market skew.'
        : 'The cost of swapping tokens to execute the trade.'
    return text
  }
  const get1hrFundingText = (protocol: string) => {
    const text =
      protocol === 'Kwenta'
        ? 'Hourly payments to maintain an open position. If the number is negative, the fee is received by the user. If not, the fee is charged to the user.'
        : 'Hourly payments to maintain an open position.'
    return text
  }
  return (
    <Stats animate="show" as={motion.ul} initial="hidden" variants={container}>
      <List as={motion.li} variants={itemVariants}>
        <span>Investment</span>
        <strong>
          {formatAmount(margin, 18, 2)} {local.investmentTokenSymbol}
        </strong>
      </List>
      <List
        as={motion.li}
        status={
          positionSide == 'long'
            ? setStyle(local.fillPrice, comparison?.fillPrice)
            : setStyle(comparison?.fillPrice, local.fillPrice)
        }
        variants={itemVariants}
      >
        <span>
          <Tooltip text="The estimated price at which the order will be executed.">
            Fill Price
          </Tooltip>
        </span>
        <strong>{formatAmount(local.fillPrice, 18, 2)}</strong>
      </List>
      <List
        as={motion.li}
        status={setStyle(comparison?.position, local.position)}
        variants={itemVariants}
      >
        <span>
          <Tooltip text="The notional value of the position, expressed in the investment currency.">
            Position
          </Tooltip>
        </span>
        <strong>{formatAmount(local.position, 18, 2)}</strong>
      </List>
      <List
        as={motion.li}
        status={setStyle(comparison?.orderSize, local.orderSize)}
        variants={itemVariants}
      >
        <span>
          <Tooltip text="The notional value of the position, expressed in the spot price of the token selected.">
            Size
          </Tooltip>
        </span>
        <strong>
          {formatAmount(local.orderSize)} {tokenSymbol}
        </strong>
      </List>
      <List as={motion.li} variants={itemVariants}>
        <span>
          <Tooltip text="Correlation between the incoming trade, and the price of the asset.">
            Price Impact
          </Tooltip>
        </span>
        <strong>{formatAmount(local.priceImpact)}</strong>
      </List>
      <List as={motion.li} variants={itemVariants}>
        <span>
          <Tooltip text="Fees the protocol charges for opening a position.">Protocol Fee</Tooltip>
        </span>
        <strong>
          {local.protocol === 'Kwenta' ? '-' : formatAmount(local.protocolFee, 18, 2)}{' '}
        </strong>
      </List>
      <List
        as={motion.li}
        status={setStyle(local.swapFee, comparison?.swapFee)}
        variants={itemVariants}
      >
        <span>
          <Tooltip text={getTradeFeeText(local.protocol)}>
            {local.protocol === 'Kwenta' ? 'Trade Fee' : 'Swap Fee'}{' '}
          </Tooltip>
        </span>
        <strong>{formatAmount(local.swapFee, 18, 2)}</strong>
      </List>
      <List
        as={motion.li}
        status={setStyle(local.executionFee, comparison?.executionFee)}
        variants={itemVariants}
      >
        <span>
          <Tooltip text="Fixed fee to cover automated order execution">Execution Fee</Tooltip>
        </span>
        <strong>{formatAmount(local.executionFee, 18, 2)}</strong>
      </List>

      <List
        as={motion.li}
        status={
          positionSide == 'long'
            ? setStyle(local.liquidationPrice, comparison?.liquidationPrice)
            : setStyle(comparison?.liquidationPrice, local.liquidationPrice)
        }
        variants={itemVariants}
      >
        <span>
          <Tooltip text="The price at which the position is liquidated.">Liquidation Price</Tooltip>
        </span>
        <strong>{formatAmount(local.liquidationPrice, 18, 2)}</strong>
      </List>
      <List as={motion.li} variants={itemVariants}>
        <span>
          <Tooltip text={get1hrFundingText(local.protocol)}>1H Funding</Tooltip>
        </span>
        <strong>{formatAmount(local.oneHourFunding)}</strong>
      </List>
    </Stats>
  )
}
