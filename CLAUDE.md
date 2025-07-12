# CLAUDE.md

This file provides guidance when working with code in this repository.

## Project Overview

FanStock - A decentralized platform enabling grassroots and amateur sports clubs to create and manage their own fan tokens on the Chiliz Chain. This project extends the Socios.com model (used by PSG, Barcelona) to 50,000+ amateur clubs across Europe.

### Key Features
- Token creation for amateur clubs (1-2€ price point)
- Real ownership and governance for fans (not just voting on bus colors)
- Automated revenue sharing (transfers, local sponsors, division promotions)
- True governance mechanisms (coach selection, budget allocation, strategy)
- 3D token customization with texture and color options

### Hackathon Context
- Event: Hacking Paris 2025 by Chiliz
- Target Track: Fan Token Utility ($50k prize)
- Already achieved: 3rd place in Includ3d accelerator challenge

### Current Status
✅ **Frontend Foundation Complete**
- Next.js 14 application with TypeScript and TailwindCSS
- Privy integration for embedded wallets and social authentication
- Chiliz Chain support (mainnet 88888 and testnet 88882)
- Custom color palette (#FEFEFE, #330051, #FA0089, #813066, #16001D)
- Responsive design with background patterns

✅ **Complete User Interface**
- Landing page with grid pattern background
- Club exploration page with search and filtering
- Club registration with instant approval for demo
- Club dashboard with integrated token management
- Club settings with logo upload and social media links
- 3D token creator with real-time preview

✅ **Backend API Complete**
- Next.js API Routes for polls, votes, uploads, and club management
- SQLite database with Prisma ORM (simplified for demo)
- File upload system with Sharp image optimization
- Authentication middleware with Privy integration
- Token 3D design data storage

✅ **Database Migration to Privy ID**
- User model uses Privy ID as primary key
- Removed duplicate ID system
- Simplified API calls to leverage Privy data
- All tier/category system removed

✅ **3D Token Customization System**
- Real-time 3D token preview with Three.js
- Texture upload and customization
- Color selection for token bands
- Animation controls
- Database persistence of 3D designs

## Current Tech Stack

### Frontend Framework
- **Next.js 14** - App Router, Server Components, built-in optimizations
- **TypeScript** - Type safety for blockchain interactions
- **TailwindCSS** - Rapid UI development with custom color palette

### 3D Graphics
- **Three.js** - 3D rendering engine for token visualization
- **@react-three/fiber** - React renderer for Three.js
- **Canvas API** - Texture generation and manipulation

### Web3 Integration
- **viem** - Lightweight, type-safe Ethereum library for blockchain queries
- **@privy-io/react-auth** - Embedded wallet creation and authentication
- **@tanstack/react-query** - Async state management and blockchain data caching

### Backend & Database
- **@prisma/client** - Type-safe database ORM
- **SQLite** - Development database (simplified for demo)
- **sharp** - Image processing and optimization
- **multer** - File upload handling

### Key Libraries
- **lucide-react** - Icon library for UI elements
- **framer-motion** - Smooth animations and motion effects
- **clsx + tailwind-merge** - Utility class management

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
npx prisma db push        # Push schema changes (development)
npx prisma studio        # Open database browser

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
- **3D Token Creator** - Real-time 3D customization with texture and color options
- **Analytics** - Club performance, token metrics, revenue distribution
- **Wallet Integration** - Privy embedded wallets, blockchain permissions

### Project Structure
```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Landing page with background pattern
│   ├── api/               # API Routes (Backend)
│   │   ├── auth/          # User authentication (Privy ID based)
│   │   ├── clubs/         # Club CRUD operations
│   │   │   └── [id]/
│   │   │       ├── token3d/  # 3D token design API
│   │   │       └── settings/ # Club settings API
│   │   ├── polls/         # Poll management
│   │   ├── votes/         # Blockchain vote recording
│   │   └── upload/        # File upload (profile pics, logos)
│   ├── clubs/             # Club-related pages
│   │   └── [id]/
│   │       ├── create-token/ # Token creation interface
│   │       └── settings/     # Club settings with 3D creator
│   ├── dashboard/         # User dashboard
│   │   └── club/          # Club owner dashboard
│   ├── explore/           # Club discovery page
│   └── register-club/     # Club registration form
├── components/            # Reusable components
│   ├── 3d/               # 3D graphics components
│   │   ├── Coin3D.tsx    # 3D token component
│   │   ├── OrbitControls.tsx # Camera controls
│   │   └── TokenCreator3D.tsx # Complete 3D creator interface
│   ├── ui/               # Base UI components
│   ├── web3/             # Web3-specific components
│   ├── bg-pattern.tsx    # Background pattern component
│   └── glowing-effect.tsx # UI effects
├── lib/                   # Core libraries
│   ├── utils.ts          # Utility functions (clsx, tailwind-merge)
│   └── generated/prisma/ # Generated Prisma client
├── prisma/               # Database schema and data
│   └── schema.prisma     # Database schema with 3D token fields
└── public/               # Static assets
```

### Database Schema (Current)
```sql
Users          # Privy authentication + profile (privyId as PK)
Clubs          # Club metadata + 3D token design data
  - tokenTexture     # Base64 texture image
  - tokenBandColor   # Hex color for band
  - tokenAnimation   # Animation enabled/disabled
Polls          # Off-chain governance polls
PollOptions    # Poll choices
PollResponses  # User votes on polls
Votes          # Governance vote records
Revenues       # Revenue tracking
ClubRequests   # Registration requests (auto-approved for demo)
```

### 3D Token System
- **Real-time Preview** - Live 3D rendering with user interactions
- **Texture Upload** - Custom images for token faces (PNG/JPG, max 5MB)
- **Color Customization** - Band color selection with preset palette
- **Animation Control** - Toggle smooth rotation animations
- **Database Persistence** - All 3D settings saved to club record
- **Responsive Design** - Works on desktop and mobile devices

### API Routes Documentation

#### **Authentication Routes**

**GET `/api/auth/user`**
- **Description**: Get or create user from Privy authentication
- **Query Parameters**: `privyId` (required)
- **Response**: User object with clubs
- **Example**: `/api/auth/user?privyId=did:privy:123`

#### **Club Management Routes**

**GET `/api/clubs`**
- **Description**: Get all clubs or search clubs
- **Query Parameters**: `search`, `ownerId`
- **Response**: Array of club objects with owner info and stats

**POST `/api/clubs`**
- **Description**: Create a new club
- **Body Parameters**: `name`, `location`, `description`, `ownerId`
- **Response**: Created club object

#### **Club Registration Routes**

**POST `/api/clubs/requests`**
- **Description**: Submit club registration (auto-approved for demo)
- **Body Parameters**: `userId`, `clubName`, `location`, `description`, `contactEmail`
- **Response**: Auto-approved club request with created club

#### **3D Token Design Routes**

**GET `/api/clubs/[id]/token3d`**
- **Description**: Get 3D token design data for a club
- **Response**: Club info with texture, bandColor, and animation settings

**PUT `/api/clubs/[id]/token3d`**
- **Description**: Save 3D token design data
- **Body Parameters**: `texture`, `bandColor`, `animationEnabled`
- **Response**: Updated club with 3D settings

### UI Design System

#### **Color Palette**
```css
--white: #FEFEFE;
--russian-violet: #330051;
--magenta: #FA0089;
--byzantium: #813066;
--dark-purple: #16001D;
```

#### **Background Patterns**
- **Grid Pattern** - Subtle grid overlay on main pages
- **Gradient Backgrounds** - Dark purple to russian violet gradients
- **Pattern Variations** - Dots, grid, diagonal stripes available

#### **Component Library**
- **Navigation** - Consistent headers with breadcrumbs
- **Cards** - Glass-morphism style with border accents
- **Forms** - Consistent input styling with validation
- **Buttons** - Primary (magenta), secondary (byzantium), tertiary (russian-violet)

## User Journey

### **1. Landing Page**
- Grid pattern background with custom palette
- Hero section with call-to-action buttons
- Feature showcase with hover effects
- Dynamic navigation based on user state (dashboard vs register)

### **2. Club Registration**
- Single-page form with real-time validation
- Instant approval for hackathon demo
- Success screen with next steps
- Automatic redirect to dashboard

### **3. Club Dashboard**
- Integrated token creation (no separate page needed)
- Token exists: Display read-only information
- Token doesn't exist: Show creation form
- Real-time stats and action cards

### **4. Club Settings**
- Logo upload with preview
- Club information editing
- Social media links (Facebook, Instagram, Website)
- 3D Token Creator integration

### **5. 3D Token Creator**
- Full-screen modal interface
- Left panel: Controls (texture upload, color palette, animation toggle)
- Right panel: Real-time 3D preview with orbit controls
- Save functionality with database persistence

### **6. Club Exploration**
- Search and filter clubs
- Real-time statistics display
- Club cards with token information
- Navigation to individual club pages

## Chiliz Chain Integration
- Chain ID: 88888 (mainnet) / 88882 (testnet)
- RPC endpoints:
  - Mainnet: https://rpc.ankr.com/chiliz
  - Testnet: https://spicy-rpc.chiliz.com
- CHZ as native token
- EVM-compatible, use standard Web3 tools

## Performance Optimizations
- **Dynamic Imports** - 3D components loaded only when needed
- **Image Optimization** - Sharp processing for uploads
- **Database Efficiency** - Simplified schema for fast queries
- **Component Lazy Loading** - Suspense boundaries for heavy components

## Security & Validation
- **File Upload Security** - Type and size validation
- **Input Sanitization** - All form inputs validated
- **Privy Integration** - Secure wallet management
- **API Rate Limiting** - Protection against abuse
- **CORS Configuration** - Proper cross-origin handling

## Known Technical Decisions
- **SQLite over PostgreSQL** - Simplified for demo/development
- **Privy ID as Primary Key** - Removes duplicate user management
- **No Tier System** - Simplified club categorization
- **Auto-approval** - Registration requests auto-approved for demo
- **Base64 Textures** - Direct database storage for simplicity

## Next Development Priorities
1. **Smart Contract Integration** - Deploy ERC20 token factory
2. **Real Token Purchase Flow** - CHZ payment processing
3. **Governance Implementation** - On-chain voting mechanisms
4. **Revenue Distribution** - Automated profit sharing
5. **Mobile Optimization** - Enhanced mobile experience
6. **Production Database** - Migrate to PostgreSQL
7. **Image Storage** - Move to Cloudinary/IPFS