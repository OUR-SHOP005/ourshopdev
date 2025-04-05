import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { companyInfoSchema } from "@/lib/types";
import { z } from "zod";

// Type for company info
export type CompanyInfo = z.infer<typeof companyInfoSchema>;

// Query keys
export const companyKeys = {
  all: ["company"] as const,
  details: () => [...companyKeys.all, "details"] as const,
};

// API functions
const fetchCompanyInfo = async (): Promise<CompanyInfo> => {
  const response = await fetch("/api/company", {
    cache: "no-store",
    next: {
      revalidate: 0,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch company information");
  return response.json();
};

const updateCompanyInfo = async (
  data: Partial<CompanyInfo>
): Promise<CompanyInfo> => {
  const response = await fetch("/api/company", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update company information");
  return response.json();
};

// Hooks
export function useCompanyInfo() {
  return useQuery({
    queryKey: companyKeys.details(),
    queryFn: fetchCompanyInfo,
    staleTime: 1000 * 30,
  });
}

export function useUpdateCompanyInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCompanyInfo,
    onSuccess: (newData) => {
      queryClient.setQueryData(companyKeys.details(), newData);
    },
  });
}
