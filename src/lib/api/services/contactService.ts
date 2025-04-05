/**
 * Contact API service module
 * Handles all contact form and admin inbox related API functionality
 */

import { useApiMutation } from "@/lib/tanstack/hooks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { IContact } from "@/lib/types";
import { useAuth } from "@clerk/nextjs";
// Type definitions
export interface CreateContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface UpdateContactStatusInput {
  status: "unread" | "read" | "replied";
}

export interface ReplyContactInput {
  message: string;
}

// Filter type for contacts
export interface ContactFilters {
  status?: "unread" | "read" | "replied";
  searchTerm?: string;
  page?: number;
  limit?: number;
}

// Query keys
export const contactKeys = {
  all: ["contacts"] as const,
  lists: () => [...contactKeys.all, "list"] as const,
  list: (filters: ContactFilters = {}) =>
    [...contactKeys.lists(), filters] as const,
  details: () => [...contactKeys.all, "detail"] as const,
  detail: (id: string) => [...contactKeys.details(), id] as const,
};

/**
 * Fetch all contact messages with optional filtering
 */
const fetchContacts = async (status: string | null): Promise<IContact[]> => {
  let response;
  if (status) {
    response = await fetch(`/api/contact?status=${status}`);
  } else {
    response = await fetch(`/api/contact`);
  }
  if (!response.ok) throw new Error("Failed to fetch contacts");
  return response.json();
};

export function useContacts(filters: ContactFilters = {}) {
  return useQuery({
    queryKey: contactKeys.list(filters),
    queryFn: () => fetchContacts(filters.status || null),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
}
/**
 * Fetch a single contact message by ID
 */
export function useContact(id: string) {
  const fetchContact = async (): Promise<IContact> => {
    const response = await fetch(`/api/contact/${id}`);
    if (!response.ok) throw new Error("Failed to fetch contact");
    return response.json();
  };

  return useQuery({
    queryKey: contactKeys.detail(id),
    queryFn: fetchContact,
    enabled: !!id,
    staleTime: 0, // Set to 0 to always fetch fresh data
    gcTime: 60 * 1000, // Cache for 60 seconds
  });
}

/**
 * Create a new contact message
 */
export function useCreateContact() {
  const { userId } = useAuth();

  return useApiMutation<IContact, Error, CreateContactInput>(
    "/api/contact",
    "POST",
    {
      // Prepare the request data with userId from Clerk
      onMutate: (data) => {
        return {
          ...data,
          clerkId: userId || undefined,
          status: "unread",
          createdAt: new Date(),
        };
      },
    }
  );
}

/**
 * Update contact message status
 */
export function useUpdateContactStatus(id: string) {
  const queryClient = useQueryClient();

  return useApiMutation<IContact, Error, UpdateContactStatusInput>(
    `/api/contact/${id}/status`,
    "PATCH",
    {
      onSuccess: (data) => {
        queryClient.setQueryData(contactKeys.detail(id), data);
        return queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      },
    }
  );
}

/**
 * Send a reply to a contact message
 */
export function useReplyContact(id: string) {
  const queryClient = useQueryClient();

  return useApiMutation<IContact, Error, ReplyContactInput>(
    `/api/contact/${id}/reply`,
    "POST",
    {
      onSuccess: (data) => {
        queryClient.setQueryData(contactKeys.detail(id), {
          ...data,
          status: "replied",
        });
        return queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      },
    }
  );
}
