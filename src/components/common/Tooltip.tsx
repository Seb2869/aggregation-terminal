import React, { useState } from 'react'
import styled, { keyframes } from 'styled-components'

import { Tooltip as TooltipIcon } from '@/src/components/assets/Tooltip'

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`
const Wrapper = styled.span`
  position: relative;
  z-index: 10;
  display: inline-flex;
  align-self: flex-start;
  border: none;
  cursor: help;
  &:focus {
    border: none;
  }
  > span {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`
const TooltipWrapper = styled.div`
  animation: ${fadeIn} 0.5s ease-in-out;
  background-color: ${({ theme }) => theme.colors.darkGrayDarkened};
  border-radius: 4px;
  box-shadow: ${({ theme: { dropdown } }) => dropdown.boxShadow};
  color: ${({ theme }) => theme.colors.white};
  display: inline-block;
  font-size: 1.3rem;
  line-height: 1.2;
  padding: 12px;
  position: absolute;
  left: 0;
  bottom: 100%;
  margin-bottom: 10px;
  max-width: 180px;
  width: max-content;
  white-space: pre-line;
  &::before {
    content: '';
    position: absolute;
    display: block;
    width: 0px;
    left: 20px;
    bottom: -6px;
    border: 6px solid transparent;
    border-bottom: 0;
    border-top: 6px solid ${({ theme }) => theme.colors.darkGrayDarkened};
  }
`

interface Props {
  text: string
  children: React.ReactNode
}

export const Tooltip: React.FC<Props> = ({ children, text }) => {
  const [isHovering, setIsHovering] = useState(false)
  return (
    <Wrapper>
      {isHovering && <TooltipWrapper>{text}</TooltipWrapper>}

      <span
        onMouseEnter={() => {
          {
            setIsHovering(true)
          }
        }}
        onMouseLeave={() => {
          {
            setIsHovering(false)
          }
        }}
      >
        {children} <TooltipIcon />
      </span>
    </Wrapper>
  )
}
