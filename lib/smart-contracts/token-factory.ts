import { createWalletClient, createPublicClient, http, parseEther, Address, decodeEventLog } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { chilizSpicy, chilizMainnet } from '@/lib/web3/config'

// Contract ABIs - Import from artifacts after compilation
import FanStockFactoryABI from '@/lib/contracts/FanStockFactory.json'
import ClubTokenABI from '@/lib/contracts/ClubToken.json'

export interface TokenContractParams {
  name: string;
  symbol: string;
  clubName: string;
  totalSupply: number;
  pricePerToken: number;
  owner: string;
  clubId: string;
  clubWallet: string;
  fanVotingPower?: number; // 10-49%, default 40%
  fanRevenueShare?: number; // 0-15%, default 10%
  testnet?: boolean;
}

export interface TokenDeploymentResult {
  contractAddress: string;
  transactionHash: string;
  gasUsed?: number;
  deploymentCost?: string;
}

// Deployed contract addresses
const FACTORY_ADDRESSES = {
  [chilizSpicy.id]: '0x0CD0b824bC7c65388D802F99F5B47FF8DE33Cb12', // Testnet
  [chilizMainnet.id]: '', // Mainnet (to be deployed)
} as const;

// Demo mode for hackathon presentation
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export async function deployTokenContract(params: TokenContractParams): Promise<TokenDeploymentResult> {
  const {
    name,
    symbol,
    clubName,
    pricePerToken,
    clubWallet,
    fanVotingPower = 40,
    fanRevenueShare = 10,
    testnet = true
  } = params;

  // Demo mode: simulate successful deployment for hackathon presentation
  if (DEMO_MODE) {
    console.log('🎭 DEMO MODE: Simulating smart contract deployment...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
    
    const demoTokenAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
    const demoTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    
    console.log('✅ Demo deployment successful:', {
      tokenAddress: demoTokenAddress,
      clubName,
      tokenName: name,
      symbol,
      pricePerToken,
      fanVotingPower,
      fanRevenueShare
    });
    
    return {
      contractAddress: demoTokenAddress,
      transactionHash: demoTxHash,
      gasUsed: 2500000,
      deploymentCost: '0.001'
    };
  }

  // Validate private key for real deployment
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('PRIVATE_KEY environment variable is required for deployment');
  }

  // Setup network and clients
  const chain = testnet ? chilizSpicy : chilizMainnet;
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  
  const publicClient = createPublicClient({
    chain,
    transport: http()
  });

  const walletClient = createWalletClient({
    chain,
    transport: http(),
    account
  });

  // Get factory address
  const factoryAddress = FACTORY_ADDRESSES[chain.id];
  if (!factoryAddress) {
    throw new Error(`Factory not deployed on chain ${chain.id}`);
  }

  try {
    // Convert price to wei (CHZ has 18 decimals)
    const priceWei = parseEther((pricePerToken / 1000).toString()); // Convert to CHZ
    
    // Get factory fee
    const factoryFee = await publicClient.readContract({
      address: factoryAddress as Address,
      abi: FanStockFactoryABI.abi,
      functionName: 'factoryFee'
    }) as bigint;

    console.log('Deploying token with params:', {
      clubName,
      name,
      symbol,
      clubWallet,
      priceWei: priceWei.toString(),
      fanVotingPower,
      fanRevenueShare,
      factoryFee: factoryFee.toString()
    });

    // Call factory to create club token
    const hash = await walletClient.writeContract({
      address: factoryAddress as Address,
      abi: FanStockFactoryABI.abi,
      functionName: 'createClubToken',
      args: [
        clubName,
        name,
        symbol,
        clubWallet as Address,
        priceWei,
        fanVotingPower,
        fanRevenueShare
      ],
      value: factoryFee
    });

    console.log('Transaction sent:', hash);

    // Wait for transaction receipt
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log('Transaction confirmed:', receipt);

    // Extract token address from events
    let tokenAddress: string | undefined;
    
    for (const log of receipt.logs) {
      try {
        const decodedLog = decodeEventLog({
          abi: FanStockFactoryABI.abi,
          data: log.data,
          topics: log.topics
        });
        
        if (decodedLog.eventName === 'ClubTokenCreated') {
          tokenAddress = (decodedLog.args as any).tokenAddress;
          break;
        }
      } catch (e) {
        // Ignore logs that don't match our ABI
        continue;
      }
    }

    if (!tokenAddress) {
      throw new Error('Could not extract token address from transaction receipt');
    }

    // Calculate gas cost
    const gasUsed = Number(receipt.gasUsed);
    const gasPrice = await publicClient.getGasPrice();
    const deploymentCost = (gasUsed * Number(gasPrice)).toString();

    console.log('Token deployed successfully:', {
      tokenAddress,
      gasUsed,
      deploymentCost
    });

    return {
      contractAddress: tokenAddress,
      transactionHash: hash,
      gasUsed,
      deploymentCost
    };

  } catch (error) {
    console.error('Token deployment failed:', error);
    throw new Error(`Token deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to get deployed club token info
export async function getClubTokenInfo(tokenAddress: string, testnet = true) {
  const chain = testnet ? chilizSpicy : chilizMainnet;
  
  const publicClient = createPublicClient({
    chain,
    transport: http()
  });

  const clubInfo = await publicClient.readContract({
    address: tokenAddress as Address,
    abi: ClubTokenABI.abi,
    functionName: 'getClubInfo'
  });

  return clubInfo;
}

// Helper function to check if factory is deployed and accessible
export async function checkFactoryStatus(testnet = true) {
  const chain = testnet ? chilizSpicy : chilizMainnet;
  const factoryAddress = FACTORY_ADDRESSES[chain.id];
  
  if (!factoryAddress) {
    return { deployed: false, error: 'Factory address not configured' };
  }

  const publicClient = createPublicClient({
    chain,
    transport: http()
  });

  try {
    const factoryFee = await publicClient.readContract({
      address: factoryAddress as Address,
      abi: FanStockFactoryABI.abi,
      functionName: 'factoryFee'
    });

    const totalClubs = await publicClient.readContract({
      address: factoryAddress as Address,
      abi: FanStockFactoryABI.abi,
      functionName: 'totalClubsCreated'
    });

    return {
      deployed: true,
      factoryAddress,
      factoryFee: factoryFee.toString(),
      totalClubs: totalClubs.toString(),
      network: chain.name
    };
  } catch (error) {
    return {
      deployed: false,
      error: `Factory not accessible: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// decodeEventLog is imported from viem above