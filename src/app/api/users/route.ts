import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
// Add this to your debugging code
async function debugAuthSession() {
  const supabase = await createAdminClient();
  const { data, error } = await supabase.auth.getSession();
  console.log("Session:", data.session || "No session");
  console.log("Session error:", error || "No error");
}
// GET users (admin only)
export async function GET(request: NextRequest) {
  try {
    // Auth check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    debugAuthSession();

    const supabase = await createAdminClient();

    // Check if admin
    const { data: adminCheck } = await supabase
      .from("users")
      .select("is_admin")
      .eq("clerk_id", userId)
      .single();

    if (!adminCheck?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse URL parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const order = searchParams.get("order") || "desc";
    const orderBy = searchParams.get("orderBy") || "created_at";
    const isAdmin = searchParams.get("isAdmin");
    const isBanned = searchParams.get("isBanned");

    // Construct query
    let query = supabase.from("users").select("*", { count: "exact" });

    // Apply filters
    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    if (isAdmin === "true" || isAdmin === "false") {
      query = query.eq("is_admin", isAdmin === "true");
    }

    if (isBanned === "true" || isBanned === "false") {
      query = query.eq("is_banned", isBanned === "true");
    }

    // Apply pagination and ordering
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order(orderBy, { ascending: order === "asc" })
      .range(from, to);

    if (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      users: data,
      pagination: {
        total: count,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error) {
    console.error("Error in GET /api/users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - sync current user
export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createAdminClient();

    // Fetch user details from Clerk
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get existing user data first (for admin status preservation)
    const { data: existingUser } = await supabase
      .from("users")
      .select("is_admin, is_banned")
      .eq("clerk_id", clerkUser.id)
      .single();

    // Prepare user data for Supabase
    const userData = {
      clerk_id: clerkUser.id,
      first_name: clerkUser.firstName || null,
      last_name: clerkUser.lastName || null,
      email: clerkUser.emailAddresses[0]?.emailAddress || null,
      profile_image_url: clerkUser.imageUrl || null,
      public_metadata: clerkUser.publicMetadata || null,
      updated_at: new Date().toISOString(),
      // Preserve admin and banned status if user exists
      ...(existingUser
        ? {
            is_admin: existingUser.is_admin,
            is_banned: existingUser.is_banned,
          }
        : {}),
    };

    // Upsert user data to Supabase
    const { data, error } = await supabase
      .from("users")
      .upsert(userData, {
        onConflict: "clerk_id",
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error syncing user to Supabase:", error);
      return NextResponse.json(
        { error: "Failed to sync user data" },
        { status: 500 }
      );
    }

    return NextResponse.json({ user: data });
  } catch (error) {
    console.error("Error in POST /api/users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
