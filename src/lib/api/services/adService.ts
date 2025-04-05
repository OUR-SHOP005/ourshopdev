import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IAd } from "@/lib/types";

// Query keys
export const adKeys = {
  all: ["ads"] as const,
  lists: () => [...adKeys.all, "list"] as const,
  list: (filters: Record<string, string | number | boolean> = {}) =>
    [...adKeys.lists(), filters] as const,
  details: () => [...adKeys.all, "detail"] as const,
  detail: (_id: string) => [...adKeys.details(), _id] as const,
  random: () => [...adKeys.all, "random"] as const,
};

// API functions
const fetchAds = async (params = {}): Promise<{ ads: IAd[] }> => {
  const searchParams = new URLSearchParams(params as Record<string, string>);
  const response = await fetch(`/api/ads?${searchParams}`);
  if (!response.ok) throw new Error("Failed to fetch ads");
  return response.json();
};

const fetchAdById = async (_id: string): Promise<IAd> => {
  const response = await fetch(`/api/ads/${_id}`);
  if (!response.ok) throw new Error("Failed to fetch ad");
  return response.json();
};

const fetchRandomAd = async (params = {}): Promise<IAd | null> => {
  const searchParams = new URLSearchParams(params as Record<string, string>);
  const response = await fetch(`/api/ads/random?${searchParams}`);

  if (!response.ok) {
    if (response.status === 404) {
      return null; // No ad found, not an error
    }
    throw new Error("Failed to fetch random ad");
  }

  return response.json();
};

const createAd = async (
  ad: Omit<IAd, "_id" | "impressions" | "clicks" | "created_at">
): Promise<IAd> => {
  const response = await fetch("/api/ads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ad),
  });
  if (!response.ok) throw new Error("Failed to create ad");
  return response.json();
};

const updateAd = async ({
  _id,
  data,
}: {
  _id: string;
  data: Partial<IAd>;
}): Promise<IAd> => {
  const response = await fetch(`/api/ads/${_id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to update ad");
  }

  return response.json();
};

const deleteAd = async (_id: string): Promise<void> => {
  console.log(`Making DELETE request to /api/ads/${_id}`);
  const response = await fetch(`/api/ads/${_id}`, { method: "DELETE" });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Delete API error (${response.status}):`, errorText);
    throw new Error(errorText || "Failed to delete ad");
  }

  console.log(`Delete API success for ad ${_id}`);
  return response.json();
};

const trackImpression = async (_id: string): Promise<void> => {
  const response = await fetch(`/api/ads/${_id}/impression`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to track impression");
};

const trackClick = async (_id: string): Promise<void> => {
  const response = await fetch(`/api/ads/${_id}/click`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to track click");
};

// Hooks
export function useAds(filters = {}) {
  return useQuery({
    queryKey: adKeys.list(filters),
    queryFn: () => fetchAds(filters),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
}

export function useAd(_id: string) {
  return useQuery({
    queryKey: adKeys.detail(_id),
    queryFn: () => fetchAdById(_id),
    enabled: !!_id, // Only run when _id is available
    staleTime: 1000 * 60 * 10, // Consider data fresh for 10 minutes
  });
}

export function useRandomAd(shouldFetchAd: boolean) {
  return useQuery({
    queryKey: adKeys.random(),
    queryFn: () => (shouldFetchAd ? fetchRandomAd() : Promise.resolve(null)),
    staleTime: 1000 * 60 * 10, // Consider data fresh for 10 minutes
    retry: false, // Don't retry if no ad is found (404)
    enabled: shouldFetchAd, // Only run the query if shouldFetchAd is true
  });
}

export function useCreateAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAd,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adKeys.lists() });
    },
  });
}

export function useUpdateAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAd,
    onSuccess: (data) => {
      // Invalidate affected queries
      queryClient.invalidateQueries({ queryKey: adKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: adKeys.detail(data._id as string),
      });
    },
    onError: (error: Error) => {
      console.error("Update ad error:", error);
      throw error;
    },
  });
}

export function useDeleteAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAd,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adKeys.lists() });
    },
  });
}

export function useTrackImpression() {
  return useMutation({
    mutationFn: trackImpression,
  });
}

export function useTrackClick() {
  return useMutation({
    mutationFn: trackClick,
  });
}
