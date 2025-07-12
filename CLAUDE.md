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

### Current Status
✅ **Frontend Foundation Complete**
- Next.js 14 application with TypeScript and TailwindCSS
- Privy integration for embedded wallets and social authentication
- Chiliz Chain support (mainnet 88888 and testnet 88882)
- Landing page showcasing FanStock concept
- Wallet management with chain switching functionality

✅ **Backend API Complete**
- Next.js API Routes for polls, votes, uploads, and club management
- PostgreSQL database with Prisma ORM
- File upload system with Sharp image optimization
- Authentication middleware with Privy integration

✅ **Blockchain-First Permissions**
- Permissions determined by on-chain token ownership
- Real-time blockchain queries via React hooks
- Smart contract integration for token balance and ownership checks
- Database serves as cache only, blockchain is source of truth

📝 **Repository Status**
- Local commit created: `172776f feat: initial FanStock frontend setup with Next.js and Privy`
- Push pending (authentication issue to resolve)

## Current Tech Stack

### Frontend Framework
- **Next.js 14** - App Router, Server Components, built-in optimizations
- **TypeScript** - Type safety for blockchain interactions
- **TailwindCSS** - Rapid UI development with @tailwindcss/postcss

### Web3 Integration
- **viem** - Lightweight, type-safe Ethereum library for blockchain queries
- **@privy-io/react-auth** - Embedded wallet creation and authentication
- **@tanstack/react-query** - Async state management and blockchain data caching

### Backend & Database
- **@prisma/client** - Type-safe database ORM
- **sharp** - Image processing and optimization
- **multer** - File upload handling
- **cloudinary** - Production image storage (configured but optional)

### Key Libraries
- **react-hook-form** + **zod** - Form handling and validation
- **recharts** - Data visualization for club metrics
- **framer-motion** - Smooth animations

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

# Database commands
npx prisma generate       # Generate Prisma client
npx prisma migrate dev    # Run database migrations
npx prisma studio        # Open database browser
npx prisma db push       # Push schema changes (development)

# Type checking
npm run type-check

# Linting
npm run lint
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
- **Wallet Integration** - Privy embedded wallets, blockchain permissions
- **Blockchain Service** - Real-time smart contract queries

### Project Structure
```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Landing page
│   ├── api/               # API Routes (Backend)
│   │   ├── auth/          # User authentication
│   │   ├── clubs/         # Club CRUD operations
│   │   ├── polls/         # Poll management
│   │   ├── votes/         # Blockchain vote recording
│   │   └── upload/        # File upload (profile pics, logos)
│   ├── clubs/             # Club pages (to be created)
│   ├── governance/        # Voting interface (to be created)
│   └── dashboard/         # User dashboard (to be created)
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── web3/             # Web3-specific components
│   └── club/             # Club-related components
├── lib/                   # Core libraries
│   ├── wagmi.ts          # Viem configuration for Chiliz
│   ├── blockchain-service.ts # Smart contract queries
│   ├── database.ts       # Prisma client
│   ├── permissions.ts    # Permission helpers (legacy)
│   └── auth-middleware.ts # API authentication
├── hooks/                 # Custom React hooks
│   ├── useBlockchainPermissions.ts # Real-time blockchain data
│   ├── useCreateClubToken.ts # Smart contract deployment
│   └── usePermissions.ts # Legacy permission hooks
├── types/                 # TypeScript definitions
├── prisma/               # Database schema and migrations
│   └── schema.prisma     # Simplified schema (cache only)
└── public/               # Static assets
```

### Blockchain-First Permission System
- **Source of Truth** - Smart contracts determine all permissions
- **Real-time Queries** - Live token balance and ownership checks
- **Permission Types**:
  - `isOwner`: `contract.owner() === userAddress`
  - `canVote`: `contract.balanceOf(userAddress) > 0`
  - `canManage`: User is contract owner
- **Auto-refresh** - Permissions update every 30-60 seconds
- **Trustless** - No need to trust database, only blockchain

### API Routes Documentation

#### **Authentication Routes**

**GET `/api/auth/user`**
- **Description**: Get or create user from Privy authentication
- **Query Parameters**:
  - `privyId` (required): Privy user ID
  - `walletAddress` (required): User's wallet address
  - `email` (optional): User's email address
- **Response**: User object with clubs and token holdings
- **Example**: `/api/auth/user?privyId=did:privy:123&walletAddress=0x123&email=user@example.com`

**PATCH `/api/auth/user`**
- **Description**: Update user profile information
- **Body Parameters**:
  - `userId` (required): User ID to update
  - `email` (optional): New email address
  - `profileImage` (optional): New profile image URL
- **Response**: Updated user object

#### **Club Management Routes**

**GET `/api/clubs`**
- **Description**: Get all clubs or search clubs
- **Query Parameters**:
  - `search` (optional): Search term for club name/location
  - `tier` (optional): Filter by club tier (AMATEUR, SEMI_PRO, GRASSROOTS)
  - `ownerId` (optional): Filter by club owner
