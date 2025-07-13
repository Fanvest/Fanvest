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
✅ **Smart Contract Integration Complete (95%)**
- ClubToken.sol + FanStockFactory.sol compiled and ready for deployment
- Complete API integration with real blockchain calls via viem
- BuyTokensModal component with professional UI and error handling
- useBuyTokens() and useTokenBalance() hooks for blockchain interactions
- Mode démo/production with NEXT_PUBLIC_DEMO_MODE toggle
- Factory deployment scripts optimized for Chiliz network

✅ **Investment System Fully Functional**
- Fixed "Investir" button functionality with proper onClick handlers
- Professional modal interface for token purchase with CHZ pricing
- Real-time token balance from blockchain (production) or simulated (demo)
- Transaction links to ChiliScan explorer
- Comprehensive error handling (insufficient funds, user rejection, etc.)
- Owner investment restrictions with crown status indicator

✅ **Bug Fixes and Database Cleanup**
- Eliminated DEPLOYING_ fake addresses that caused viem errors
- Proper API error handling when smart contract deployment fails
- Database cleanup completed - no more invalid token addresses
- Strict validation: only real contract addresses saved to database

✅ **Dual Mode Architecture**
- Demo Mode (NEXT_PUBLIC_DEMO_MODE=true): Perfect for hackathons, simulated transactions
- Production Mode (NEXT_PUBLIC_DEMO_MODE=false): Real blockchain integration
- Seamless switching between modes with identical user experience
- Environment-based configuration management

✅ **Complete User Interface**
- Landing page with grid pattern background
- Club exploration page with search and filtering
- Club registration with instant approval for demo
- Club dashboard with integrated token management
- Club settings with logo upload and social media links
- 3D token creator with real-time preview
- Professional token purchase modal with CHZ/EUR conversion

✅ **Backend API Complete**
- Next.js API Routes integrated with smart contract deployment
- SQLite database with Prisma ORM (simplified for demo)
- File upload system with Sharp image optimization
- Authentication middleware with Privy integration
- Token 3D design data storage
- Smart contract factory integration

✅ **Comprehensive Polling System**
- Token-weighted voting (vote power = tokens held)
- Democratic poll creation (no minimum token requirements)
- Active/archived poll management
- Manual poll closure and automatic expiration
- Real-time results visualization with progress bars
- Disabled 3D token manipulation for stable viewing experience
- Forced animations on public club pages

✅ **Enhanced 3D Token System**
- Background 3D token display with subtle opacity (15%)
- Removed redundant 3D preview sections for cleaner UI
- Completely disabled mouse controls for background tokens
- Full controls preserved in token creation interface

✅ **Animated Navigation System**
- Modern navbar with Framer Motion hover animations
- Conditional navigation based on user authentication and club ownership
- Testnet-only display (mainnet hidden during development)
- Dropdown menus for Fan and Club sections
- Integrated Privy authentication and logout functionality
- Supporting pages: portfolio, investments, how-it-works, club-benefits, pricing

