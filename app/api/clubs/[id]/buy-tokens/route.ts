import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

// POST /api/clubs/[id]/buy-tokens - Buy tokens (simulated)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clubId } = await params;
    const body = await request.json();
    const { 
      userId,
      amount,
      pricePerToken
    } = body;

    // Validate required fields
    if (!userId || !amount || !pricePerToken) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, amount, pricePerToken' },
        { status: 400 }
      );
    }

    // Check if club exists and has a token
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
        { error: 'Club has no token available for purchase' },
        { status: 400 }
      );
    }

    // Check if user exists, create if not
    let user = await prisma.user.findUnique({
      where: { privyId: userId }
    });

    if (!user) {
      console.log(`Creating user ${userId} automatically for token purchase...`);
      user = await prisma.user.create({
        data: {
          privyId: userId,
          walletAddress: null,
          email: null
        }
      });
      console.log(`User ${userId} created successfully`);
    }

    // Check if user already owns tokens for this club
    const existingHolding = await prisma.userToken.findUnique({
      where: {
        userId_clubId: {
          userId,
          clubId
        }
      }
    });

    if (existingHolding) {
      // Update existing holding (add more tokens)
      const newAmount = (parseInt(existingHolding.amount) + parseInt(amount)).toString();
      
      const updatedHolding = await prisma.userToken.update({
        where: { id: existingHolding.id },
        data: {
          amount: newAmount,
          purchasedAt: new Date() // Update purchase time
        },
        include: {
          club: {
            select: {
              name: true,
              tokenSymbol: true
            }
          }
        }
      });

      console.log(`User ${userId} bought ${amount} more tokens for club ${club.name}. Total: ${newAmount}`);

      return NextResponse.json({
        success: true,
        message: 'Tokens purchased successfully',
        tokensPurchased: amount,
        totalTokens: newAmount,
        club: updatedHolding.club,
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}` // Simulated hash
      });
    } else {
      // Create new token holding
      const newHolding = await prisma.userToken.create({
        data: {
          userId,
          clubId,
          amount: amount.toString(),
          purchasePrice: pricePerToken.toString()
        },
        include: {
          club: {
            select: {
              name: true,
              tokenSymbol: true
            }
          }
        }
      });

      console.log(`User ${userId} bought ${amount} tokens for club ${club.name} for the first time`);

      return NextResponse.json({
        success: true,
        message: 'Tokens purchased successfully',
        tokensPurchased: amount,
        totalTokens: amount,
        club: newHolding.club,
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}` // Simulated hash
      });
    }

  } catch (error) {
    console.error('Error buying tokens:', error);
    return NextResponse.json(
      { error: 'Failed to purchase tokens' },
      { status: 500 }
    );
  }
}