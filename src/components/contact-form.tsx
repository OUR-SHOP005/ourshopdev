"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateContact } from "@/lib/api/services/contactService";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// Define the form schema using Zod for validation
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  subject: z
    .string()
    .min(5, { message: "Subject must be at least 5 characters." }),
  message: z
    .string()
    .min(20, { message: "Message must be at least 20 characters." }),
  // Honeypot field - should remain empty
  website: z.string().max(0, { message: "Spam detected." }).optional(),
  // Time-based check for too-quick submissions
  startTime: z.number().optional(),
});

// Rate limiting storage in localStorage
const RATE_LIMIT_KEY = "contact_form_submissions";
const MAX_SUBMISSIONS = 3; // Maximum submissions allowed in time window
const TIME_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MIN_SUBMISSION_TIME = 5000; // Minimum time to fill form (5 seconds)

export function ContactForm() {
  const { mutateAsync: createContact, isPending } = useCreateContact();
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    website: "", // Honeypot field
    startTime: Date.now(), // When form was loaded
  });
  const [isBlocked, setIsBlocked] = useState(false);

  // Check for rate limiting on mount
  useEffect(() => {
    checkRateLimit();
  }, []);

  // Initialize the form with react-hook-form and Zod resolver
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: formState,
  });

  // Check if user has submitted too many forms recently
  const checkRateLimit = () => {
    try {
      const storedData = localStorage.getItem(RATE_LIMIT_KEY);
      if (storedData) {
        const submissions = JSON.parse(storedData) as number[];
        const now = Date.now();

        // Filter out submissions older than the time window
        const recentSubmissions = submissions.filter(
          (timestamp) => now - timestamp < TIME_WINDOW
        );

        if (recentSubmissions.length >= MAX_SUBMISSIONS) {
          setIsBlocked(true);
          toast.error("Too many submissions. Please try again later.");
        }

        // Update localStorage with current submissions
        localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recentSubmissions));
      }
    } catch (error) {
      console.error("Rate limit check failed:", error);
    }
  };

  // Record a new submission timestamp
  const recordSubmission = () => {
    try {
      const storedData = localStorage.getItem(RATE_LIMIT_KEY);
      const submissions = storedData ? JSON.parse(storedData) : [];
      submissions.push(Date.now());
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(submissions));

      // Check if this submission now blocks them
      if (submissions.length >= MAX_SUBMISSIONS) {
        setIsBlocked(true);
      }
    } catch (error) {
      console.error("Failed to record submission:", error);
    }
  };

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Check honeypot
      if (values.website) {
        console.log("Honeypot triggered - likely bot submission");
        // Pretend it worked but don't actually submit
        form.reset();
        toast.success("Message sent successfully!");
        return;
      }

      // Check if form was filled out too quickly (likely bot)
      const elapsedTime = Date.now() - (values.startTime || 0);
      if (elapsedTime < MIN_SUBMISSION_TIME) {
        console.log("Form filled too quickly - likely bot submission");
        // Pretend it worked but don't actually submit
        form.reset();
        toast.success("Message sent successfully!");
        return;
      }

      // If blocked by rate limiting, don't allow submission
      if (isBlocked) {
        toast.error("Too many messages sent recently. Please try again later.");
        return;
      }

      // All checks passed, submit form
      const contactData = {
        name: values.name,
        email: values.email,
        subject: values.subject,
        message: values.message,
      };

      await createContact(contactData);
      recordSubmission();

      form.reset();
      setFormState({
        name: "",
        email: "",
        subject: "",
        message: "",
        website: "",
        startTime: Date.now(),
      });
      toast.success("Message sent successfully!");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again later.");
    }
  }

  // Update form state on change
  const handleFormChange = () => {
    const values = form.getValues();
    setFormState({
      ...values,
      website: values.website || "",
      startTime: formState.startTime,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onChange={handleFormChange}
        className='space-y-6'
      >
        {/* Name Field */}
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder='Your name'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email Field */}
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type='email'
                  placeholder='Your email'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Subject Field */}
        <FormField
          control={form.control}
          name='subject'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input
                  placeholder='Subject of your message'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Message Field */}
        <FormField
          control={form.control}
          name='message'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Your message'
                  className='resize-none'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Honeypot field - hidden from real users, but bots will fill it */}
        <FormField
          control={form.control}
          name='website'
          render={({ field }) => (
            <FormItem style={{ display: "none" }}>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input
                  placeholder='Your website (leave empty)'
                  {...field}
                  tabIndex={-1}
                  aria-hidden='true'
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Hidden field to track form start time */}
        <input
          type='hidden'
          {...form.register("startTime")}
          value={formState.startTime}
        />

        {/* Submit Button */}
        <Button
          type='submit'
          disabled={isPending || isBlocked}
        >
          Send Message
        </Button>
      </form>
    </Form>
  );
}
