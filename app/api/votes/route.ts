import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();
import { VoteChoice } from '@/lib/generated/prisma';

// GET /api/votes - Get blockchain governance votes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get('clubId');
    const userId = searchParams.get('userId');
    const proposalId = searchParams.get('proposalId');

    const where: any = {};
    if (clubId) where.clubId = clubId;
    if (userId) where.userId = userId;
    if (proposalId) where.proposalId = proposalId;

    const votes = await prisma.vote.findMany({
      where,
      include: {
        user: {
          select: { id: true, walletAddress: true, profileImage: true }
        },
        club: {
          select: { id: true, name: true, logo: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(votes);
  } catch (error) {
    console.error('Error fetching votes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch votes' },
      { status: 500 }
    );
  }
}

// POST /api/votes - Record a blockchain governance vote
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      proposalId, 
      vote, 
      tokenPower, 
      userId, 
      clubId, 
      transactionHash 
    } = body;

    // Validate required fields
    if (!proposalId || !vote || !tokenPower || !userId || !clubId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate vote choice
    if (!Object.values(VoteChoice).includes(vote)) {
      return NextResponse.json(
        { error: 'Invalid vote choice' },
        { status: 400 }
      );
    }

    // Check if user already voted on this proposal
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_proposalId: {
          userId,
          proposalId
        }
      }
    });

    if (existingVote) {
      return NextResponse.json(
        { error: 'User already voted on this proposal' },
        { status: 400 }
      );
    }

    // Create the vote record
    const voteRecord = await prisma.vote.create({
      data: {
        proposalId,
        vote,
        tokenPower,
        userId,
        clubId,
        transactionHash
      },
      include: {
        user: {
          select: { id: true, walletAddress: true, profileImage: true }
        },
        club: {
          select: { id: true, name: true, logo: true }
        }
      }
    });

    return NextResponse.json(voteRecord, { status: 201 });
  } catch (error) {
    console.error('Error recording vote:', error);
    return NextResponse.json(
      { error: 'Failed to record vote' },
      { status: 500 }
    );
  }
}