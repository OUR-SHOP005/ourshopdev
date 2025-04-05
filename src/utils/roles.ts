import { Roles } from "@/types/global";
import { auth } from "@clerk/nextjs/server";
import { getCurrentUserData } from "./auth";

export const checkRoleClerk = async (role: Roles) => {
  const { sessionClaims } = await auth();

  console.log(`sessionClaims:${JSON.stringify(sessionClaims)}}`);
  const metadata: { role?: Roles } | undefined = sessionClaims?.metadata;

  if (metadata) {
    return metadata.role === role;
  } else {
    return false;
  }
};

export const checkRoleSupabase = async (role: Roles) => {
  try {
    const data = await getCurrentUserData()

    // Check if user is banned first
    if (data && data.is_banned) {
      return false;
    }

    // Check for specific roles
    if (role === "admin") {
      return (data && data.is_admin) === true;
    }

    // Add more role checks here as needed

    return false;
  } catch (error) {
    console.error("Error in checkRoleSupabase:", error);
    return false;
  }
};
