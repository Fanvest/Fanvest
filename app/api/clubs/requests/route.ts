import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

// GET /api/clubs/requests - Get all club registration requests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // pending, approved, rejected
    const userId = searchParams.get('userId');

    const where: any = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const requests = await prisma.clubRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            walletAddress: true,
            profileImage: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching club requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch club requests' },
      { status: 500 }
    );
  }
}

// POST /api/clubs/requests - Submit a club registration request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      clubName,
      location,
      description,
      founded,
      tier,
      legalDocuments, // Array of document URLs/base64
      contactEmail,
      phoneNumber,
      website,
      socialMedia, // Object with social links
      autoApprove = true // For hackathon, auto-approve by default
    } = body;

    // Validate required fields
    if (!userId || !clubName || !location || !contactEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, clubName, location, contactEmail' },
        { status: 400 }
      );
    }

    // Check if user already has a pending request
    const existingRequest = await prisma.clubRequest.findFirst({
      where: {
        userId,
        status: 'PENDING'
      }
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending club registration request' },
        { status: 400 }
      );
    }

    // Create the club request
    const clubRequest = await prisma.clubRequest.create({
      data: {
        userId,
        clubName,
        location,
        description,
        founded,
        tier: tier || 'AMATEUR',
        legalDocuments: JSON.stringify(legalDocuments || []),
        contactEmail,
        phoneNumber,
        website,
        socialMedia: JSON.stringify(socialMedia || {}),
        status: autoApprove ? 'PENDING' : 'PENDING' // Will be auto-approved below
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

    // For hackathon: Auto-approve the request
    if (autoApprove) {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Auto-approve and create the club
      const approvedRequest = await approveClubRequest(clubRequest.id);
      
      return NextResponse.json({
        ...approvedRequest,
        message: 'Club registration request submitted and automatically approved for demo purposes'
      }, { status: 201 });
    }

    return NextResponse.json(clubRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating club request:', error);
    return NextResponse.json(
      { error: 'Failed to create club request' },
      { status: 500 }
    );
  }
}

// Helper function to approve a club request
async function approveClubRequest(requestId: string) {
  const clubRequest = await prisma.clubRequest.findUnique({
    where: { id: requestId },
    include: {
      user: true
    }
  });

  if (!clubRequest) {
    throw new Error('Club request not found');
  }

  // Create the actual club
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

  // Update the request status
  const updatedRequest = await prisma.clubRequest.update({
    where: { id: requestId },
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

  return updatedRequest;
}