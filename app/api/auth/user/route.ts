import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

// GET /api/auth/user - Get or create user from Privy data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const privyId = searchParams.get('privyId');

    console.log('Auth request for privyId:', privyId);

    if (!privyId) {
      return NextResponse.json(
        { error: 'Missing privyId' },
        { status: 400 }
      );
    }

    // Try to find existing user
    let user = await prisma.user.findUnique({
      where: { privyId },
      include: {
        clubs: {
          select: {
            id: true,
            name: true,
            logo: true,
            location: true
          }
        }
      }
    });

    if (!user) {
      // Create new user with just privyId (Privy manages the rest)
      console.log('Creating new user with privyId:', privyId);
      user = await prisma.user.create({
        data: {
          privyId
        },
        include: {
          clubs: {
            select: {
              id: true,
              name: true,
              logo: true,
              location: true
            }
          }
        }
      });
      console.log('Created user:', user.privyId);
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error handling user auth:', error);
    return NextResponse.json(
      { error: 'Failed to handle user authentication' },
      { status: 500 }
    );
  }
}

// PATCH /api/auth/user - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, profileImage } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (email !== undefined) updateData.email = email;
    if (profileImage !== undefined) updateData.profileImage = profileImage;

    const user = await prisma.user.update({
      where: { privyId: userId },
      data: updateData,
      select: {
        privyId: true,
        email: true,
        walletAddress: true,
        profileImage: true,
        createdAt: true
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}