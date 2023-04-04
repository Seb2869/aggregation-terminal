import styled from 'styled-components'

export const BaseTitle = styled.h1`
  color: ${({ theme: { colors } }) => colors.textColor};
  font-size: 2.4rem;
  font-weight: 600;
  line-height: 1.2;
  margin: 0 0 8px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-shadow: 0px 0px 4px rgba(255, 255, 255, 0.55);
  @media (min-width: ${({ theme }) => theme.breakPoints.tabletPortraitStart}) {
    font-size: 2.8rem;
  }
  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    font-size: 3.2rem;
    margin: 0 0 12px;
  }
`
