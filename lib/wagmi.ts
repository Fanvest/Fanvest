import { createConfig } from 'wagmi';
import { chiliz as chilizMainnet } from 'viem/chains';
import { defineChain } from 'viem';
import { http } from 'viem';

// Re-export chiliz for easier access
export const chiliz = chilizMainnet;

// Chiliz Spicy testnet configuration
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
    default: { name: 'Chiliz Explorer', url: 'https://testnet.chiliscan.com' },
  },
  testnet: true,
});

export const config = createConfig({
  chains: [chiliz, chilizSpicy],
  transports: {
    [chiliz.id]: http(),
    [chilizSpicy.id]: http(),
  },
  ssr: true,
});