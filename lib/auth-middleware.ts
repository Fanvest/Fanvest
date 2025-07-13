import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './database';
import { PermissionManager } from './permissions';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    privyId: string;
    role: string;
    walletAddress: string;
  };
}

// Middleware to verify user exists and attach to request
export async function withAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Get user info from headers (set by frontend)
    const privyId = request.headers.get('x-privy-id');
    const walletAddress = request.headers.get('x-wallet-address');

    if (!privyId || !walletAddress) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { privyId },
      select: {
        id: true,
        privyId: true,
        role: true,
        walletAddress: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Attach user to request
    (request as AuthenticatedRequest).user = user;

    return handler(request as AuthenticatedRequest);
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}

// Middleware to check club management permissions
export async function withClubPermission(
  request: NextRequest,
  clubId: string,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return withAuth(request, async (req) => {
    const user = req.user!;
    
    const canManage = await PermissionManager.canManageClub(user.id, clubId);
    
    if (!canManage) {
      return NextResponse.json(
        { error: 'Insufficient permissions to manage this club' },
        { status: 403 }
      );
    }

    return handler(req);
  });
}

// Helper to get userId from request headers
export function getUserIdFromHeaders(request: NextRequest): string | null {
  return request.headers.get('x-user-id');
}

// Helper to get privyId from request headers
export function getPrivyIdFromHeaders(request: NextRequest): string | null {
  return request.headers.get('x-privy-id');
}