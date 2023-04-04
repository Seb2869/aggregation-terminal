import Image from 'next/image'
import styled from 'styled-components'

import { InnerContainer as BaseInnerContainer } from '@/src/components/helpers/InnerContainer'

const Wrapper = styled.footer`
  font-size: 1rem;
  font-weight: 500;
  padding-bottom: 40px;
  padding-top: 40px;
  text-transform: uppercase;
`

const InnerContainer = styled(BaseInnerContainer)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 30px;
  width: 100%;
  @media (min-width: ${({ theme }) => theme.breakPoints.tabletLandscapeStart}) {
    flex-direction: row;
    flex-shrink: 0;
    justify-content: space-between;
  }
`

const Copyright = styled.div`
  color: ${({ theme }) => theme.colors.textColor};
  font-size: 1.2rem;
  margin: 0;
  display: flex;
  gap: 40px;
  a {
    color: ${({ theme }) => theme.colors.lightGray};
    text-decoration: none;
    display: inline-block;
  }
  img {
    margin-top: 4px;
    display: block;
  }
`

const Contact = styled.div`
  color: ${({ theme }) => theme.colors.textColor};
  display: flex;
  gap: 12px;
  a {
    background-color: ${({ theme }) => theme.colors.gray};
    border-radius: ${({ theme: { common } }) => common.borderRadius};
    height: 40px;
    width: 40px;
    text-decoration: none;
    display: flex;
    justify-content: center;
    align-items: center;
    &:hover,
    &:focus {
      background-color: ${({ theme }) => theme.colors.darkGrayDarkened};
    }
  }
`

export const Footer: React.FC = (props) => {
  return (
    <Wrapper {...props}>
      <InnerContainer>
        <Copyright>
          <a
            href="https://kwenta.eth.limo/"
            rel="noreferrer"
            target="_blank"
            title="Powered by Kwenta"
          >
            Powered by <Image alt="Kwenta" height={16} src="/images/kwenta.png" width={94} />
          </a>
          <a
            href="https://www.bootnode.dev/"
            rel="noreferrer"
            target="_blank"
            title="Developed by BootNode"
          >
            Developed by <Image alt="Bootnode" height={14} src="/images/bn.png" width={90} />
          </a>
        </Copyright>

        <Contact>
          <a href="https://discord.gg/kwentaio" rel="noreferrer" target="_blank">
            <Image alt="Discord" height={12} src="/images/iconDiscord.svg" width={16} />
          </a>
          <a href="https://twitter.com/kwenta_io" rel="noreferrer" target="_blank">
            <Image alt="Twitter" height={12} src="/images/iconTwitter.svg" width={16} />
          </a>
        </Contact>
      </InnerContainer>
    </Wrapper>
  )
}
