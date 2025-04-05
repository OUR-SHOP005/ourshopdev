import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
export default async function Page() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();
  redirect("/home");

  // Return a loading state while checking authentication
  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='animate-pulse text-center'>
        <p className='text-muted-foreground'>Checking authentication...</p>
      </div>
    </div>
  );
}
