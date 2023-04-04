import Image from 'next/image'
import { useState } from 'react'
import styled from 'styled-components'

const Placeholder = styled.div<{ dimensions: string }>`
  align-items: center;
  background-color: #000;
  border-radius: 50%;
  color: #fff;
  display: flex;
  font-size: 80%;
  font-weight: 700;
  height: ${({ dimensions }) => dimensions}px;
  justify-content: center;
  line-height: 1;
  text-transform: uppercase;
  width: ${({ dimensions }) => dimensions}px;
`

interface Props {
  dimensions?: number
  symbol: string
}

export const Icon: React.FC<Props> = ({ dimensions = 20, symbol, ...restProps }) => {
  const [error, setError] = useState(false)
  const image = `/icons/${symbol.toLowerCase()}.svg`

  return image && !error ? (
    <Image
      alt={symbol}
      className="icon"
      height={dimensions}
      onError={() => setError(true)}
      src={image}
      title={symbol}
      width={dimensions}
      {...restProps}
    />
  ) : (
    <Placeholder dimensions={`${dimensions}`}>{symbol[0]}</Placeholder>
  )
}
