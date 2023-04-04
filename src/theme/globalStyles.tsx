import { createGlobalStyle } from 'styled-components'

import { onBoardCSS } from '@/src/theme/onBoard'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GlobalStyles = createGlobalStyle<{ theme: any }>`
  html {
    font-size: 10px;
    scroll-behavior: smooth;
  }

  body {
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    background-color: ${({ theme: { body } }) => body.backgroundColor};
    color: ${({ theme: { colors } }) => colors.textColor};
    font-family: ${({ theme: { fonts } }) => fonts.family};
    font-size: ${({ theme: { fonts } }) => fonts.defaultSize};
    line-height: 1.4;
    min-height: 100vh;
    outline-color: ${({ theme: { colors } }) => colors.secondary};
    &:after{
      background-image: ${({ theme: { body } }) => body.backgroundImage};
      background-size: cover;
      height: 400px;
      width: 100%;
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      z-index: -1;
    }
  }

  code {
    font-family: ${({ theme: { fonts } }) => fonts.familyCode};
  }

  #__next {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    width: 100%;
  }

  hr {
    display: block;
    height: auto;
    margin: 30px 0;
    width: 100%;
  }

  a {
    color: ${({ theme: { colors } }) => colors.textColor};
  }

  ::selection {
    color: ${({ theme }) => theme.colors.white} !important;
    background: #000 !important;
    *{
      color: ${({ theme }) => theme.colors.white} !important;
    }
  }
  ::-moz-selection {
    color: ${({ theme }) => theme.colors.white} !important;
    background: #000 !important;
    *{
      color: ${({ theme }) => theme.colors.white} !important;
    }
  }
  a, button{
    transition: all 0.3s ease-in-out;
  }

  ${onBoardCSS}
`
