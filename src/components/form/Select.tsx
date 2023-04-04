import { useState } from 'react'
import styled from 'styled-components'

import { Icon } from '@/src/components/assets/Icon'
import { ButtonDropdown } from '@/src/components/buttons/Button'
import { Dropdown, DropdownDirection, DropdownItem } from '@/src/components/common/Dropdown'

const Wrapper = styled(Dropdown)`
  &[disabled] {
    opacity: 1;
    button {
      background-color: unset;
      &:after {
        display: none;
      }
      &:hover {
        background-color: unset;
      }
    }
  }
`
const Button = styled(ButtonDropdown)`
  justify-content: start;
  > span {
    flex-shrink: 0;
  }
  &:after {
    margin-left: auto;
  }
`

interface Props {
  onChange: (arg: string) => void
  options: string[]
  reset?: boolean
  defaultItem?: string
  disabled?: boolean
  dropdownDirection?: DropdownDirection
}

const Select: React.FC<Props> = ({
  defaultItem,
  disabled,
  dropdownDirection,
  onChange,
  options,
  reset,
  ...restProps
}) => {
  const [selectedOption, setSelectedOption] = useState<string>(defaultItem || options[0])

  const onSelectOption = (selectOpt: string) => {
    setSelectedOption(selectOpt)
    if (typeof onChange !== 'undefined') {
      onChange(selectOpt)
    }
  }

  return (
    <Wrapper
      disabled={disabled}
      dropdownButton={
        <Button>
          <Icon symbol={selectedOption} />
          {selectedOption}
        </Button>
      }
      dropdownDirection={dropdownDirection}
      items={options.map((el, index) => (
        <DropdownItem
          key={index}
          onClick={() => {
            onSelectOption(el)
          }}
        >
          <Icon symbol={el} />
          {el}
        </DropdownItem>
      ))}
      {...restProps}
    />
  )
}

export default Select
