import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

// POST /api/polls/[id]/vote - Vote on a poll
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pollId } = await params;
    const body = await request.json();
    const { userId, optionId, tokenPower } = body;

    if (!userId || !optionId || !tokenPower) {
      return NextResponse.json(
        { error: 'Missing userId, optionId, or tokenPower' },
        { status: 400 }
      );
    }

    // Check if poll exists and is active
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: true
      }
    });

    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      );
    }

    if (poll.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Poll is not active' },
        { status: 400 }
      );
    }

    // Check if poll is within voting period
    const now = new Date();
    if (now < poll.startDate || now > poll.endDate) {
      return NextResponse.json(
        { error: 'Poll is not within voting period' },
        { status: 400 }
      );
    }

    // Check if option exists for this poll
    const validOption = poll.options.find(option => option.id === optionId);
    if (!validOption) {
      return NextResponse.json(
        { error: 'Invalid option for this poll' },
        { status: 400 }
      );
    }

    // Check if user already voted
    const existingVote = await prisma.pollResponse.findUnique({
      where: {
        userId_pollId: {
          userId,
          pollId
        }
      }
    });

    if (existingVote) {
      // Update existing vote
      const response = await prisma.pollResponse.update({
        where: {
          userId_pollId: {
            userId,
            pollId
          }
        },
        data: {
          optionId,
          tokenPower
        },
        include: {
          option: true,
          user: {
            select: { id: true, walletAddress: true }
          }
        }
      });

      return NextResponse.json({ response, updated: true });
    } else {
      // Create new vote
      const response = await prisma.pollResponse.create({
        data: {
          userId,
          pollId,
          optionId,
          tokenPower
        },
        include: {
          option: true,
          user: {
            select: { id: true, walletAddress: true }
          }
        }
      });

      return NextResponse.json({ response, updated: false }, { status: 201 });
    }
  } catch (error) {
    console.error('Error voting on poll:', error);
    return NextResponse.json(
      { error: 'Failed to vote on poll' },
      { status: 500 }
    );
  }
}

// GET /api/polls/[id]/vote - Get user's vote for a poll
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pollId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    const response = await prisma.pollResponse.findUnique({
      where: {
        userId_pollId: {
          userId,
          pollId
        }
      },
      include: {
        option: true
      }
    });

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error fetching user vote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user vote' },
      { status: 500 }
    );
  }
}