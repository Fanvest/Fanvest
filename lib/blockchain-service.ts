import { createPublicClient, http, getContract, parseAbi } from 'viem';
import { chiliz, chilizSpicy } from './wagmi';

// Create public clients for reading blockchain data
export const publicClientMainnet = createPublicClient({
  chain: chiliz,
  transport: http()
});

export const publicClientTestnet = createPublicClient({
  chain: chilizSpicy,
  transport: http()
});

// Standard ERC20 ABI for token balance queries
const ERC20_ABI = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function decimals() view returns (uint8)',
  'function owner() view returns (address)',
  'function getOwner() view returns (address)'
]);

// Club Factory ABI
const CLUB_FACTORY_ABI = parseAbi([
  'function clubTokens(address club) view returns (address)',
  'function tokenClubs(address token) view returns (address)',
  'function isClubOwner(address user, address club) view returns (bool)'
]);

export class BlockchainService {
  private static getClient(testnet: boolean = false) {
    return testnet ? publicClientTestnet : publicClientMainnet;
  }

  // Check if user owns any tokens of a club
  static async getUserTokenBalance(
    userAddress: string,
    tokenAddress: string,
    testnet: boolean = false
  ): Promise<bigint> {
    try {
      const client = this.getClient(testnet);
      
      const contract = getContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        client
      });

      const balance = await contract.read.balanceOf([userAddress as `0x${string}`]);
      return balance;
    } catch (error) {
      console.error('Error getting token balance:', error);
      return 0n;
    }
  }

  // Check if user is the owner of a token contract
  static async isTokenOwner(
    userAddress: string,
    tokenAddress: string,
    testnet: boolean = false
  ): Promise<boolean> {
    try {
      const client = this.getClient(testnet);
      
      const contract = getContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        client
      });

      // Try different owner methods (different contracts might use different names)
      try {
        const owner = await contract.read.owner();
        return owner.toLowerCase() === userAddress.toLowerCase();
      } catch {
        // Try getOwner if owner() doesn't exist
        try {
          const owner = await contract.read.getOwner();
          return owner.toLowerCase() === userAddress.toLowerCase();
        } catch {
          return false;
        }
      }
    } catch (error) {
      console.error('Error checking token ownership:', error);
      return false;
    }
  }

  // Get token info
  static async getTokenInfo(
    tokenAddress: string,
    testnet: boolean = false
  ) {
    try {
      const client = this.getClient(testnet);
      
      const contract = getContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        client
      });

      const [name, symbol, totalSupply, decimals] = await Promise.all([
        contract.read.name(),
        contract.read.symbol(),
        contract.read.totalSupply(),
        contract.read.decimals()
      ]);

      return {
        name,
        symbol,
        totalSupply: totalSupply.toString(),
        decimals
      };
    } catch (error) {
      console.error('Error getting token info:', error);
      return null;
    }
  }

  // Get user permissions based on blockchain state
  static async getUserClubPermissions(
    userAddress: string,
    clubTokenAddress: string,
    testnet: boolean = false
  ) {
    try {
      const [isOwner, balance] = await Promise.all([
        this.isTokenOwner(userAddress, clubTokenAddress, testnet),
        this.getUserTokenBalance(userAddress, clubTokenAddress, testnet)
      ]);

      const hasTokens = balance > 0n;

      return {
        isOwner,
        canManage: isOwner,
        canVote: hasTokens,
        canCreatePolls: isOwner,
        tokenBalance: balance.toString(),
        hasTokens
      };
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return {
        isOwner: false,
        canManage: false,
        canVote: false,
        canCreatePolls: false,
        tokenBalance: '0',
        hasTokens: false
      };
    }
  }

  // Check if user has any club ownership
  static async isClubOwner(
    userAddress: string,
    clubs: { tokenAddress?: string | null }[],
    testnet: boolean = false
  ): Promise<boolean> {
    try {
      // Check each club to see if user is owner
      const ownershipChecks = await Promise.all(
        clubs
          .filter(club => club.tokenAddress)
          .map(club => this.isTokenOwner(userAddress, club.tokenAddress!, testnet))
      );

      return ownershipChecks.some(isOwner => isOwner);
    } catch (error) {
      console.error('Error checking club ownership:', error);
      return false;
    }
  }
}