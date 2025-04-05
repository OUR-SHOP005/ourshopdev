// Middleware for Clerk authentication
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/home",
  "/blog(.*)",
  "/portfolios(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/me(.*)",
  "/api/blogs(.*)",
  "/api/portfolio(.*)",
  "/api/ai/chatbot(.*)",
  "/api/users",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Only check user data if logged in
  if (userId) {
    try {
      // Get admin client outside the function
      const supabase = await createAdminClient();

      // Direct database query
      const { data: userData, error } = await supabase
        .from("users")
        .select("is_admin, is_banned")
        .eq("clerk_id", userId)
        .single();

      // Handle errors for logging
      if (error) {
        console.error("Supabase error in middleware:", error);
      }

      // Check if user is banned
      if (userData?.is_banned) {
        const url = new URL("/trash/ban", req.url);
        return NextResponse.redirect(url);
      }

      // Check admin routes
      if (isAdminRoute(req) && !userData?.is_admin) {
        const url = new URL("/", req.url);
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error("Error in middleware:", error);

      // If error occurs on admin route, redirect to safety
      if (isAdminRoute(req)) {
        const url = new URL("/", req.url);
        return NextResponse.redirect(url);
      }
    }
  }

  // Handle auth protection
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
