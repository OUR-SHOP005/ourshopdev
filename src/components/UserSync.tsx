"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

export default function UserSync() {
  const { userId, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    // Only sync when user is signed in and loaded
    if (isLoaded && isSignedIn && userId) {
      const syncUser = async () => {
        try {
          // Call our API endpoint to sync user
          const response = await fetch("/api/users", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            console.error("Failed to sync user data to Supabase");
          }
        } catch (error) {
          console.error("Error syncing user data:", error);
        }
      };

      syncUser();
    }
  }, [userId, isLoaded, isSignedIn]);

  // This is a utility component that doesn't render anything
  return null;
}
