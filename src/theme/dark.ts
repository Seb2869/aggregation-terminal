/* Dark Theme            */
/* Add only colors here. */

import { darken, transparentize } from 'polished'

const error = '#FE6D64'
const success = '#64FEAB'
const warning = '#FE6D64'
const primary = '#996939'
const secondary = error
const tertiary = '#A6CFD5'
const textColor = '#fff'
const borderColorAlpha = 'rgba(38,41,44,0.6)'
const borderColor = '#26292C'
const lightGray = '#737D8D'
const lighterGray = '#8A93A1'
const gray = '#15181A'
const darkGray = '#0D0F10'
const darkestGray = '#101213'
const darkGrayDarkened = darken(0.1, 'rgb(10, 25, 50)')
const darkBlue = 'rgb(6, 75, 141)'
const componentBackgroundColor = 'rgba(13, 2, 2, 0.85)'
const white = '#ffffff'

export const dark = {
  body: {
    backgroundColor: darkGray,
    backgroundImage: 'url(/images/bg.jpg)',
  },
  buttonDropdown: {
    backgroundColor: gray,
    backgroundColorHover: darkGray,
    borderColor: borderColor,
    borderColorHover: borderColor,
    color: textColor,
    colorHover: textColor,
  },
  buttonPrimary: {
    backgroundColor: gray,
    backgroundColorHover: darkGray,
    borderColor: borderColor,
    borderColorHover: white,
    color: textColor,
    colorHover: textColor,
  },
  card: {
    backgroundColor: darkestGray,
    borderColor: borderColor,
  },
  checkBox: {
    backgroundColorActive: secondary,
    backgroundColor: darkGray,
    borderColor: borderColor,
  },
  colors: {
    borderColor: borderColor,
    componentBackgroundColor: componentBackgroundColor,
    gray: gray,
    lightGray: lightGray,
    lighterGray: lighterGray,
    darkBlue: darkBlue,
    darkGray: darkGray,
    darkestGray: darkestGray,
    darkGrayDarkened: darkGrayDarkened,
    error: error,
    primary: primary,
    secondary: secondary,
    success: success,
    tertiary: tertiary,
    textColor: textColor,
    warning: warning,
    white: white,
  },
  dropdown: {
    background: darkestGray,
    borderColor: borderColor,
    boxShadow: '0px 8px 12px rgba(13, 15, 16, 0.2)',
    item: {
      backgroundColor: 'transparent',
      backgroundColorHover: gray,
      borderColor: borderColor,
      color: textColor,
      colorDanger: error,
      colorHover: textColor,
      colorOK: success,
    },
  },
  textField: {
    backgroundColor: gray,
    borderColor: borderColor,
    color: textColor,
    errorColor: error,
    successColor: success,
    active: {
      backgroundColor: darkGray,
      borderColor: lightGray,
      boxShadow: 'none',
      color: textColor,
    },
    placeholder: {
      color: '#8A93A2',
    },
  },
  header: {
    backgroundColor: transparentize(0.9, darkGray),
    borderColor: borderColorAlpha,
    color: textColor,
  },
  mainMenu: {
    color: textColor,
  },
  mobileMenu: {
    color: textColor,
    backgroundColor: '#000',
    borderColor: borderColor,
  },
  modal: {
    overlayColor: 'rgba(0, 0, 0, 0.8)',
  },
  radioButton: {
    backgroundColorActive: secondary,
    backgroundColor: darkGray,
    borderColor: borderColor,
  },
  onBoard: {
    backgroundColor: componentBackgroundColor,
    color: textColor,
    borderRadius: '5px',
    borderColor: borderColor,
    sidebarBackgroundColor: 'rgb(235, 235, 237)',
  },
  toast: {
    backgroundColor: componentBackgroundColor,
    borderColor: borderColor,
    boxShadow: '0 0 10px rgba(255, 255, 255, 0.25)',
  },
}
