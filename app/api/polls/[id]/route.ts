import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();
import { PollStatus } from '@/lib/generated/prisma';

// GET /api/polls/[id] - Get specific poll with details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pollId } = await params;
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        club: {
          select: { id: true, name: true, logo: true }
        },
        options: {
          include: {
            responses: {
              include: {
                user: {
                  select: { id: true, walletAddress: true }
                }
              }
            },
            _count: {
              select: { responses: true }
            }
          },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { responses: true }
        }
      }
    });

    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(poll);
  } catch (error) {
    console.error('Error fetching poll:', error);
    return NextResponse.json(
      { error: 'Failed to fetch poll' },
      { status: 500 }
    );
  }
}

// PATCH /api/polls/[id] - Update poll status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pollId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!Object.values(PollStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const poll = await prisma.poll.update({
      where: { id: pollId },
      data: { status },
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
        }
      }
    });

    return NextResponse.json(poll);
  } catch (error) {
    console.error('Error updating poll:', error);
    return NextResponse.json(
      { error: 'Failed to update poll' },
      { status: 500 }
    );
  }
}

// DELETE /api/polls/[id] - Delete poll
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.poll.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting poll:', error);
    return NextResponse.json(
      { error: 'Failed to delete poll' },
      { status: 500 }
    );
  }
}