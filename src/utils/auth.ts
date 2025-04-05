import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import type { UserData } from "@/lib/supabase/client";
import { createAdminClient } from "@/lib/supabase/server";

// Function to save current user details to Supabase
export async function syncUserToSupabase() {
  try {
    // Get current user from Clerk
    const user = await currentUser();

    if (!user) return null;
    const supabase = await createAdminClient();

    // Get existing user data first (for admin status preservation)
    const { data: existingUser } = await supabase
      .from("users")
      .select("is_admin, is_banned")
      .eq("clerk_id", user.id)
      .single();

    // Prepare user data, preserving admin/banned status
    const userData = {
      clerk_id: user.id,
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.emailAddresses[0]?.emailAddress || null,
      profile_image_url: user.imageUrl,
      public_metadata: user.publicMetadata,
      // Preserve admin and banned status if user exists
      ...(existingUser
        ? {
            is_admin: existingUser.is_admin,
            is_banned: existingUser.is_banned,
          }
        : {}),
      updated_at: new Date().toISOString(),
    };

    // Upsert user data to Supabase
    const { data, error } = await supabase
      .from("users")
      .upsert(userData, {
        onConflict: "clerk_id",
        ignoreDuplicates: false,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error syncing user to Supabase:", error);
      return null;
    }

    return data as UserData;
  } catch (error) {
    console.error("Error in syncUserToSupabase:", error);
    return null;
  }
}

async function debugAuthSession() {
  const supabase = await createAdminClient();
  const { data, error } = await supabase.auth.getSession();
  console.log("Session:", data.session || "No session");
  console.log("Session error:", error || "No error");
}

// Get the current user data from Supabase
export async function getCurrentUserData() {
  try {
    const { userId } = await auth();
    console.log("user id at auth.ts: ", userId);
    if (!userId) return null;
    
    debugAuthSession();
    const supabase = await createAdminClient();
    
    console.log("Querying for clerk_id:", userId);
    
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_id", userId)
      .single();

    console.log("data at auth.ts: ", data);

    if (error || !data) {
      console.error("Error fetching user data:", error);
      return null;
    }

    return data as UserData;
  } catch (error) {
    console.error("Error in getCurrentUserData:", error);
    return null;
  }
}

// Check if current user is an admin
export async function isCurrentUserAdmin() {
  try {
    const userData = await getCurrentUserData();
    return userData?.is_admin || false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

// Check if current user is banned
export async function isCurrentUserBanned() {
  try {
    const userData = await getCurrentUserData();
    return userData?.is_banned || false;
  } catch (error) {
    console.error("Error checking ban status:", error);
    return false;
  }
}
