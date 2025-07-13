'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';

interface ClubPermissions {
  canManage: boolean;
  canVote: boolean;
  canCreatePolls: boolean;
  role: string | null;
  tokenBalance: string;
  userRole: string;
}

export function usePermissions(clubId?: string) {
  const { user, authenticated } = usePrivy();
  const [permissions, setPermissions] = useState<ClubPermissions>({
    canManage: false,
    canVote: false,
    canCreatePolls: false,
    role: null,
    tokenBalance: '0',
    userRole: 'FAN'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authenticated || !user || !clubId) {
      setPermissions({
        canManage: false,
        canVote: false,
        canCreatePolls: false,
        role: null,
        tokenBalance: '0',
        userRole: 'FAN'
      });
      return;
    }

    const fetchPermissions = async () => {
      setLoading(true);
      try {
        // First get or create user in our database
        const userResponse = await fetch(
          `/api/auth/user?privyId=${user.id}&walletAddress=${user.wallet?.address}&email=${user.email?.address || ''}`
        );
        
        if (!userResponse.ok) {
          throw new Error('Failed to get user');
        }

        const userData = await userResponse.json();

        // Then get club permissions
        const permissionsResponse = await fetch(
          `/api/clubs/${clubId}/permissions?userId=${userData.id}`,
          {
            headers: {
              'x-privy-id': user.id,
              'x-user-id': userData.id,
              'x-wallet-address': user.wallet?.address || ''
            }
          }
        );

        if (permissionsResponse.ok) {
          const perms = await permissionsResponse.json();
          setPermissions(perms);
        }
      } catch (error) {
        console.error('Error fetching permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [authenticated, user, clubId]);

  return { permissions, loading };
}

export function useUserRole() {
  const { user, authenticated } = usePrivy();
  const [role, setRole] = useState<string>('FAN');
  const [dbUser, setDbUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authenticated || !user) {
      setRole('FAN');
      setDbUser(null);
      return;
    }

    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/auth/user?privyId=${user.id}&walletAddress=${user.wallet?.address}&email=${user.email?.address || ''}`
        );
        
        if (response.ok) {
          const userData = await response.json();
          setRole(userData.role);
          setDbUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [authenticated, user]);

  const isClubOwner = role === 'CLUB_OWNER';
  const canCreateClub = authenticated; // Tout le monde peut créer un club

  return { 
    role, 
    dbUser, 
    loading, 
    isClubOwner, 
    canCreateClub,
    authenticated 
  };
}