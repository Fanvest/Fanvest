import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

// TODO: Smart Contract Integration
// ===============================
// Import your smart contract deployment function here
// import { deployTokenContract } from '@/lib/smart-contracts/token-factory';
// import { getChilizProvider } from '@/lib/web3/provider';

// POST /api/clubs/[id]/token - Create new token contract
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clubId } = await params;
    const body = await request.json();
    const { 
      tokenName,
      tokenSymbol, 
      totalSupply, 
      pricePerToken,
      ownerId
    } = body;

    // Validate required fields
    if (!tokenName || !tokenSymbol || !totalSupply || !pricePerToken || !ownerId) {
      return NextResponse.json(
        { error: 'Missing required fields: tokenName, tokenSymbol, totalSupply, pricePerToken, ownerId' },
        { status: 400 }
      );
    }

    // Check if club exists and user owns it
    const club = await prisma.club.findUnique({
      where: { id: clubId }
    });

    if (!club) {
      return NextResponse.json(
        { error: 'Club not found' },
        { status: 404 }
      );
    }

    if (club.ownerId !== ownerId) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only create tokens for your own club' },
        { status: 403 }
      );
    }

    // Check if club already has a token
    if (club.tokenAddress) {
      return NextResponse.json(
        { error: 'Club already has a token contract' },
        { status: 400 }
      );
    }

    // TODO: SMART CONTRACT DEPLOYMENT
    // ==============================
    // Replace this section with actual smart contract deployment
    // 
    // const deploymentResult = await deployTokenContract({
    //   name: tokenName,
    //   symbol: tokenSymbol,
    //   totalSupply: parseInt(totalSupply),
    //   pricePerToken: parseInt(pricePerToken),
    //   owner: ownerId,
    //   clubId: clubId
    // });
    // 
    // const tokenAddress = deploymentResult.contractAddress;
    // const transactionHash = deploymentResult.transactionHash;

    // For now, create a pending deployment record
    const tokenAddress = `DEPLOYING_${Date.now()}`;
    const transactionHash = null;

    // Update club with token information (Note: tokenName n'est pas dans le schéma)
    const updatedClub = await prisma.club.update({
      where: { id: clubId },
      data: {
        tokenSymbol,
        tokenAddress,
        totalSupply: totalSupply.toString(),
        pricePerToken: pricePerToken.toString(),
        updatedAt: new Date()
      },
      include: {
        owner: {
          select: { privyId: true, walletAddress: true, profileImage: true }
        }
      }
    });

    // Log the token creation event
    console.log(`Token creation initiated for club ${updatedClub.name}:`, {
      clubId,
      tokenName,
      tokenSymbol,
      totalSupply,
      pricePerToken,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      club: updatedClub,
      message: 'Token creation initiated. Smart contract deployment in progress...',
      tokenAddress,
      deploymentStatus: 'pending'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating token:', error);
    return NextResponse.json(
      { error: 'Failed to create token' },
      { status: 500 }
    );
  }
}

// PATCH /api/clubs/[id]/token - Update club with deployed contract address
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clubId } = await params;
    const body = await request.json();
    const { 
      tokenAddress, 
      transactionHash,
      ownerId
    } = body;

    // Validate required fields
    if (!tokenAddress) {
      return NextResponse.json(
        { error: 'Missing required field: tokenAddress' },
        { status: 400 }
      );
    }

    // Check if club exists and user owns it
    const existingClub = await prisma.club.findUnique({
      where: { id: clubId }
    });

    if (!existingClub) {
      return NextResponse.json(
        { error: 'Club not found' },
        { status: 404 }
      );
    }

    if (ownerId && existingClub.ownerId !== ownerId) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only update tokens for your own club' },
        { status: 403 }
      );
    }

    // Check if this is updating from a pending deployment
    if (!existingClub.tokenAddress || !existingClub.tokenAddress.startsWith('DEPLOYING_')) {
      return NextResponse.json(
        { error: 'No pending deployment found or token already deployed' },
        { status: 400 }
      );
    }

    // Update club with final token address
    const updatedClub = await prisma.club.update({
      where: { id: clubId },
      data: {
        tokenAddress,
        updatedAt: new Date()
      },
      include: {
        owner: {
          select: { privyId: true, walletAddress: true, profileImage: true }
        }
      }
    });

    // Log the token deployment completion
    console.log(`Token deployment completed for club ${updatedClub.name}:`, {
      clubId,
      tokenAddress,
      transactionHash,
      timestamp: new Date().toISOString()
    });

    // Optional: Create a revenue record for the initial token creation
    if (transactionHash) {
      try {
        await prisma.revenue.create({
          data: {
            amount: '0', // Initial creation, no revenue yet
            source: 'OTHER',
            description: `Token contract created: ${tokenSymbol}`,
            transactionHash,
            clubId,
            distributed: false
          }
        });
      } catch (revenueError) {
        console.warn('Failed to create revenue record:', revenueError);
        // Don't fail the main operation if revenue logging fails
      }
    }

    return NextResponse.json({
      success: true,
      club: updatedClub,
      message: 'Token deployment completed successfully',
      tokenAddress,
      deploymentStatus: 'completed'
    });

  } catch (error) {
    console.error('Error updating club token info:', error);
    return NextResponse.json(
      { error: 'Failed to update club token information' },
      { status: 500 }
    );
  }
}

// GET /api/clubs/[id]/token - Get club token information
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clubId } = await params;
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: {
        id: true,
        name: true,
        tokenAddress: true,
        tokenSymbol: true,
        totalSupply: true,
        pricePerToken: true
      }
    });

    if (!club) {
      return NextResponse.json(
        { error: 'Club not found' },
        { status: 404 }
      );
    }

    if (!club.tokenAddress) {
      return NextResponse.json(
        { 
          hasToken: false,
          message: 'Club has not created a token yet'
        }
      );
    }

    return NextResponse.json({
      hasToken: true,
      club: {
        ...club,
        totalSupply: club.totalSupply,
        pricePerToken: club.pricePerToken
      }
    });

  } catch (error) {
    console.error('Error fetching club token info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch club token information' },
      { status: 500 }
    );
  }
}