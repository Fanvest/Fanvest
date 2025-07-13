'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface SubmitClubRequestData {
  userId: string;
  clubName: string;
  location: string;
  description?: string;
  founded?: number;
  tier?: 'AMATEUR' | 'SEMI_PRO' | 'GRASSROOTS';
  contactEmail: string;
  phoneNumber?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  legalDocuments?: string[]; // Array of document URLs or base64
  autoApprove?: boolean;
}

export function useSubmitClubRequest() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: SubmitClubRequestData) => {
      const response = await fetch('/api/clubs/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit club request');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['club-requests'] });
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
    }
  });

  return {
    submitRequest: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
    reset: mutation.reset
  };
}

export function useClubRequests(status?: string, userId?: string) {
  const queryParams = new URLSearchParams();
  if (status) queryParams.append('status', status);
  if (userId) queryParams.append('userId', userId);

  return useQuery({
    queryKey: ['club-requests', status, userId],
    queryFn: async () => {
      const response = await fetch(`/api/clubs/requests?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch club requests');
      }

      return response.json();
    },
    staleTime: 30000 // Cache for 30 seconds
  });
}

export function useClubRequest(requestId: string) {
  return useQuery({
    queryKey: ['club-request', requestId],
    queryFn: async () => {
      const response = await fetch(`/api/clubs/requests/${requestId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch club request');
      }

      return response.json();
    },
    enabled: !!requestId,
    staleTime: 30000
  });
}

export function useProcessClubRequest() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ 
      requestId, 
      action, 
      rejectionReason 
    }: { 
      requestId: string; 
      action: 'approve' | 'reject'; 
      rejectionReason?: string 
    }) => {
      const response = await fetch(`/api/clubs/requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, rejectionReason })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${action} club request`);
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['club-requests'] });
      queryClient.invalidateQueries({ queryKey: ['club-request'] });
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
    }
  });

  return {
    processRequest: mutation.mutateAsync,
    isProcessing: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset
  };
}