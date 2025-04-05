import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IService, ServiceFormData } from "@/lib/types";
import { toast } from "sonner";

// GET all services
export const useGetServices = () => {
  return useQuery<IService[]>({
    queryKey: ["services"],
    queryFn: async () => {
      const response = await fetch("/api/services");
      if (!response.ok) {
        throw new Error("Failed to fetch services");
      }
      return response.json();
    },
  });
};

// GET a single service by ID
export const useGetService = (id: string | undefined) => {
  return useQuery<IService>({
    queryKey: ["service", id],
    queryFn: async () => {
      if (!id) throw new Error("Service ID is required");

      const response = await fetch(`/api/services/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch service");
      }
      return response.json();
    },
    enabled: !!id,
  });
};

// CREATE a new service
export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ServiceFormData) => {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create service");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Service created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// UPDATE an existing service
export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ServiceFormData }) => {
      const response = await fetch(`/api/services/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update service");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["service", variables.id] });
      toast.success("Service updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// DELETE a service
export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete service");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Service deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
