"use client";

import { useState, useEffect, use } from "react";
import { Loader2, CheckCircle, AlertCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import Image from "next/image";
import Link from "next/link";

export default function UnsubscribePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resubscribed, setResubscribed] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const { id } = use(params);
  // Process unsubscribe on page load
  useEffect(() => {
    const handleUnsubscribe = async () => {
      try {
        if (!id) {
          throw new Error("Invalid unsubscribe link");
        }

        const response = await fetch(`/api/marketing-mail/unsubscribe/${id}`, {
          method: "POST",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to process request");
        }

        const data = await response.json();
        setUserEmail(data.email || "");
        setUserName(data.name || "");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    handleUnsubscribe();
  }, [id]);

  // Handle resubscribe
  const handleResubscribe = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/marketing-mail/resubscribe/${id}`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process request");
      }

      setResubscribed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resubscribe");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center p-4'>
        <Card className='w-full max-w-md'>
          <CardContent className='pt-6 pb-4 flex flex-col items-center'>
            <Loader2 className='h-10 w-10 text-primary animate-spin mb-4' />
            <p className='text-center text-muted-foreground'>
              Processing your request...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center p-4'>
        <Card className='w-full max-w-md border-destructive/50'>
          <CardHeader>
            <div className='flex justify-center mb-4'>
              <AlertCircle className='h-12 w-12 text-destructive' />
            </div>
            <CardTitle className='text-center text-xl'>Error</CardTitle>
            <CardDescription className='text-center'>{error}</CardDescription>
          </CardHeader>
          <CardFooter className='flex justify-center'>
            <Link href='/'>
              <Button variant='outline'>Return to homepage</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (resubscribed) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center p-4'>
        <Card className='w-full max-w-md border-primary/20'>
          <CardHeader>
            <div className='flex justify-center mb-4'>
              <CheckCircle className='h-12 w-12 text-primary' />
            </div>
            <CardTitle className='text-center text-xl'>Welcome Back!</CardTitle>
            <CardDescription className='text-center'>
              You&apos;ve been resubscribed to our updates. We&apos;re glad to
              have you back!
            </CardDescription>
          </CardHeader>
          <CardContent className='text-center'>
            <p className='text-muted-foreground'>
              You&apos;ll now receive updates about new blog posts and
              portfolios at {userEmail}.
            </p>
          </CardContent>
          <CardFooter className='flex justify-center'>
            <Link href='/'>
              <Button>Return to homepage</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex flex-col items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <div className='flex justify-center mb-4'>
            <Mail className='h-12 w-12 text-muted-foreground' />
          </div>
          <CardTitle className='text-center text-xl'>Unsubscribed</CardTitle>
          <CardDescription className='text-center'>
            {userName ? `Hi ${userName}, you've` : "You've"} been successfully
            unsubscribed from our updates.
          </CardDescription>
        </CardHeader>
        <CardContent className='text-center'>
          <p className='text-muted-foreground mb-6'>
            We&apos;re sorry to see you go. You will no longer receive marketing
            emails from us.
          </p>
          <div className='my-6 border-t border-b py-6'>
            <h3 className='font-medium mb-2'>Changed your mind?</h3>
            <Button
              onClick={handleResubscribe}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Processing...
                </>
              ) : (
                "Resubscribe"
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter className='flex justify-center'>
          <Link href='/'>
            <Button variant='outline'>Return to homepage</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
