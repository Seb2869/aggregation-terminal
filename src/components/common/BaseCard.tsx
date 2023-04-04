import styled from 'styled-components'

export const BaseCard = styled.div`
  background-color: ${({ theme: { card } }) => card.backgroundColor};
  border-radius: ${({ theme: { card } }) => card.borderRadius};
  border: 1px solid ${({ theme: { card } }) => card.borderColor};
  width: 100%;
  padding: calc(${({ theme: { card } }) => card.paddingVertical} / 2)
    calc(${({ theme: { card } }) => card.paddingHorizontal} / 2);
  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    padding: ${({ theme: { card } }) => card.paddingVertical}
      ${({ theme: { card } }) => card.paddingHorizontal};
  }
`
