/**
 * Utility functions for TanStack Query
 */

/**
 * Creates a function that returns an endpoint with dynamic parameters
 */
export function createEndpointFactory(baseEndpoint: string) {
  return {
    base: () => baseEndpoint,
    detail: (id: string) => `${baseEndpoint}/${id}`,
    query: (params: Record<string, string | number | boolean | undefined>) => {
      const url = new URL(baseEndpoint, window.location.origin);
      
      // Add query parameters
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
      
      return url.pathname + url.search;
    },
    combine: (...segments: string[]) => {
      return [baseEndpoint, ...segments].join('/');
    }
  };
}

/**
 * Creates a set of query keys for a resource
 */
export function createQueryKeys(resource: string) {
  const keys = {
    all: [resource] as const,
    lists: () => [...keys.all, 'list'] as const,
    list: (filters: Record<string, any> = {}) => [...keys.lists(), filters] as const,
    details: () => [...keys.all, 'detail'] as const,
    detail: (id: string) => [...keys.details(), id] as const,
    infinite: () => [...keys.all, 'infinite'] as const,
    infiniteList: (filters: Record<string, any> = {}) => [...keys.infinite(), filters] as const,
  };
  
  return keys;
} 