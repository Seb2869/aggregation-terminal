/* Properties common to any themes                     */
/* Add dimensions, fonts, paddings, margins, etc. here */

const borderRadius = '8px'
const radioAndCheckDimensions = '14px'
const componentPaddingHorizontal = '40px'
const componentPaddingVertical = '40px'

export const common = {
  common: {
    borderRadius: borderRadius,
  },
  fonts: {
    defaultSize: '1.6rem',
    family:
      "'Bai Jamjuree', 'Helvetica Neue', 'Arial', 'Segoe UI', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'",
    familyCode: "'source-code-pro', 'Menlo', 'Monaco', 'Consolas', 'Courier New', 'monospace'",
  },
  checkBox: {
    dimensions: radioAndCheckDimensions,
  },
  radioButton: {
    dimensions: radioAndCheckDimensions,
  },
  dropdown: {
    borderRadius: borderRadius,
  },
  header: {
    height: '60px',
  },
  layout: {
    horizontalPaddingDesktopStart: '40px',
    horizontalPaddingDesktopWideStart: '40px',
    horizontalPaddingMobile: '10px',
    horizontalPaddingTabletLandscapeStart: '20px',
    horizontalPaddingTabletPortraitStart: '20px',
    maxWidth: '1000px',
  },
  breakPoints: {
    desktopStart: '1025px',
    desktopWideStart: '1281px',
    tabletLandscapeStart: '769px',
    tabletPortraitStart: '481px',
  },
  card: {
    borderRadius: borderRadius,
    paddingHorizontal: componentPaddingHorizontal,
    paddingVertical: componentPaddingVertical,
  },
}
