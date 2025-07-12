'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrivyProvider } from '@privy-io/react-auth';
import { chiliz, chilizSpicy } from '@/lib/wagmi';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: ['email', 'google', 'twitter', 'discord'],
        appearance: {
          theme: 'dark',
          accentColor: '#22c55e',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        supportedChains: [chiliz, chilizSpicy],
      }}
    >
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </PrivyProvider>
  );
}