✅ **Dashboard Club - Refonte Graphique Complète (Dernière mise à jour)**
- **Palette allégée** : Fond blanc (#FEFEFE) avec texte noir (#16001D) pour un design moderne et professionnel
- **Actions prioritaires** : Boutons d'action principaux repositionnés en haut à droite pour un accès immédiat
- **Layout optimisé** : Grid 12 colonnes (4-5-3) pour maximiser l'utilisation de l'espace horizontal (95vw)
- **Header minimaliste** : Navigation épurée avec breadcrumb contextuel "Dashboard · Nom du Club"
- **Graphiques intégrés** : Mini-visualisations dans l'aperçu (barres de progression, histogrammes)
- **Section sondages unifiée** : Création et visualisation dans la même zone avec actions intégrées
- **Workflow optimisé** : Moins de scroll, toutes les infos importantes visibles directement
- **Suppression tab navigation** : Header moderne remplace l'ancienne navigation onglet

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
- **viem** - Lightweight, type-safe Ethereum library for blockchain queries and smart contract calls
- **@privy-io/react-auth** - Embedded wallet creation and authentication with Chiliz support
- **@tanstack/react-query** - Async state management and blockchain data caching
- **Custom Chiliz Integration** - Native support for Chiliz mainnet (88888) and testnet (88882)

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
│   │   ├── polls/         # Poll management with token-weighted voting
│   │   │   └── [id]/
│   │   │       ├── vote/     # Vote API with tokenPower
│   │   │       └── results/  # Weighted results calculation
│   │   ├── votes/         # Blockchain vote recording
│   │   └── upload/        # File upload (profile pics, logos)
│   ├── clubs/             # Club-related pages
│   │   └── [id]/
│   │       ├── page.tsx      # Public club page with social links
│   │       ├── create-token/ # Token creation interface
│   │       ├── polls/        # Poll management interface
│   │       │   ├── page.tsx  # Poll listing (active/archived)
│   │       │   └── create/   # Poll creation form
│   │       └── settings/     # Club settings with 3D creator
│   ├── dashboard/         # User dashboard
│   │   └── club/          # Club owner dashboard with poll navigation
│   ├── explore/           # Club discovery page
│   └── register-club/     # Club registration form
├── components/            # Reusable components
│   ├── 3d/               # 3D graphics components
│   │   ├── Coin3D.tsx    # 3D token component
│   │   ├── OrbitControls.tsx # Camera controls
│   │   └── TokenCreator3D.tsx # Complete 3D creator interface
│   ├── ui/               # Base UI components
│   │   └── navbar.tsx    # Animated navigation with conditional menus
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
Clubs          # Club metadata + 3D token design data + social links
  - tokenTexture     # Base64 texture image
  - tokenBandColor   # Hex color for band
  - tokenAnimation   # Animation enabled/disabled
  - socialLinks      # JSON string with social media links
Polls          # Off-chain governance polls (no token restrictions)
PollOptions    # Poll choices
PollResponses  # User votes with tokenPower field
  - tokenPower       # Voting weight based on token holdings
Votes          # Governance vote records
Revenues       # Revenue tracking
ClubRequests   # Registration requests (auto-approved for demo)
```

### 3D Token System
- **Real-time Preview** - Live 3D rendering with user interactions in creator
- **Background Display** - Subtle 3D token background on club pages (15% opacity)
- **Texture Upload** - Custom images for token faces (PNG/JPG, max 5MB)
- **Color Customization** - Band color selection with preset palette
- **Animation Control** - Toggle smooth rotation animations
- **Conditional Controls** - Full controls in creator, disabled for backgrounds
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

#### **Club Settings Routes**

**GET `/api/clubs/[id]/settings`**
- **Description**: Get club settings including social links
- **Response**: Club information with parsed social links

**PUT `/api/clubs/[id]/settings`**
- **Description**: Update club settings
- **Body Parameters**: `clubName`, `description`, `socialLinks` (JSON)
- **Response**: Updated club information

#### **Polling System Routes**

**GET `/api/polls`**
- **Description**: Get polls with filtering
- **Query Parameters**: `clubId`, `status`
- **Response**: Array of polls with vote counts and token power

**POST `/api/polls`**
- **Description**: Create new poll
- **Body Parameters**: `title`, `description`, `pollType`, `endDate`, `clubId`, `options`
- **Response**: Created poll with options

**POST `/api/polls/[id]/vote`**
- **Description**: Vote on poll with token weight
- **Body Parameters**: `userId`, `optionId`, `tokenPower`
- **Response**: Vote response with update status

**GET `/api/polls/[id]/results`**
- **Description**: Get weighted poll results
- **Response**: Detailed results with token-based calculations

### UI Design System

#### **Color Palette (Current Light Theme)**
```css
/* Primary Colors */
--violet-primary: #FA0089;     /* Main accent color for important elements */
--gray-900: #111827;           /* Primary text color */
--gray-600: #4B5563;           /* Secondary text color */
--gray-300: #D1D5DB;           /* Border color */
--gray-100: #F3F4F6;           /* Light backgrounds */
--white: #FFFFFF;              /* Card backgrounds */

/* Background Gradients */
background: linear-gradient(to bottom right, #F3F4F6, #FFFFFF);

/* Legacy Colors (deprecated) */
--russian-violet: #330051;     /* ❌ No longer used */
--byzantium: #813066;          /* ❌ No longer used */
--dark-purple: #16001D;        /* ❌ No longer used */
```

#### **Current Design System (Light Theme)**
- **Background**: Gray-white gradient with BGPattern diagonal-stripes
- **Cards**: `bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg`
- **Text**: `text-gray-900` (primary), `text-gray-600` (secondary)
- **Accents**: Violet `#fa0089` for all important information and CTAs
- **Inputs**: White background with violet focus states
- **Hover**: Pink-50 (`bg-pink-50`) for hover effects

#### **Background Patterns (Current)**
```tsx
<BGPattern 
  variant="diagonal-stripes" 
  mask="fade-edges" 
  size={32}
  fill="#e5e7eb"
  className="opacity-30"
/>
```
- **Standard Pattern**: Diagonal stripes with gray fill (#e5e7eb)
- **Opacity**: 30% for subtle background texture
- **Consistency**: Used across all pages (index, explore, clubs, dashboard, settings)
- **Legacy Patterns**: Grid, dots (no longer used in current design)

#### **Component Library**
- **Navigation** - Consistent headers with breadcrumbs
- **Cards** - Glass-morphism style with border accents
- **Forms** - Consistent input styling with validation
- **Buttons** - Multiple button types with specific use cases

#### **Button Hierarchy & Usage**
```tsx
// ✅ ShinyButton - ONLY for main CTAs and primary conversion actions
<ShinyButton>Explore Clubs</ShinyButton>          // Landing page main CTA
<ShinyButton>Créer un sondage</ShinyButton>       // Dashboard primary action
<ShinyButton>Investir en Euros</ShinyButton>      // Club investment CTA

// ✅ Primary Button - Important actions (violet background)
<button style={{backgroundColor: '#fa0089'}}>Sauvegarder</button>

// ✅ Secondary Button - Regular actions (gray background)  
<button className="bg-gray-200">Annuler</button>

// ✅ Tertiary Button - Subtle actions (border only)
<button className="border border-gray-300">Voir détails</button>
```

**ShinyButton Best Practices:**
- ⚠️ **NEVER use ShinyButton for:**
  - Form save buttons
  - Settings/configuration actions  
  - Navigation buttons
  - Cancel/secondary actions
  - Repetitive actions in lists

- ✅ **ONLY use ShinyButton for:**
  - Main landing page CTAs
  - Primary conversion actions (invest, buy tokens)
  - Key dashboard actions that drive engagement
  - First-time user onboarding flows

## User Journey

### **1. Landing Page**
- Grid pattern background with custom palette
- Animated navbar with conditional menus
- Hero section with call-to-action buttons
- Feature showcase with hover effects
- Testnet indicator for development phase

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

### **7. Club Public Pages**
- Complete club profile with description and logo
- Social media integration (Facebook, Instagram, Website)
- Subtle 3D token background with no user interaction
- Owner-restricted investment system with visual feedback
- Dual investment options (EUR/CHZ) with conditional display

### **8. Polling System**
- Democratic poll creation with multiple types (governance, coach selection, etc.)
- Token-weighted voting system (50 tokens = 50 vote weight)
- Active/archived poll management with real-time switching
- Real-time results with progress bars and hover tooltips
- Deadline management and manual closure functionality
- Fixed 3D token display (no user manipulation)

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