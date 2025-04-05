"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// LocalStorage key
const CONSENT_STORAGE_KEY = "marketing_mail_consent";

export default function MarketingMailConsent() {
  const { user, isSignedIn } = useUser();
  const [showConsent, setShowConsent] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Only check for signed-in users
    if (!isSignedIn || !user) return;

    // Check if user has already made a decision
    const checkConsentStatus = async () => {
      try {
        // Check localStorage first
        if (typeof window !== "undefined") {
          const localConsent = localStorage.getItem(
            `${CONSENT_STORAGE_KEY}_${user.id}`
          );

          if (localConsent) {
            // User has already made a decision according to localStorage
            return;
          }
        }

        // If not in localStorage, fetch from API
        const response = await fetch("/api/marketing-mail");
        const data = await response.json();

        // Only show the consent popup if the user hasn't made a decision yet
        if (!data.exists) {
          setShowConsent(true);
        } else {
          // Store the decision in localStorage for future reference
          if (typeof window !== "undefined") {
            localStorage.setItem(`${CONSENT_STORAGE_KEY}_${user.id}`, "true");
          }
        }
      } catch (error) {
        console.error("Error checking marketing consent status:", error);
      }
    };

    checkConsentStatus();
  }, [isSignedIn, user]);

  const handleConsent = async (hasConsented: boolean) => {
    if (!isSignedIn || !user) return;

    setIsLoading(true);

    try {
      await fetch("/api/marketing-mail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hasConsented }),
      });

      setShowConsent(false);

      // Store in localStorage that the user has made a decision
      if (typeof window !== "undefined") {
        localStorage.setItem(`${CONSENT_STORAGE_KEY}_${user.id}`, "true");
      }

      if (hasConsented) {
        toast.success("Thank you for subscribing to our updates!");
      }
    } catch (error) {
      console.error("Error saving marketing consent:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render anything if not signed in or popup shouldn't be shown
  if (!isSignedIn || !showConsent) return null;

  return (
    <div className='fixed inset-x-0 bottom-4 z-50 p-4 md:p-0'>
      <div className='mx-auto max-w-screen-lg'>
        <div className='relative overflow-hidden rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800 border border-primary/20'>
          <button
            onClick={() => setShowConsent(false)}
            className='absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            aria-label='Close'
          >
            <XCircle size={24} />
          </button>

          <div className='flex flex-col md:flex-row gap-6 items-start md:items-center'>
            <div className='flex-1'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                Stay Updated
              </h3>
              <p className='text-gray-600 dark:text-gray-300 text-sm md:text-base'>
                Stay in the loop with our latest blog posts and portfolios!
                We&apos;ll only send you updates you&apos;ll love—no clutter,
                just the good stuff.
              </p>
            </div>

            <div className='flex flex-col sm:flex-row gap-3 w-full md:w-auto'>
              <Button
                variant='secondary'
                onClick={() => handleConsent(false)}
                disabled={isLoading}
                className='w-full sm:w-auto bg-destructive text-destructive-foreground'
              >
                No, I&apos;m good 🚫
              </Button>
              <Button
                onClick={() => handleConsent(true)}
                disabled={isLoading}
                className='w-full sm:w-auto bg-primary text-primary-foreground'
              >
                {isLoading ? (
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                ) : (
                  "Yes, keep me in the loop"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
