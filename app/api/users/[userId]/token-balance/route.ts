import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

// GET /api/users/[userId]/token-balance - Get user's token balance for a specific club
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get('clubId');

    if (!clubId) {
      return NextResponse.json(
        { error: 'Missing clubId parameter' },
        { status: 400 }
      );
    }

    // Ensure user exists, create if not
    let user = await prisma.user.findUnique({
      where: { privyId: userId }
    });

    if (!user) {
      console.log(`Creating user ${userId} automatically for balance check...`);
      user = await prisma.user.create({
        data: {
          privyId: userId,
          walletAddress: null,
          email: null
        }
      });
      console.log(`User ${userId} created successfully`);
    }

    // Get user's token holding for the specific club
    const tokenHolding = await prisma.userToken.findUnique({
      where: {
        userId_clubId: {
          userId,
          clubId
        }
      },
      include: {
        club: {
          select: {
            name: true,
            tokenSymbol: true,
            totalSupply: true
          }
        }
      }
    });

    if (!tokenHolding) {
      return NextResponse.json({
        balance: 0,
        club: null,
        percentage: 0,
        message: 'User owns no tokens for this club'
      });
    }

    const balance = parseInt(tokenHolding.amount);
    const totalSupply = parseInt(tokenHolding.club.totalSupply || '0');
    const percentage = totalSupply > 0 ? (balance / totalSupply) * 100 : 0;

    return NextResponse.json({
      balance,
      club: tokenHolding.club,
      percentage: parseFloat(percentage.toFixed(2)),
      purchasePrice: tokenHolding.purchasePrice,
      purchasedAt: tokenHolding.purchasedAt
    });

  } catch (error) {
    console.error('Error fetching token balance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token balance' },
      { status: 500 }
    );
  }
}

// GET /api/users/[userId]/token-balance (without clubId) - Get all user's token holdings
export async function GET_ALL(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const tokenHoldings = await prisma.userToken.findMany({
      where: { userId },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            tokenSymbol: true,
            totalSupply: true,
            logo: true
          }
        }
      },
      orderBy: {
        purchasedAt: 'desc'
      }
    });

    const holdings = tokenHoldings.map(holding => {
      const balance = parseInt(holding.amount);
      const totalSupply = parseInt(holding.club.totalSupply || '0');
      const percentage = totalSupply > 0 ? (balance / totalSupply) * 100 : 0;

      return {
        clubId: holding.clubId,
        club: holding.club,
        balance,
        percentage: parseFloat(percentage.toFixed(2)),
        purchasePrice: holding.purchasePrice,
        purchasedAt: holding.purchasedAt
      };
    });

    return NextResponse.json({
      holdings,
      totalClubs: holdings.length
    });

  } catch (error) {
    console.error('Error fetching all token balances:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token balances' },
      { status: 500 }
    );
  }
}