import styled from 'styled-components'

import { motion } from 'framer-motion'

import { ButtonPrimary } from '@/src/components/buttons/Button'
import { BaseCard } from '@/src/components/common/BaseCard'
import { Formfield } from '@/src/components/form/Formfield'
import { Label } from '@/src/components/form/Label'
import { Textfield, TextfieldStatus } from '@/src/components/form/Textfield'
import { TokenDropdown as BaseDropdown } from '@/src/components/token/TokenDropdown'
import { useDashboardInfo } from '@/src/providers/dashboardProvider'
import { TradeForm } from '@/types/utils'

const Wrapper = styled.section`
  grid-area: unset;
  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    grid-area: 1 / 1 / 2 / 3;
  }
`
const Card = styled(BaseCard)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 50%;
  position: relative;
  padding-top: 100px;
`
const Positions = styled.div`
  display: flex;
  position: absolute;
  top: 0;
  width: 100%;
  left: 0;
`
const Position = styled.button`
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-weight: 600;
  font-size: 1.4rem;
  height: 60px;
  text-align: center;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  min-width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme: { colors } }) => colors.gray};
  color: ${({ theme: { colors } }) => colors.secondary};
  cursor: pointer;
  border: 1px solid #26292c;
  transition: all 0.3s ease-in-out;
  &:first-child {
    border-top-left-radius: ${({ theme: { card } }) => card.borderRadius};
  }
  &:last-child {
    border-top-right-radius: ${({ theme: { card } }) => card.borderRadius};
  }
  &.long {
    color: ${({ theme: { colors } }) => colors.success};
  }
  &.short {
    color: ${({ theme: { colors } }) => colors.error};
  }
  &.active {
    background-color: transparent !important;
    border: 1px solid ${({ theme: { colors } }) => colors.darkestGray} !important;
    color: ${({ theme: { colors } }) => colors.textColor};
    &.long {
      box-shadow: inset 0px 4px 0px ${({ theme: { colors } }) => colors.success};
    }
    &.short {
      box-shadow: inset 0px 4px 0px ${({ theme: { colors } }) => colors.error};
    }
  }
  &:hover,
  &:focus {
    border: 1px solid ${({ theme: { colors } }) => colors.darkestGray};
    color: ${({ theme: { colors } }) => colors.textColor};
    background: ${({ theme: { colors } }) => colors.darkGray};
  }
`

const TabContent = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 3fr;
  grid-column-gap: 40px;
  grid-row-gap: 20px;
  align-items: end;
  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
  }
`

const InputWrapper = styled.div`
  position: relative;
  margin-top: 10px;
  span {
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.6rem;
    color: ${({ theme: { colors } }) => colors.lightGray};
    pointer-events: none;
    text-transform: lowercase;
    z-index: 10;
  }
  input {
    margin-top: 0px;
    padding-left: 32px;
  }
`
const LeverageOptions = styled.div`
  display: flex;
  gap: 12px;
  @media (max-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    gap: 6px;
  }
  button {
    flex: 1;
    padding: 0;
    column-gap: 0px;
    &::before {
      content: 'x';
      color: ${({ theme: { colors } }) => colors.lightGray};
      margin-right: 2px;
      display: inline-block;
    }
    @media (max-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
      font-size: 1.4rem;
    }
  }
`
const TokenDropdown = styled(BaseDropdown)`
  margin-left: auto;
`

export const Configuration: React.FC = () => {
  const { setValues, tradeForm: form } = useDashboardInfo()
  const { amount, leverage, position, token } = form
  const setForm = (data: Partial<TradeForm>) => setValues({ tradeForm: { ...form, ...data } })

  return (
    <Wrapper
      animate={{ opacity: 1, height: 'auto', y: 0 }}
      as={motion.section}
      initial={{ opacity: 0, height: 0, y: -40 }}
      transition={{ ease: 'backInOut', duration: 0.4 }}
    >
      <Card>
        <Positions>
          <Position
            className={`long ${position == 'long' && 'active'}`}
            onClick={() => setForm({ position: 'long' })}
          >
            Long
          </Position>
          <Position
            className={`short ${position == 'short' && 'active'}`}
            onClick={() => setForm({ position: 'short' })}
          >
            Short
          </Position>
        </Positions>

        <TabContent>
          <Label>
            <span>Amount in usd </span>
            <InputWrapper>
              <span>$</span>
              <Formfield
                formControl={
                  <Textfield
                    onChange={(event) => setForm({ amount: event.target.value })}
                    onKeyDown={(event) => {
                      const key = event.key
                      if (key == '-') {
                        event.preventDefault()
                      }
                    }}
                    placeholder="0.00"
                    type="number"
                  />
                }
                status={amount && Number(amount) < 3 ? TextfieldStatus.error : undefined}
                statusText={
                  amount && Number(amount) < 3
                    ? 'Amount must equal or be greater than 3'
                    : undefined
                }
              />
            </InputWrapper>
          </Label>

          <Label>
            <span>Token</span>
            <TokenDropdown changeToken={(token) => setForm({ token })} defaultToken={token} />
          </Label>

          <Label>
            <span>Leverage</span>
            <InputWrapper>
              <span>x</span>
              <Formfield
                formControl={
                  <Textfield
                    max="25"
                    min="1"
                    onChange={(event) => setForm({ leverage: event.target.value })}
                    onKeyDown={(event) => {
                      const key = event.key
                      if (key == '.' || key == ',') {
                        event.preventDefault()
                      }
                    }}
                    placeholder="10"
                    step={1}
                    type="number"
                    value={leverage}
                  />
                }
                status={leverage && Number(leverage) > 25 ? TextfieldStatus.error : undefined}
                statusText={leverage && Number(leverage) > 25 ? 'Max value is 25' : undefined}
              />
            </InputWrapper>
          </Label>

          <LeverageOptions>
            {[1, 5, 10, 15, 20, 25].map((value) => (
              <ButtonPrimary
                className={leverage == value.toString() ? 'active' : ''}
                key={value}
                onClick={() => setForm({ leverage: value.toString() })}
              >
                {value}
              </ButtonPrimary>
            ))}
          </LeverageOptions>
        </TabContent>
      </Card>
    </Wrapper>
  )
}
