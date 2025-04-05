# TanStack Query API Management

This directory contains the setup for managing API interactions using [TanStack Query](https://tanstack.com/query) (formerly React Query).

## Structure

- **provider.tsx**: The TanStack Query provider that wraps the application
- **api-client.ts**: Base API client for making fetch requests to API endpoints
- **hooks.ts**: Custom hooks for using queries and mutations
- **utils.ts**: Utility functions for creating endpoints and query keys

## Portfolio Implementation

The TanStack Query implementation is used throughout the Portfolio to efficiently manage API calls:

### Service Modules

API services are organized in `src/lib/api/services/` with separate modules for each entity:

- `portfolioService.ts`: Manages Portfolio-related API calls (fetch, create, update, delete)
- Additional service modules can be added for other entities

### Key Features

1. **Automatic Caching**: Same API calls are not repeated unnecessarily
2. **Loading States**: Consistent loading UI across components
3. **Error Handling**: Centralized error handling for API calls
4. **Invalidation**: Smart cache invalidation when data changes

### Client and Server Components

The Portfolio uses a hybrid approach:

1. **Server Components**: Initial page renders use server components for SEO
2. **Client Components**: These leverage TanStack Query for efficient data fetching
3. **Suspense**: Server components wrap client components with Suspense for a smooth UX

## Usage

### Basic Fetch

```tsx
import { useApiQuery } from "@/lib/tanstack/hooks";

function MyComponent() {
  const { data, isLoading, error } = useApiQuery<MyDataType>(
    ["my-data-key"],
    "/my-endpoint",
    {
      // Optional query configuration
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return <div>{data && <pre>{JSON.stringify(data, null, 2)}</pre>}</div>;
}
```

### Mutations

```tsx
import { useApiMutation } from "@/lib/tanstack/hooks";

function MyForm() {
  const mutation = useApiMutation<ResponseType, Error, InputType>(
    "/my-endpoint",
    "POST",
    {
      onSuccess: (data) => {
        console.log("Success!", data);
      },
    }
  );

  const handleSubmit = (formData: InputType) => {
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form content */}
      <button
        type='submit'
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
```

### Creating a Service Module

Create a new file in `src/lib/api/services/` for each logical API entity:

```tsx
// src/lib/api/services/userService.ts
import { useApiQuery, useApiMutation } from "@/lib/tanstack/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { createQueryKeys } from "@/lib/tanstack/utils";

// Define types
export interface User {
  id: string;
  name: string;
  email: string;
}

// Define query keys
export const userKeys = createQueryKeys("users");

// Define hooks
export function useUsers() {
  return useApiQuery<User[]>(userKeys.list(), "/users");
}

export function useUser(id: string) {
  return useApiQuery<User>(userKeys.detail(id), `/users/${id}`, {
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useApiMutation<User, Error, Omit<User, "id">>("/users", "POST", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
```

## Best Practices

1. **Query Keys**: Use consistent query key structures for caching and invalidation
2. **Error Handling**: The `APIError` class provides consistent error handling
3. **TypeScript**: Always type your API responses and inputs for better developer experience
4. **Invalidation**: Invalidate queries when related data changes
5. **Loading States**: Always handle loading and error states in your UI
6. **Server Components**: Use server components for SEO and client components with TanStack Query for enhanced interactivity

## Configuration

The default configuration in `provider.tsx` sets:

- `staleTime`: 60 seconds (how long data is considered fresh)
- `gcTime`: 5 minutes (how long inactive data is kept in cache)
- `retry`: 1 (retry failed requests once)
- `refetchOnWindowFocus`: false (don't refetch when window regains focus)

Adjust these settings as needed for your application requirements.
