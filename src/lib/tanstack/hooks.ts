import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
  QueryKey
} from '@tanstack/react-query';
import { apiRequest, APIError } from './api-client';

/**
 * Custom hook for fetching data from the API
 */
export function useApiQuery<TData = unknown, TError = APIError>(
  queryKey: QueryKey,
  endpoint: string,
  options?: UseQueryOptions<TData, TError> & { 
    headers?: HeadersInit;
    cache?: RequestCache;
    next?: { revalidate?: number | false; tags?: string[] };
    params?: Record<string, any>;
  }
) {
  const { headers, cache, next, params, ...queryOptions } = options || {};
  
  return useQuery<TData, TError>({
    queryKey,
    queryFn: async () => {
      return apiRequest<TData>(endpoint, {
        method: 'GET',
        headers,
        cache,
        next,
        params,
      });
    },
    ...queryOptions,
  });
}

/**
 * Custom hook for mutations (POST, PUT, DELETE, etc.)
 */
export function useApiMutation<TData = unknown, TError = APIError, TVariables = unknown>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST',
  options?: UseMutationOptions<TData, TError, TVariables> & {
    headers?: HeadersInit;
  }
) {
  const queryClient = useQueryClient();
  const { headers, ...mutationOptions } = options || {};
  
  return useMutation<TData, TError, TVariables>({
    mutationFn: async (variables) => {
      return apiRequest<TData>(endpoint, {
        method,
        headers,
        body: variables,
      });
    },
    ...mutationOptions,
  });
}

/**
 * Custom hook for invalidating query caches
 */
export function useInvalidateQueries() {
  const queryClient = useQueryClient();
  
  return {
    invalidateQueries: (queryKey: QueryKey) => {
      return queryClient.invalidateQueries({ queryKey });
    },
    invalidateAll: () => {
      return queryClient.invalidateQueries();
    },
  };
} 