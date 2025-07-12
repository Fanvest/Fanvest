export interface Club {
  id: string;
  name: string;
  location: string;
  founded: number;
  tokenAddress?: string;
  tokenSymbol?: string;
  totalSupply?: bigint;
  pricePerToken?: bigint;
  imageUrl?: string;
  description?: string;
  tier: 'amateur' | 'semi-pro' | 'grassroots';
  fanCount: number;
}

export interface ClubToken {
  address: string;
  name: string;
  symbol: string;
  totalSupply: bigint;
  price: bigint;
  availableSupply: bigint;
  holders: number;
}

export interface TokenHolder {
  address: string;
  balance: bigint;
  percentage: number;
  votingPower: number;
}

export interface Proposal {
  id: string;
  clubId: string;
  title: string;
  description: string;
  proposer: string;
  status: 'active' | 'passed' | 'rejected' | 'executed';
  forVotes: bigint;
  againstVotes: bigint;
  startTime: number;
  endTime: number;
  type: 'coach' | 'budget' | 'strategy' | 'facility' | 'other';
}

export interface Revenue {
  id: string;
  clubId: string;
  amount: bigint;
  source: 'transfer' | 'sponsorship' | 'tournament' | 'promotion' | 'merchandise';
  description: string;
  timestamp: number;
  distributed: boolean;
  tokenHolderShare: bigint;
}