- **Response**: Array of club objects with owner info and stats
- **Example**: `/api/clubs?search=FC%20Paris&tier=AMATEUR`

**POST `/api/clubs`**
- **Description**: Create a new club
- **Body Parameters**:
  - `name` (required): Club name
  - `location` (required): Club location
  - `description` (optional): Club description
  - `founded` (optional): Year founded
  - `tier` (optional): Club tier (default: AMATEUR)
  - `ownerId` (required): User ID of club creator
- **Response**: Created club object

**GET `/api/clubs/[id]/token`**
- **Description**: Get club token information
- **URL Parameters**:
  - `id`: Club ID
- **Response**: Club token details or `hasToken: false` if no token exists

**PATCH `/api/clubs/[id]/token`**
- **Description**: Update club with token contract information (called automatically after token deployment)
- **URL Parameters**:
  - `id`: Club ID
- **Body Parameters**:
  - `tokenAddress` (required): Deployed token contract address
  - `tokenSymbol` (required): Token symbol (e.g., FCMT)
  - `totalSupply` (required): Total token supply
  - `pricePerToken` (required): Price per token in CHZ
  - `transactionHash` (optional): Deployment transaction hash
- **Response**: Updated club object with token information
- **Notes**: Also creates a revenue record for tracking

#### **Club Registration Routes (Hackathon Demo)**

**GET `/api/clubs/requests`**
- **Description**: Get club registration requests
- **Query Parameters**:
  - `status` (optional): Filter by status (PENDING, APPROVED, REJECTED)
  - `userId` (optional): Filter by user
- **Response**: Array of club request objects with user details
- **Example**: `/api/clubs/requests?status=PENDING`

**POST `/api/clubs/requests`**
- **Description**: Submit a club registration request
- **Body Parameters**:
  - `userId` (required): User ID submitting request
  - `clubName` (required): Club name
  - `location` (required): Club location
  - `description` (optional): Club description
  - `founded` (optional): Year founded
  - `tier` (optional): Club tier (default: AMATEUR)
  - `contactEmail` (required): Contact email
  - `phoneNumber` (optional): Phone number
  - `website` (optional): Club website
  - `socialMedia` (optional): Social media links object
  - `legalDocuments` (optional): Array of document URLs
  - `autoApprove` (optional): Auto-approve for demo (default: true)
- **Response**: Created request object (auto-approved for hackathon)
- **Notes**: For demo, automatically approves and creates club

**GET `/api/clubs/requests/[id]`**
- **Description**: Get specific club registration request
- **URL Parameters**:
  - `id`: Request ID
- **Response**: Detailed request object with parsed JSON fields

**PATCH `/api/clubs/requests/[id]`**
- **Description**: Approve or reject a club registration request
- **URL Parameters**:
  - `id`: Request ID
- **Body Parameters**:
  - `action` (required): "approve" or "reject"
  - `rejectionReason` (optional): Reason for rejection
- **Response**: Updated request object with club details (if approved)
- **Notes**: Creates actual club record when approved

#### **Poll Management Routes**

**GET `/api/polls`**
- **Description**: Get polls with optional filtering
- **Query Parameters**:
  - `clubId` (optional): Filter by specific club
  - `status` (optional): Filter by status (DRAFT, ACTIVE, COMPLETED, CANCELLED)
- **Response**: Array of poll objects with options and vote counts
- **Example**: `/api/polls?clubId=club123&status=ACTIVE`

**POST `/api/polls`**
- **Description**: Create a new poll
- **Body Parameters**:
  - `title` (required): Poll title
  - `description` (required): Poll description
  - `pollType` (optional): Type (GOVERNANCE, COACH_SELECTION, etc.)
  - `startDate` (required): Poll start date (ISO string)
  - `endDate` (required): Poll end date (ISO string)
  - `minTokens` (optional): Minimum tokens required to vote
  - `clubId` (required): Club ID
  - `options` (required): Array of poll options (min 2)
- **Response**: Created poll object with options

**GET `/api/polls/[id]`**
- **Description**: Get specific poll with detailed results
- **URL Parameters**:
  - `id`: Poll ID
- **Response**: Poll object with options, responses, and user details

**PATCH `/api/polls/[id]`**
- **Description**: Update poll status
- **URL Parameters**:
  - `id`: Poll ID
- **Body Parameters**:
  - `status` (required): New status (ACTIVE, COMPLETED, CANCELLED)
- **Response**: Updated poll object

**DELETE `/api/polls/[id]`**
- **Description**: Delete a poll
- **URL Parameters**:
  - `id`: Poll ID
- **Response**: Success confirmation

#### **Voting Routes**

**POST `/api/polls/[id]/vote`**
- **Description**: Vote on a poll
- **URL Parameters**:
  - `id`: Poll ID
- **Body Parameters**:
  - `userId` (required): User ID voting
  - `optionId` (required): Selected option ID
