import { Chains } from '@/src/config/web3'
import ERC20 from '@/src/contracts/abis/ERC20.json'
import GMXVault from '@/src/contracts/abis/GMX/GMXVault.json'
import PositionRouter from '@/src/contracts/abis/GMX/PositionRouter.json'
import ReaderV2 from '@/src/contracts/abis/GMX/ReaderV2.json'
import VaultReader from '@/src/contracts/abis/GMX/VaultReader.json'
import ExchangeRates from '@/src/contracts/abis/KWENTA/ExchangeRates.json'
import PerpsV2Market from '@/src/contracts/abis/KWENTA/PerpsV2Market.json'
import SynthUtil from '@/src/contracts/abis/KWENTA/PerpsV2Market.json'

export const contracts = {
  GMX_ReaderV2: {
    address: {
      [Chains.optimism]: '',
      [Chains.arbitrum]: '0x2b43c90D1B727cEe1Df34925bcd5Ace52Ec37694',
    },
    abi: ReaderV2,
  },
  GMX_Vault: {
    address: {
      [Chains.optimism]: '',
      [Chains.arbitrum]: '0x489ee077994B6658eAfA855C308275EAd8097C4A',
    },
    abi: GMXVault, // ref. vaultV2 in GMX repo
  },
  GMX_VaultReader: {
    address: {
      [Chains.optimism]: '',
      [Chains.arbitrum]: '0xfebB9f4CAC4cD523598fE1C5771181440143F24A',
    },
    abi: VaultReader, // ref. vaultV2 in GMX repo
  },
  GMX_PositionRouter: {
    address: {
      [Chains.optimism]: '',
      [Chains.arbitrum]: '0xb87a436B93fFE9D75c5cFA7bAcFff96430b09868',
    },
    abi: PositionRouter,
  },
  WETH: {
    address: {
      [Chains.optimism]: '0x7cade2beb25ede5f8590602b1b24c4f610fde605',
      [Chains.arbitrum]: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    },
    abi: ERC20,
  },
  USDG: {
    address: {
      [Chains.optimism]: '',
      [Chains.arbitrum]: '0x45096e7aA921f27590f8F19e457794EB09678141',
    },
    abi: ERC20,
  },
  KWENTA_PerpsV2Market: {
    address: {
      [Chains.optimism]: '0x2B3bb4c683BFc5239B029131EEf3B1d214478d93',
      [Chains.arbitrum]: '',
    },
    abi: PerpsV2Market,
  },
  KWENTA_SynthUtil: {
    address: {
      [Chains.optimism]: '0x87b1481c82913301Fc6c884Ac266a7c430F92cFA',
      [Chains.arbitrum]: '',
    },
    abi: SynthUtil,
  },
  KWENTA_ExchangeRates: {
    address: {
      [Chains.optimism]: '0x0cA3985f973f044978d2381AFEd9c4D85a762d11',
      [Chains.arbitrum]: '',
    },
    abi: ExchangeRates,
  },
  KWENTA_PerpsV2MarketData: {
    address: {
      [Chains.optimism]: '0xF7D3D05cCeEEcC9d77864Da3DdE67Ce9a0215A9D',
      [Chains.arbitrum]: '',
    },
  },
  KWENTA_PerpsV2MarketSettings: {
    address: {
      [Chains.optimism]: '0x09793Aad1518B8d8CC72FDd356479E3CBa7B4Ad1',
      [Chains.arbitrum]: '',
    },
  },
  KWENTA_PerpsV2MarketState: {
    address: {
      [Chains.optimism]: '0x038dC05D68ED32F23e6856c0D44b0696B325bfC8',
      [Chains.arbitrum]: '',
    },
  },
  KWENTA_SystemStatus: {
    address: {
      [Chains.optimism]: '0xE8c41bE1A167314ABAF2423b72Bf8da826943FFD',
      [Chains.arbitrum]: '',
    },
  },
  sUSD: {
    address: {
      [Chains.optimism]: '0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9',
      [Chains.arbitrum]: '',
    },
    abi: ERC20,
  },
} as const

export type ContractsKeys = keyof typeof contracts

export const isKnownContract = (
  contractName: ContractsKeys | string,
): contractName is ContractsKeys => {
  return contracts[contractName as ContractsKeys] !== undefined
}
