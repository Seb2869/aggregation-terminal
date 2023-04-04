import styled from 'styled-components'

export const Label = styled.label`
  white-space: nowrap;
  color: ${({ theme: { colors } }) => colors.lightGray};
  font-weight: 500;
  font-size: 1rem;
  line-height: 1.2;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  display: block;
  span {
    display: block;
    margin-bottom: 10px;
  }
  button {
    width: 100%;
  }
`

Label.defaultProps = {
  className: 'label',
}

export const LabelAlt = styled(Label)`
  cursor: pointer;
  font-size: 1.4rem;
  font-weight: 400;
`

LabelAlt.defaultProps = {
  className: 'label',
}
