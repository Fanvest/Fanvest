import { defineChain } from 'viem'

export const chilizSpicy = defineChain({
  id: 88882,
  name: 'Chiliz Spicy Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'CHZ',
    symbol: 'CHZ',
  },
  rpcUrls: {
    default: { http: ['https://spicy-rpc.chiliz.com'] },
  },
  blockExplorers: {
    default: { name: 'ChilizScan', url: 'https://testnet.chiliscan.com' },
  },
  testnet: true,
})

export const chilizMainnet = defineChain({
  id: 88888,
  name: 'Chiliz Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'CHZ',
    symbol: 'CHZ',
  },
  rpcUrls: {
    default: { http: ['https://rpc.ankr.com/chiliz'] },
  },
  blockExplorers: {
    default: { name: 'ChilizScan', url: 'https://chiliscan.com' },
  },
  testnet: false,
})

export const CHILIZ_CONFIG = {
  chainId: 88888, // Mainnet
  chainIdTestnet: 88882, // Testnet  
  rpcUrl: 'https://rpc.ankr.com/chiliz',
  rpcUrlTestnet: 'https://spicy-rpc.chiliz.com',
  nativeCurrency: {
    name: 'CHZ',
    symbol: 'CHZ',
    decimals: 18
  }
}