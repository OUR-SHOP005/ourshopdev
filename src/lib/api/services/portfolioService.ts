import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IPortfolio } from "@/lib/types";

// Query keys for portfolios
export const portfolioKeys = {
  all: ["portfolios"] as const,
  lists: () => [...portfolioKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...portfolioKeys.lists(), filters] as const,
  details: () => [...portfolioKeys.all, "detail"] as const,
  detail: (slug: string) => [...portfolioKeys.details(), slug] as const,
  featured: () => [...portfolioKeys.all, "featured"] as const,
};

// Fetch functions
const fetchPortfolios = async (
  filters: Record<string, any> = {}
): Promise<{ portfolios: IPortfolio[] }> => {
  const searchParams = new URLSearchParams(filters).toString();
  const response = await fetch(`/api/portfolios?${searchParams}`);
  if (!response.ok) throw new Error("Failed to fetch portfolios");
  return response.json();
};

const fetchPortfolioBySlug = async (
  slug: string
): Promise<{ portfolios: IPortfolio[] }> => {
  const response = await fetch(`/api/portfolios?slug=${slug}`);
  if (!response.ok) throw new Error("Failed to fetch portfolio");
  return response.json();
};

const fetchFeaturedPortfolios = async (): Promise<{
  portfolios: IPortfolio[];
}> => {
  const response = await fetch("/api/portfolios?featured=true");
  if (!response.ok) throw new Error("Failed to fetch featured portfolios");
  return response.json();
};

const createPortfolio = async (
  portfolio: Omit<IPortfolio, "_id">
): Promise<IPortfolio> => {
  console.log("at db2 of portfolios");
  const response = await fetch("/api/portfolios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(portfolio),
  });
  if (!response.ok) throw new Error("Failed to create portfolio");
  return response.json();
};

const updatePortfolio = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<IPortfolio>;
}): Promise<IPortfolio> => {
  const response = await fetch(`/api/portfolios/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update portfolio");
  return response.json();
};

const deletePortfolio = async (id: string): Promise<void> => {
  const response = await fetch(`/api/portfolios/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete portfolio");
};

// React Query hooks
export function usePortfolios(filters = {}) {
  return useQuery({
    queryKey: portfolioKeys.list(filters),
    queryFn: () => fetchPortfolios(filters),
    select: (data) => data.portfolios,
  });
}

export function usePortfolio(slug: string) {
  return useQuery({
    queryKey: portfolioKeys.detail(slug),
    queryFn: () => fetchPortfolioBySlug(slug),
    select: (data) => data.portfolios[0],
  });
}

export function useFeaturedPortfolios() {
  return useQuery({
    queryKey: portfolioKeys.featured(),
    queryFn: fetchFeaturedPortfolios,
    select: (data) => data.portfolios,
  });
}

export function useCreatePortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPortfolio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portfolioKeys.lists() });
      queryClient.invalidateQueries({ queryKey: portfolioKeys.featured() });
    },
  });
}

export function useUpdatePortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePortfolio,
    onSuccess: (_, { data }) => {
      queryClient.invalidateQueries({ queryKey: portfolioKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: portfolioKeys.detail(data._id as string),
      });
      queryClient.invalidateQueries({ queryKey: portfolioKeys.featured() });
    },
  });
}

export function useDeletePortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePortfolio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portfolioKeys.lists() });
      queryClient.invalidateQueries({ queryKey: portfolioKeys.featured() });
    },
  });
}
