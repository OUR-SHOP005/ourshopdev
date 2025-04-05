"use client";

import { useState, useEffect } from "react";
import { Loader2, Send, CheckSquare, Square, RefreshCw, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

// Types for content selection
interface ContentItem {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  description?: string;
  date: string;
}

interface MarketingContent {
  blogs: ContentItem[];
  portfolios: ContentItem[];
}

interface MarketingMail {
  _id: string;
  clerkId: string;
  name: string;
  email: string;
  hasConsented: boolean;
  createdAt: string;
}

export default function MarketingPage() {
  const [marketingMails, setMarketingMails] = useState<MarketingMail[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Email sending state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [contentType, setContentType] = useState<"blog" | "Portfolio">("blog");
  const [marketingContent, setMarketingContent] =
    useState<MarketingContent | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(
    null
  );
  const [customSubject, setCustomSubject] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  // Fetch subscribers
  useEffect(() => {
    const fetchMarketingMails = async () => {
      try {
        const response = await fetch("/api/admin/marketing-mails");

        if (!response.ok) {
          throw new Error("Failed to fetch marketing subscribers");
        }

        const data = await response.json();
        setMarketingMails(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMarketingMails();
  }, []);

  // Dialog open handler - fetch content for email
  const handleOpenDialog = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one recipient");
      return;
    }

    setIsDialogOpen(true);
    await fetchMarketingContent();
  };

  // Fetch marketing content (blogs and portfolios)
  const fetchMarketingContent = async () => {
    try {
      setContentLoading(true);

      // Try to get from sessionStorage cache first
      const cacheKey = "marketing_content_cache";
      const cachedData = sessionStorage.getItem(cacheKey);
      const cacheTime = sessionStorage.getItem(cacheKey + "_time");

      // Check if we have valid cached data (less than 1 day old)
      if (cachedData && cacheTime) {
        const cacheAge = Date.now() - parseInt(cacheTime);
        if (cacheAge < 24 * 60 * 60 * 1000) {
          // 1 day in milliseconds
          setMarketingContent(JSON.parse(cachedData));
          setContentLoading(false);
          return;
        }
      }

      // If no valid cache, fetch from API
      const response = await fetch("/api/admin/marketing-content");

      if (!response.ok) {
        throw new Error("Failed to fetch content");
      }

      const data = await response.json();
      setMarketingContent(data);

      // Store in cache
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
      sessionStorage.setItem(cacheKey + "_time", Date.now().toString());
    } catch (err) {
      toast.error("Failed to load content for email");
      console.error(err);
    } finally {
      setContentLoading(false);
    }
  };

  // Handle selection of a single subscriber
  const toggleRecipient = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select/deselect all subscribers
  const toggleSelectAll = () => {
    if (
      selectedIds.length === marketingMails.filter((m) => m.hasConsented).length
    ) {
      setSelectedIds([]);
    } else {
      setSelectedIds(
        marketingMails
          .filter((mail) => mail.hasConsented)
          .map((mail) => mail._id as string)
      );
    }
  };

  // Handle content selection (blog or Portfolio)
  const selectContent = (item: ContentItem) => {
    setSelectedContent(item);
  };

  // Send marketing email
  const sendMarketingEmail = async () => {
    if (!selectedContent) {
      toast.error("Please select content to share");
      return;
    }

    try {
      setSendingEmail(true);

      const response = await fetch("/api/admin/marketing-mails/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientIds: selectedIds,
          contentType: contentType,
          contentId: selectedContent._id,
          customSubject: customSubject || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send emails");
      }

      const result = await response.json();

      toast.success(`Successfully sent ${result.message}`);
      setIsDialogOpen(false);
      resetEmailForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send emails");
    } finally {
      setSendingEmail(false);
    }
  };

  // Reset email form
  const resetEmailForm = () => {
    setSelectedContent(null);
    setCustomSubject("");
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[60vh]'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-800 dark:text-red-200'>
        <h2 className='text-lg font-semibold mb-2'>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  const subscribedCount = marketingMails.filter(
    (mail) => mail.hasConsented
  ).length;
  const selectedCount = selectedIds.length;

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold'>Marketing Email Subscribers</h1>
          <p className='text-muted-foreground'>
            Manage subscribers and send updates about new blog posts and
            portfolios.
          </p>
        </div>

        <div className='flex items-center gap-2'>
          {selectedCount > 0 && (
            <Badge
              variant='outline'
              className='px-2 py-1 h-8'
            >
              {selectedCount} selected
            </Badge>
          )}
          <Button
            onClick={handleOpenDialog}
            disabled={selectedCount === 0}
            className='flex items-center gap-2'
          >
            <Send className='h-4 w-4' />
            Send Email
          </Button>
        </div>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableCaption>
            A list of all marketing email subscribers.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className='w-12'>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={toggleSelectAll}
                  disabled={subscribedCount === 0}
                >
                  {selectedIds.length === subscribedCount &&
                  subscribedCount > 0 ? (
                    <CheckSquare className='h-4 w-4' />
                  ) : (
                    <Square className='h-4 w-4' />
                  )}
                </Button>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {marketingMails.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className='text-center py-6 text-muted-foreground'
                >
                  No subscribers found
                </TableCell>
              </TableRow>
            ) : (
              marketingMails.map((mail) => (
                <TableRow key={mail._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(mail._id as string)}
                      onCheckedChange={() =>
                        toggleRecipient(mail._id as string)
                      }
                      disabled={!mail.hasConsented}
                    />
                  </TableCell>
                  <TableCell className='font-medium'>{mail.name}</TableCell>
                  <TableCell>{mail.email}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        mail.hasConsented
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                      }`}
                    >
                      {mail.hasConsented ? "Subscribed" : "Unsubscribed"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(mail.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Email Content Selection Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      >
        <DialogContent className='sm:max-w-md md:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Send Marketing Email</DialogTitle>
            <DialogDescription>
              Select content to share with your subscribers.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>
                Email Subject (optional)
              </label>
              <Input
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder={`New ${contentType} update`}
                className='w-full'
              />
            </div>

            <Tabs
              defaultValue='blog'
              onValueChange={(v) => setContentType(v as "blog" | "Portfolio")}
            >
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='blog'>Blog Posts</TabsTrigger>
                <TabsTrigger value='Portfolio'>portfolios</TabsTrigger>
              </TabsList>

              <div className='mt-4 relative'>
                {contentLoading && (
                  <div className='absolute inset-0 bg-background/50 flex items-center justify-center z-10'>
                    <Loader2 className='h-6 w-6 animate-spin text-primary' />
                  </div>
                )}

                <TabsContent
                  value='blog'
                  className='space-y-2'
                >
                  {!marketingContent || marketingContent.blogs.length === 0 ? (
                    <div className='text-center py-8 text-muted-foreground'>
                      No blog posts found
                      <Button
                        variant='ghost'
                        size='sm'
                        className='ml-2'
                        onClick={fetchMarketingContent}
                      >
                        <RefreshCw className='h-4 w-4 mr-1' />
                        Refresh
                      </Button>
                    </div>
                  ) : (
                    <div className='space-y-2 max-h-[300px] overflow-y-auto pr-2'>
                      {marketingContent.blogs.map((blog) => (
                        <div
                          key={blog._id}
                          className={`p-3 border rounded-md cursor-pointer transition-colors ${
                            selectedContent?._id === blog._id
                              ? "border-primary bg-primary/5"
                              : "hover:bg-muted"
                          }`}
                          onClick={() => selectContent(blog)}
                        >
                          <div className='font-medium'>{blog.title}</div>
                          <div className='text-sm text-muted-foreground line-clamp-2 mt-1'>
                            {blog.excerpt || "No excerpt available"}
                          </div>
                          <div className='text-xs text-muted-foreground mt-2'>
                            {new Date(blog.date).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent
                  value='Portfolio'
                  className='space-y-2'
                >
                  {!marketingContent ||
                  marketingContent.portfolios.length === 0 ? (
                    <div className='text-center py-8 text-muted-foreground'>
                      No portfolios found
                      <Button
                        variant='ghost'
                        size='sm'
                        className='ml-2'
                        onClick={fetchMarketingContent}
                      >
                        <RefreshCw className='h-4 w-4 mr-1' />
                        Refresh
                      </Button>
                    </div>
                  ) : (
                    <div className='space-y-2 max-h-[300px] overflow-y-auto pr-2'>
                      {marketingContent.portfolios.map((Portfolio) => (
                        <div
                          key={Portfolio._id}
                          className={`p-3 border rounded-md cursor-pointer transition-colors ${
                            selectedContent?._id === Portfolio._id
                              ? "border-primary bg-primary/5"
                              : "hover:bg-muted"
                          }`}
                          onClick={() => selectContent(Portfolio)}
                        >
                          <div className='font-medium'>{Portfolio.title}</div>
                          <div className='text-sm text-muted-foreground line-clamp-2 mt-1'>
                            {Portfolio.description ||
                              "No description available"}
                          </div>
                          <div className='text-xs text-muted-foreground mt-2'>
                            {new Date(Portfolio.date).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>

            {selectedContent && (
              <div className='bg-muted/50 p-3 rounded-md mt-2'>
                <div className='flex justify-between items-start'>
                  <span className='text-sm font-medium'>Selected:</span>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6'
                    onClick={() => setSelectedContent(null)}
                  >
                    <X className='h-3 w-3' />
                  </Button>
                </div>
                <div className='text-sm mt-1'>{selectedContent.title}</div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsDialogOpen(false)}
              disabled={sendingEmail}
            >
              Cancel
            </Button>
            <Button
              onClick={sendMarketingEmail}
              disabled={!selectedContent || sendingEmail}
              className='ml-2'
            >
              {sendingEmail ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Sending...
                </>
              ) : (
                <>
                  <Send className='h-4 w-4 mr-2' />
                  Send to {selectedIds.length} recipient
                  {selectedIds.length !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
