# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FanStock - A decentralized platform enabling grassroots and amateur sports clubs to create and manage their own fan tokens on the Chiliz Chain. This project extends the Socios.com model (used by PSG, Barcelona) to 50,000+ amateur clubs across Europe.

### Key Features
- Token creation for amateur clubs (1-2€ price point)
- Real ownership and governance for fans (not just voting on bus colors)
- Automated revenue sharing (transfers, local sponsors, division promotions)
- True governance mechanisms (coach selection, budget allocation, strategy)

### Hackathon Context
- Event: Hacking Paris 2025 by Chiliz
- Target Track: Fan Token Utility ($50k prize)
- Already achieved: 3rd place in Includ3d accelerator challenge

## Current Tech Stack

### Frontend Framework
- **Next.js 14** - App Router, Server Components, built-in optimizations
- **TypeScript** - Type safety for blockchain interactions
- **TailwindCSS** - Rapid UI development with @tailwindcss/postcss

### Web3 Integration
- **viem** - Lightweight, type-safe Ethereum library
- **wagmi** - React hooks for Web3
- **@privy-io/react-auth** - Embedded wallet creation and authentication
- **@privy-io/wagmi-connector** - Privy integration with wagmi
- **@tanstack/react-query** - Async state management

### Key Libraries
- **react-hook-form** + **zod** - Form handling and validation
- **recharts** - Data visualization for club metrics
- **framer-motion** - Smooth animations
- **zustand** - Lightweight state management

## Development Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

## Environment Setup

1. Copy `.env.example` to `.env.local`
2. Get your Privy App ID from https://dashboard.privy.io
3. Configure your environment variables:

```bash
# Required
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here

# Optional
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
NEXT_PUBLIC_ENVIRONMENT=development
```

## Architecture

### Core Modules
- **Club Management** - Token creation, club profiles, governance setup
- **Fan Portal** - Token purchase, voting, revenue tracking
- **Governance** - Proposal creation, voting mechanisms, execution
- **Analytics** - Club performance, token metrics, revenue distribution
- **Wallet Integration** - Privy embedded wallets, external wallet connections

### Project Structure
```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Landing page
│   ├── clubs/             # Club listings and details
│   ├── governance/        # Voting and proposals
│   └── dashboard/         # User dashboard
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── web3/             # Web3-specific components
│   └── club/             # Club-related components
├── lib/                   # Core libraries
│   ├── wagmi.ts          # Wagmi + Privy configuration
│   ├── contracts/        # Contract ABIs and addresses
│   └── utils/            # Helper functions
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript definitions
└── public/               # Static assets
```

### Privy Integration
- **Embedded Wallets** - Users can create wallets without external wallet apps
- **Social Login** - Google, Twitter, Discord, email authentication
- **Wallet Recovery** - Built-in recovery mechanisms
- **Cross-app** - Wallets work across all Privy-powered apps
- **Chiliz Chain Support** - Custom chain configuration for Chiliz mainnet and testnet

### Smart Contract Integration
- Deploy contracts on Chiliz Chain (EVM-compatible)
- Use factory pattern for club token creation
- Implement revenue sharing via smart contracts
- Governance through on-chain voting

### State Management
- **Zustand** for global state (user preferences, UI state)
- **Wagmi + React Query** for blockchain state
- **Privy** for authentication and wallet state
- Server Components for initial data fetching

## Chiliz Chain Specifics
- Chain ID: 88888 (mainnet) / 88882 (testnet)
- RPC endpoints:
  - Mainnet: https://rpc.ankr.com/chiliz
  - Testnet: https://spicy-rpc.chiliz.com
- CHZ as native token
- EVM-compatible, use standard Web3 tools
- Block explorer: https://scan.chiliz.com (mainnet) / https://testnet.chiliscan.com (testnet)

## UI/UX Priorities
1. **Simple onboarding** - Non-crypto users can create wallets with email
2. **Mobile-first** - Fans use phones at matches
3. **Real-time updates** - Match results, governance votes
4. **Social features** - Fan interaction, community building
5. **Embedded wallets** - No need for external wallet downloads

## Security Considerations
- Input validation on all forms
- Secure wallet connections via Privy
- Rate limiting on API calls
- Environment variables for sensitive data
- CORS configuration for RPC calls
- Privy handles private key security and recovery