import styled, { css } from 'styled-components'

import { ThemeType } from '@/src/theme/types'

export const DisabledButtonCSS = css`
  &[disabled],
  &[disabled]:hover {
    cursor: not-allowed;
    opacity: 0.5;
  }
`

export const ActiveButtonCSS = css`
  &:active {
    opacity: 0.7;
  }
`

export const ButtonCSS = css`
  align-items: center;
  border-radius: ${({ theme: { common } }) => common.borderRadius};
  border-style: solid;
  border-width: 1px;
  column-gap: 10px;
  cursor: pointer;
  display: flex;
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 1.6rem;
  font-weight: 500;
  height: 60px;
  justify-content: center;
  line-height: 1;
  outline: none;
  padding: 0 20px;
  text-align: center;
  text-decoration: none;
  transition: all 0.15s ease-out;
  user-select: none;
  white-space: nowrap;

  ${ActiveButtonCSS}
`

const BaseButton = styled.button`
  ${ButtonCSS}
`

BaseButton.defaultProps = {
  type: 'button',
}

export const Button = styled(BaseButton)`
  ${DisabledButtonCSS}
`

export const ButtonPrimaryCSS = css`
  background-color: ${({ theme: { buttonPrimary } }) => buttonPrimary.backgroundColor};
  border-color: ${({ theme: { buttonPrimary } }) => buttonPrimary.borderColor};
  color: ${({ theme: { buttonPrimary } }) => buttonPrimary.color};

  &:hover,
  &.active {
    background-color: ${({ theme: { buttonPrimary } }) => buttonPrimary.backgroundColorHover};
    border-color: ${({ theme: { buttonPrimary } }) => buttonPrimary.borderColorHover};
    color: ${({ theme: { buttonPrimary } }) => buttonPrimary.colorHover};
  }

  ${DisabledButtonCSS}

  &[disabled],
  &[disabled]:hover {
    background-color: ${({ theme: { buttonPrimary } }) => buttonPrimary.backgroundColor};
    border-color: ${({ theme: { buttonPrimary } }) => buttonPrimary.borderColor};
    color: ${({ theme: { buttonPrimary } }) => buttonPrimary.color};
  }
`

export const ButtonPrimary = styled(BaseButton)`
  ${ButtonPrimaryCSS}
`

export const ButtonDropdownIsOpenCSS = css`
  &::after {
    transform: rotate(180deg);
  }
`

export const ButtonDropdownCSS = css<{ currentThemeName?: ThemeType }>`
  background-color: ${({ theme: { buttonDropdown } }) => buttonDropdown.backgroundColor};
  border-color: ${({ theme: { buttonDropdown } }) => buttonDropdown.borderColor};
  color: ${({ theme: { buttonDropdown } }) => buttonDropdown.color};

  &:hover {
    background-color: ${({ theme: { buttonDropdown } }) => buttonDropdown.backgroundColorHover};
    border-color: ${({ theme: { buttonDropdown } }) => buttonDropdown.borderColorHover};
    color: ${({ theme: { buttonDropdown } }) => buttonDropdown.colorHover};
  }

  &::after {
    --dimensions: 8px;

    content: '';

    background-position: 50% 50%;
    background-repeat: no-repeat;
    flex-shrink: 0;
    gap: 10px;
    height: var(--dimensions);
    width: var(--dimensions);

    ${({ currentThemeName }) =>
      currentThemeName === 'dark'
        ? css`
            background-image: url('data:image/svg+xml;base64, PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iNiIgdmlld0JveD0iMCAwIDEwIDYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNOS40MTk3IDAuNTI1MDg3QzkuNzEyNiAwLjgxNzk3NyA5LjcxMjYgMS4yOTI4NiA5LjQxOTcgMS41ODU3NUw1LjUzMDYyIDUuNDc0ODRDNS4yMzc3MiA1Ljc2Nzc0IDQuNzYyODUgNS43Njc3NCA0LjQ2OTk2IDUuNDc0ODRMMC41ODEwMDMgMS41ODU4OEMwLjI4ODEwMyAxLjI5Mjk5IDAuMjg4MTAzIDAuODE4MTA4IDAuNTgxMDAzIDAuNTI1MjE4QzAuODczODkzIDAuMjMyMzI4IDEuMzQ4NzcgMC4yMzIzMjggMS42NDE2NiAwLjUyNTIxOEw1LjAwMDI5IDMuODgzODVMOC4zNTkgMC41MjUwODdDOC42NTE5IDAuMjMyMTk3IDkuMTI2OCAwLjIzMjE5NyA5LjQxOTcgMC41MjUwODdaIiBmaWxsPSIjNzM3RDhEIi8+Cjwvc3ZnPgo=');
          `
        : css`
            background-image: url('data:image/svg+xml;base64, PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iNiIgdmlld0JveD0iMCAwIDEwIDYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNOS40MTk3IDAuNTI1MDg3QzkuNzEyNiAwLjgxNzk3NyA5LjcxMjYgMS4yOTI4NiA5LjQxOTcgMS41ODU3NUw1LjUzMDYyIDUuNDc0ODRDNS4yMzc3MiA1Ljc2Nzc0IDQuNzYyODUgNS43Njc3NCA0LjQ2OTk2IDUuNDc0ODRMMC41ODEwMDMgMS41ODU4OEMwLjI4ODEwMyAxLjI5Mjk5IDAuMjg4MTAzIDAuODE4MTA4IDAuNTgxMDAzIDAuNTI1MjE4QzAuODczODkzIDAuMjMyMzI4IDEuMzQ4NzcgMC4yMzIzMjggMS42NDE2NiAwLjUyNTIxOEw1LjAwMDI5IDMuODgzODVMOC4zNTkgMC41MjUwODdDOC42NTE5IDAuMjMyMTk3IDkuMTI2OCAwLjIzMjE5NyA5LjQxOTcgMC41MjUwODdaIiBmaWxsPSIjNzM3RDhEIi8+Cjwvc3ZnPgo=');
          `}
  }

  .isOpen & {
    ${ButtonDropdownIsOpenCSS}
  }

  ${DisabledButtonCSS}

  &:active {
    opacity: 1;
  }

  &[disabled],
  &[disabled]:hover {
    background-color: ${({ theme: { buttonDropdown } }) => buttonDropdown.borderColor};
    border-color: ${({ theme: { buttonDropdown } }) => buttonDropdown.borderColor};
    color: ${({ theme: { buttonDropdown } }) => buttonDropdown.color};
  }
`

export const ButtonDropdown = styled(Button)<{ currentThemeName?: ThemeType }>`
  ${ButtonDropdownCSS}
`
