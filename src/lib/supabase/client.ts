"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || "";

export const supabase = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

// Export createClient for use in hooks
export const createClient = () => {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
};

export const createAdminClient = () => {
  return createBrowserClient<Database>(supabaseUrl, supabaseServiceRoleKey);
};

// Type for user data in Supabase
export type UserData = {
  id: string;
  clerk_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  profile_image_url: string | null;
  is_admin: boolean;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
  public_metadata: {
    role: string;
  };
};
