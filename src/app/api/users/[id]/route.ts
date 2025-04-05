import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkRoleClerk } from "@/utils/roles";

// GET a single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createAdminClient();

    // Requesting user's own data or admin check
    if ((await params).id !== userId) {
      const { data: adminCheck } = await supabase
        .from("users")
        .select("is_admin")
        .eq("clerk_id", userId)
        .single();

      if (!adminCheck?.is_admin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_id", (await params).id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: data });
  } catch (error) {
    console.error("Error in GET /api/users/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - update user (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createAdminClient();

    // Check if admin
    const adminCheck = await checkRoleClerk("admin");

    if (!adminCheck) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Don't allow editing yourself (to prevent removing your own admin)
    if ((await params).id === userId) {
      return NextResponse.json(
        { error: "Cannot modify your own permissions" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const updates: Record<string, any> = {};

    // Only allow updating specific fields
    if (body.is_admin !== undefined) {
      updates.is_admin = !!body.is_admin;
    }

    if (body.is_banned !== undefined) {
      updates.is_banned = !!body.is_banned;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    updates.updated_at = new Date().toISOString();

    // Update user
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("clerk_id", (await params).id)
      .select()
      .single();

    if (error) {
      console.error("Error updating user:", error);
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }

    return NextResponse.json({ user: data });
  } catch (error) {
    console.error("Error in PATCH /api/users/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