- **Response**: Vote response object with update status
- **Notes**: Updates existing vote if user already voted

**GET `/api/polls/[id]/vote`**
- **Description**: Get user's vote for a poll
- **URL Parameters**:
  - `id`: Poll ID
- **Query Parameters**:
  - `userId` (required): User ID to check
- **Response**: User's vote response or null
- **Example**: `/api/polls/poll123/vote?userId=user456`

**GET `/api/votes`**
- **Description**: Get governance votes (stored in database)
- **Query Parameters**:
  - `clubId` (optional): Filter by club
  - `userId` (optional): Filter by user
  - `proposalId` (optional): Filter by proposal ID
- **Response**: Array of vote records with user and club info
- **Example**: `/api/votes?clubId=club123&proposalId=prop456`

**POST `/api/votes`**
- **Description**: Record a governance vote in database
- **Body Parameters**:
  - `proposalId` (required): Proposal/poll ID
  - `vote` (required): Vote choice (FOR, AGAINST, ABSTAIN)
  - `tokenPower` (required): Voting power based on token balance
  - `userId` (required): User ID
  - `clubId` (required): Club ID
  - `transactionHash` (optional): Optional blockchain reference
- **Response**: Created vote record with user/club details
- **Notes**: Token power is validated against blockchain balance

#### **File Upload Routes**

**POST `/api/upload/profile`**
- **Description**: Upload user profile picture
- **Content-Type**: `multipart/form-data`
- **Form Parameters**:
  - `file` (required): Image file (max 5MB, image types only)
  - `userId` (required): User ID
- **Response**: Upload success with image URL and updated user
- **Processing**: Auto-resize to 200x200px, JPEG compression

**DELETE `/api/upload/profile`**
- **Description**: Remove user profile picture
- **Query Parameters**:
  - `userId` (required): User ID
- **Response**: Success confirmation with updated user

**POST `/api/upload/club-logo`**
- **Description**: Upload club logo
- **Content-Type**: `multipart/form-data`
- **Form Parameters**:
  - `file` (required): Image file (max 5MB, image types only)
  - `clubId` (required): Club ID
- **Response**: Upload success with logo URL and updated club
- **Processing**: Auto-resize to 150x150px, PNG format with transparency

#### **Error Responses**
All routes return consistent error format:
```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `400`: Bad Request (missing/invalid parameters)
- `401`: Unauthorized (missing authentication)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

### Database Schema (Simplified)
```sql
Users          # Privy authentication + profile
Clubs          # Club metadata (name, location, tokenAddress)
Polls          # Off-chain governance polls
PollOptions    # Poll choices
PollResponses  # User votes on polls
Votes          # Governance vote records (stored in DB)
Revenues       # Revenue tracking

# Removed: UserRole, ClubRole, TokenHolding, ClubMembership
# Reason: All permissions come from blockchain now
# Note: Votes are stored in database, not on blockchain
```

### State Management
- **React Query** - Blockchain data caching and auto-refresh
- **Privy** - Authentication and wallet state
- **Server Components** - Initial data fetching

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

## Next Development Steps

### Immediate Priorities (Next Session)
1. **Database Setup**
   - Set up PostgreSQL database
   - Run `npx prisma migrate dev` to create tables
   - Configure DATABASE_URL in .env.local

2. **Smart Contract Development**
   - Create club token factory contract (ERC20 with ownership)
   - Implement revenue sharing mechanisms
   - Add governance voting contract
   - Deploy contracts to Chiliz Spicy testnet

3. **Frontend Pages Implementation**
   - Club listing page (`/clubs`)
   - Individual club page (`/clubs/[id]`)
   - Club creation wizard (`/clubs/create`)
   - User dashboard (`/dashboard`)
   - Governance voting interface (`/clubs/[id]/governance`)

### Medium-term Features
4. **Token Purchase Flow**
   - Smart contract integration for token purchases
   - CHZ payment processing
   - Token minting and distribution
   - Real-time balance updates

5. **Advanced Features**
   - Revenue distribution automation
   - Club analytics and metrics dashboard
   - Real-time notifications for votes
   - Mobile-responsive optimization

### Demo Preparation
6. **Hackathon Demo**
   - Deploy test smart contracts on Chiliz Spicy
   - Create demo clubs with mock data
   - End-to-end user journey testing
   - Production deployment setup

## Technical Debt & Known Issues
- **Database Setup**: Need to configure PostgreSQL and run migrations
- **Smart Contracts**: Need to develop and deploy club token contracts
- **Privy Configuration**: Need to add real NEXT_PUBLIC_PRIVY_APP_ID in .env.local
- **Git Authentication**: 403 error when pushing to remote repository
- **Image Storage**: Currently using base64, should implement Cloudinary for production

## Security Considerations
- Input validation on all forms
- Secure wallet connections via Privy
- Rate limiting on API calls
- Environment variables for sensitive data
- CORS configuration for RPC calls
- Privy handles private key security and recovery