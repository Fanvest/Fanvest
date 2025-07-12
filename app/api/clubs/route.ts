import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

// GET /api/clubs - Get all clubs or search clubs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const ownerId = searchParams.get('ownerId');

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (ownerId) where.ownerId = ownerId;

    const clubs = await prisma.club.findMany({
      where,
      include: {
        owner: {
          select: { privyId: true, walletAddress: true, profileImage: true }
        },
        _count: {
          select: {
            polls: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(clubs);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clubs' },
      { status: 500 }
    );
  }
}

// POST /api/clubs - Create a new club
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      location, 
      description, 
      founded, 
      ownerId 
    } = body;

    // Validate required fields
    if (!name || !location || !ownerId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, location, ownerId' },
        { status: 400 }
      );
    }

    // Check if club name already exists
    const existingClub = await prisma.club.findFirst({
      where: { name }
    });

    if (existingClub) {
      return NextResponse.json(
        { error: 'Club name already exists' },
        { status: 400 }
      );
    }

    // Create the club
    const club = await prisma.club.create({
      data: {
        name,
        location,
        description,
        founded,
        ownerId
      },
      include: {
        owner: {
          select: { privyId: true, walletAddress: true, profileImage: true }
        }
      }
    });

    return NextResponse.json(club, { status: 201 });
  } catch (error) {
    console.error('Error creating club:', error);
    return NextResponse.json(
      { error: 'Failed to create club' },
      { status: 500 }
    );
  }
}