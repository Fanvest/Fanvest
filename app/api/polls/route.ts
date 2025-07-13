import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();
import { PollType, PollStatus } from '@/lib/generated/prisma';

// GET /api/polls - Get all polls or polls for a specific club
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get('clubId');
    const status = searchParams.get('status') as PollStatus | null;

    const where: any = {};
    if (clubId) where.clubId = clubId;
    if (status) where.status = status;

    const polls = await prisma.poll.findMany({
      where,
      include: {
        club: {
          select: { id: true, name: true, logo: true }
        },
        options: {
          include: {
            _count: {
              select: { responses: true }
            }
          }
        },
        _count: {
          select: { responses: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(polls);
  } catch (error) {
    console.error('Error fetching polls:', error);
    return NextResponse.json(
      { error: 'Failed to fetch polls' },
      { status: 500 }
    );
  }
}

// POST /api/polls - Create a new poll
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      description, 
      pollType, 
      startDate, 
      endDate, 
      clubId, 
      options 
    } = body;

    // Validate required fields
    if (!title || !description || !clubId || !options || options.length < 2) {
      return NextResponse.json(
        { error: 'Missing required fields or insufficient options' },
        { status: 400 }
      );
    }

    // Create poll with options
    const poll = await prisma.poll.create({
      data: {
        title,
        description,
        pollType: pollType || PollType.GOVERNANCE,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        clubId,
        options: {
          create: options.map((option: { text: string; order: number }) => ({
            text: option.text,
            order: option.order
          }))
        }
      },
      include: {
        options: true,
        club: {
          select: { id: true, name: true, logo: true }
        }
      }
    });

    return NextResponse.json(poll, { status: 201 });
  } catch (error) {
    console.error('Error creating poll:', error);
    return NextResponse.json(
      { error: 'Failed to create poll' },
      { status: 500 }
    );
  }
}