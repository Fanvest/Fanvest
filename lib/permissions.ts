import { UserRole, ClubRole } from './generated/prisma';
import { prisma } from './database';

export interface UserWithPermissions {
  id: string;
  role: UserRole;
  clubMemberships: {
    clubId: string;
    role: ClubRole;
  }[];
}

export class PermissionManager {
  // Check if user can manage a specific club
  static async canManageClub(userId: string, clubId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        clubs: { where: { id: clubId }, select: { id: true } },
        clubMemberships: { 
          where: { 
            clubId,
            role: ClubRole.OWNER
          }
        }
      }
    });

    if (!user) return false;

    // Check if user owns this club (creator)
    if (user.clubs.length > 0) return true;

    // Check if user has OWNER role in club membership
    if (user.clubMemberships.length > 0) return true;

    return false;
  }

  // Check if user can create polls for a club
  static async canCreatePoll(userId: string, clubId: string): Promise<boolean> {
    return this.canManageClub(userId, clubId);
  }

  // Check if user can vote on a poll
  static async canVoteOnPoll(userId: string, pollId: string): Promise<boolean> {
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        club: {
          include: {
            tokenHoldings: { where: { userId } }
          }
        }
      }
    });

    if (!poll) return false;

    // Check if user has tokens for this club (MEMBER = token holder)
    const hasTokens = poll.club.tokenHoldings.length > 0 && 
                     BigInt(poll.club.tokenHoldings[0].balance) > 0n;

    return hasTokens;
  }

  // Check if user can upload club logo
  static async canUploadClubLogo(userId: string, clubId: string): Promise<boolean> {
    return this.canManageClub(userId, clubId);
  }

  // Get user permissions for a club
  static async getUserClubPermissions(userId: string, clubId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        clubs: { where: { id: clubId } },
        tokenHoldings: { where: { clubId } }
      }
    });

    if (!user) {
      return {
        canManage: false,
        canVote: false,
        canCreatePolls: false,
        isOwner: false,
        tokenBalance: '0'
      };
    }

    const isOwner = user.clubs.length > 0;
    const tokenHolding = user.tokenHoldings[0];
    const hasTokens = tokenHolding && BigInt(tokenHolding.balance) > 0n;
    
    return {
      canManage: isOwner,
      canVote: hasTokens,
      canCreatePolls: isOwner,
      isOwner,
      tokenBalance: tokenHolding?.balance || '0',
      userRole: user.role
    };
  }

  // Upgrade user to club owner when they create a club
  static async upgradeToClubOwner(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { role: UserRole.CLUB_OWNER }
    });
  }

  // Add user as token holder (MEMBER)
  static async addTokenHolder(
    userId: string, 
    clubId: string, 
    tokenBalance: string
  ): Promise<void> {
    // Update or create token holding record
    await prisma.tokenHolding.upsert({
      where: {
        userId_clubId: { userId, clubId }
      },
      update: { balance: tokenBalance },
      create: {
        userId,
        clubId,
        balance: tokenBalance
      }
    });

    // Add as MEMBER in club membership if they have tokens
    if (BigInt(tokenBalance) > 0n) {
      await prisma.clubMembership.upsert({
        where: {
          userId_clubId: { userId, clubId }
        },
        update: { role: ClubRole.MEMBER },
        create: {
          userId,
          clubId,
          role: ClubRole.MEMBER
        }
      });
    }
  }
}