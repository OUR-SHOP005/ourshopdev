import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IBlog, BlogFormData } from "@/lib/types";

// Query keys
export const blogKeys = {
  all: ["blogs"] as const,
  lists: () => [...blogKeys.all, "list"] as const,
  list: (filters: Record<string, string> = {}) =>
    [...blogKeys.lists(), filters] as const,
  details: () => [...blogKeys.all, "detail"] as const,
  detail: (slug: string) => [...blogKeys.details(), slug] as const,
  featured: () => [...blogKeys.all, "featured"] as const,
};

// API functions
const fetchBlogs = async (params = {}): Promise<IBlog[]> => {
  const searchParams = new URLSearchParams(params as Record<string, string>);
  const response = await fetch(`/api/blogs?${searchParams}`);
  if (!response.ok) throw new Error("Failed to fetch blogs");
  return response.json();
};

const fetchBlogBySlug = async (slug: string): Promise<IBlog> => {
  const response = await fetch(`/api/blogs?slug=${slug}`);
  if (!response.ok) throw new Error("Failed to fetch blog");
  const data = await response.json();
  return data?.[0] || data;
};

const fetchFeaturedBlogs = async (): Promise<IBlog[]> => {
  const response = await fetch("/api/blogs?featured=true");
  if (!response.ok) throw new Error("Failed to fetch featured blogs");
  const data = await response.json();
  // Handle if the response is an object with blogs property or direct array
  return Array.isArray(data) ? data : data.blogs || [];
};

const createBlog = async (blog: BlogFormData): Promise<IBlog> => {
  const response = await fetch("/api/blogs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(blog),
  });
  if (!response.ok) throw new Error("Failed to create blog");
  return response.json();
};

const updateBlog = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<IBlog>;
}): Promise<IBlog> => {
  const response = await fetch(`/api/blogs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to update blog");
  }

  return response.json();
};

const deleteBlog = async (id: string): Promise<void> => {
  const response = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete blog");
  return response.json();
};

// Hooks
export function useBlogs(filters = {}) {
  return useQuery<IBlog[]>({
    queryKey: blogKeys.list(filters),
    queryFn: () => fetchBlogs(filters),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
}

export function useBlog(slug: string) {
  return useQuery<IBlog>({
    queryKey: blogKeys.detail(slug),
    queryFn: () => fetchBlogBySlug(slug),
    enabled: !!slug, // Only run when slug is available
    staleTime: 1000 * 60 * 10, // Consider data fresh for 10 minutes
  });
}

export function useFeaturedBlogs() {
  return useQuery<IBlog[]>({
    queryKey: blogKeys.featured(),
    queryFn: fetchFeaturedBlogs,
    staleTime: 1000 * 60 * 30, // Consider data fresh for 30 minutes
  });
}

export function useCreateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
      queryClient.invalidateQueries({ queryKey: blogKeys.featured() });
    },
  });
}

export function useUpdateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBlog,
    onSuccess: (data) => {
      // Invalidate affected queries
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
      queryClient.invalidateQueries({ queryKey: blogKeys.detail(data.slug) });
      queryClient.invalidateQueries({ queryKey: blogKeys.featured() });
    },
    onError: (error: Error) => {
      console.error("Update blog error:", error);
      throw error;
    },
  });
}

export function useDeleteBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
      queryClient.invalidateQueries({ queryKey: blogKeys.featured() });
    },
  });
}
