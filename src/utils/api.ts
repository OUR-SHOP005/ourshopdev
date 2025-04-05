import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Base API URL - replace with your actual API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com';

// Helper function for making API requests
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Generic hook for fetching data
export function useFetchData<T>(
  queryKey: string[],
  endpoint: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
    select?: (data: any) => T;
  }
) {
  return useQuery({
    queryKey,
    queryFn: () => fetchApi<T>(endpoint),
    ...options,
  });
}

// Generic hook for creating data
export function useCreateData<T, R>(
  mutationKey: string[],
  endpoint: string,
  options?: {
    onSuccess?: (data: R) => void;
    onError?: (error: Error) => void;
    invalidateQueries?: string[][];
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKey,
    mutationFn: (data: T) =>
      fetchApi<R>(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

// Generic hook for updating data
export function useUpdateData<T, R>(
  mutationKey: string[],
  endpoint: string,
  options?: {
    onSuccess?: (data: R) => void;
    onError?: (error: Error) => void;
    invalidateQueries?: string[][];
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKey,
    mutationFn: (data: T) =>
      fetchApi<R>(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

// Generic hook for deleting data
export function useDeleteData<R>(
  mutationKey: string[],
  endpoint: string,
  options?: {
    onSuccess?: (data: R) => void;
    onError?: (error: Error) => void;
    invalidateQueries?: string[][];
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKey,
    mutationFn: () =>
      fetchApi<R>(endpoint, {
        method: 'DELETE',
      }),
    onSuccess: (data) => {
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
} 