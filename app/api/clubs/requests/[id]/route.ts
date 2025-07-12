import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

// GET /api/clubs/requests/[id] - Get specific club request
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clubRequest = await prisma.clubRequest.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            walletAddress: true,
            profileImage: true
          }
        },
        club: true // Include created club if approved
      }
    });

    if (!clubRequest) {
      return NextResponse.json(
        { error: 'Club request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...clubRequest,
      legalDocuments: JSON.parse(clubRequest.legalDocuments || '[]'),
      socialMedia: JSON.parse(clubRequest.socialMedia || '{}')
    });
  } catch (error) {
    console.error('Error fetching club request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch club request' },
      { status: 500 }
    );
  }
}

// PATCH /api/clubs/requests/[id] - Approve or reject club request
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action, rejectionReason } = body; // action: 'approve' | 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    const clubRequest = await prisma.clubRequest.findUnique({
      where: { id: params.id },
      include: { user: true }
    });

    if (!clubRequest) {
      return NextResponse.json(
        { error: 'Club request not found' },
        { status: 404 }
      );
    }

    if (clubRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Club request has already been processed' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      // Create the club
      const club = await prisma.club.create({
        data: {
          name: clubRequest.clubName,
          location: clubRequest.location,
          description: clubRequest.description,
          founded: clubRequest.founded,
          tier: clubRequest.tier,
          ownerId: clubRequest.userId
        }
      });

      // Update request as approved
      const updatedRequest = await prisma.clubRequest.update({
        where: { id: params.id },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          clubId: club.id
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              walletAddress: true,
              profileImage: true
            }
          },
          club: true
        }
      });

      return NextResponse.json({
        ...updatedRequest,
        message: 'Club request approved and club created successfully'
      });

    } else if (action === 'reject') {
      // Update request as rejected
      const updatedRequest = await prisma.clubRequest.update({
        where: { id: params.id },
        data: {
          status: 'REJECTED',
          rejectionReason: rejectionReason || 'Request rejected',
          rejectedAt: new Date()
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              walletAddress: true,
              profileImage: true
            }
          }
        }
      });

      return NextResponse.json({
        ...updatedRequest,
        message: 'Club request rejected'
      });
    }

  } catch (error) {
    console.error('Error processing club request:', error);
    return NextResponse.json(
      { error: 'Failed to process club request' },
      { status: 500 }
    );
  }
}