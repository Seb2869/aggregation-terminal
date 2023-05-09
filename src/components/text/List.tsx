import styled from 'styled-components'

interface GMXStatsProps {
  status?: string
}

export const Stats = styled.ul`
  border-top: 1px solid ${({ theme: { card } }) => card.borderColor};
  margin: 12px 0 0 0;
  padding: 32px 0 0 0;
  width: 100%;
`
export const List = styled.li<GMXStatsProps>`
  border-radius: 3px;
  font-size: 1.6rem;
  line-height: 1.3;
  padding: 7px 12px;
  display: flex;
  justify-content: space-between;
  list-style: none;
  &:nth-child(odd) {
    background-color: ${({ theme }) => theme.colors.gray};
  }
  span {
    color: ${({ theme }) => theme.colors.lightGray};
    font-weight: 400;
  }
  strong {
    font-weight: 500;
    color: ${({ status, theme: { colors } }) =>
      status === 'better' || status === 'positive'
        ? colors.success
        : status === 'worse'
        ? colors.lighterGray
        : status === 'negative'
        ? colors.error
        : colors.white};
  }
`
