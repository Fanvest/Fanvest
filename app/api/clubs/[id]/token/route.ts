import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

// PATCH /api/clubs/[id]/token - Update club with token contract info
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { 
      tokenAddress, 
      tokenSymbol, 
      totalSupply, 
      pricePerToken, 
      transactionHash 
    } = body;

    // Validate required fields
    if (!tokenAddress || !tokenSymbol || !totalSupply || !pricePerToken) {
      return NextResponse.json(
        { error: 'Missing required fields: tokenAddress, tokenSymbol, totalSupply, pricePerToken' },
        { status: 400 }
      );
    }

    // Check if club exists
    const existingClub = await prisma.club.findUnique({
      where: { id: params.id }
    });

    if (!existingClub) {
      return NextResponse.json(
        { error: 'Club not found' },
        { status: 404 }
      );
    }

    // Check if club already has a token
    if (existingClub.tokenAddress) {
      return NextResponse.json(
        { error: 'Club already has a token contract' },
        { status: 400 }
      );
    }

    // Update club with token information
    const updatedClub = await prisma.club.update({
      where: { id: params.id },
      data: {
        tokenAddress,
        tokenSymbol,
        totalSupply,
        pricePerToken
      },
      include: {
        owner: {
          select: { id: true, walletAddress: true, profileImage: true }
        }
      }
    });

    // Log the token creation event
    console.log(`Token created for club ${updatedClub.name}:`, {
      clubId: params.id,
      tokenAddress,
      tokenSymbol,
      totalSupply,
      pricePerToken,
      transactionHash,
      timestamp: new Date().toISOString()
    });

    // Optional: Create a revenue record for the initial token creation
    if (transactionHash) {
      try {
        await prisma.revenue.create({
          data: {
            amount: '0', // Initial creation, no revenue yet
            source: 'OTHER',
            description: `Token contract created: ${tokenSymbol}`,
            transactionHash,
            clubId: params.id,
            distributed: false
          }
        });
      } catch (revenueError) {
        console.warn('Failed to create revenue record:', revenueError);
        // Don't fail the main operation if revenue logging fails
      }
    }

    return NextResponse.json({
      success: true,
      club: updatedClub,
      message: 'Club token information updated successfully'
    });

  } catch (error) {
    console.error('Error updating club token info:', error);
    return NextResponse.json(
      { error: 'Failed to update club token information' },
      { status: 500 }
    );
  }
}

// GET /api/clubs/[id]/token - Get club token information
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const club = await prisma.club.findUnique({
      where: { id: params.id },
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
        { 
          hasToken: false,
          message: 'Club has not created a token yet'
        }
      );
    }

    return NextResponse.json({
      hasToken: true,
      club: {
        ...club,
        totalSupply: club.totalSupply,
        pricePerToken: club.pricePerToken
      }
    });

  } catch (error) {
    console.error('Error fetching club token info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch club token information' },
      { status: 500 }
    );
  }
}