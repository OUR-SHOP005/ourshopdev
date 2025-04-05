"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { SitemapEntry } from "@/lib/types";

export default function SitemapConfigPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sitemapEntries, setSitemapEntries] = useState<SitemapEntry[]>([]);
  const [newEntry, setNewEntry] = useState<SitemapEntry>({
    url: "",
    changefreq: "weekly",
    priority: 0.8,
  });

  // Fetch sitemap configuration on component mount
  useEffect(() => {
    fetchSitemapConfig();
  }, []);

  const fetchSitemapConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/seo/sitemap-config");
      if (response.ok) {
        const data = await response.json();
        setSitemapEntries(data.entries || []);
      } else {
        toast.error("Failed to load sitemap configuration");
      }
    } catch (error) {
      console.error("Error fetching sitemap config:", error);
      toast.error("An error occurred while loading sitemap configuration");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        entries: sitemapEntries,
      };

      const response = await fetch("/api/seo/sitemap-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Sitemap configuration saved successfully");
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to save sitemap configuration");
      }
    } catch (error) {
      console.error("Error saving sitemap config:", error);
      toast.error("An error occurred while saving sitemap configuration");
    } finally {
      setIsSaving(false);
    }
  };

  // Add a new sitemap entry
  const addEntry = () => {
    // Basic validation
    if (!newEntry.url.trim()) {
      toast.error("URL is required");
      return;
    }

    // Ensure URL has proper format (starts with /)
    let formattedUrl = newEntry.url.trim();
    if (!formattedUrl.startsWith("/") && !formattedUrl.startsWith("http")) {
      formattedUrl = `/${formattedUrl}`;
    }

    // Check for duplicates
    if (sitemapEntries.some((entry) => entry.url === formattedUrl)) {
      toast.error("This URL already exists in the sitemap");
      return;
    }

    // Add the new entry
    setSitemapEntries([
      ...sitemapEntries,
      {
        ...newEntry,
        url: formattedUrl,
        id: Date.now().toString(), // Generate a temporary ID
      },
    ]);

    // Reset the new entry form
    setNewEntry({
      url: "",
      changefreq: "weekly",
      priority: 0.8,
    });
  };

  // Remove a sitemap entry
  const removeEntry = (index: number) => {
    setSitemapEntries(sitemapEntries.filter((_, i) => i !== index));
  };

  // Handle changes to the new entry form
  const handleNewEntryChange = (
    field: keyof SitemapEntry,
    value: string | number
  ) => {
    setNewEntry({
      ...newEntry,
      [field]: value,
    });
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Sitemap Configuration</h1>
        <Button
          variant='outline'
          onClick={() => router.back()}
        >
          Back
        </Button>
      </div>

      {isLoading ? (
        <div className='flex justify-center py-8'>
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className='space-y-6'
        >
          <Card>
            <CardHeader>
              <CardTitle>Sitemap Entries</CardTitle>
              <CardDescription>
                Configure URLs to include in your sitemap.xml file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 items-end'>
                  <div className='col-span-2 md:col-span-1 lg:col-span-2'>
                    <Label htmlFor='new-url'>URL</Label>
                    <Input
                      id='new-url'
                      placeholder='/path or https://example.com/path'
                      value={newEntry.url}
                      onChange={(e) =>
                        handleNewEntryChange("url", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor='new-changefreq'>Change Frequency</Label>
                    <Select
                      value={newEntry.changefreq}
                      onValueChange={(value) =>
                        handleNewEntryChange(
                          "changefreq",
                          value as SitemapEntry["changefreq"]
                        )
                      }
                    >
                      <SelectTrigger id='new-changefreq'>
                        <SelectValue placeholder='Select frequency' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='always'>Always</SelectItem>
                        <SelectItem value='hourly'>Hourly</SelectItem>
                        <SelectItem value='daily'>Daily</SelectItem>
                        <SelectItem value='weekly'>Weekly</SelectItem>
                        <SelectItem value='monthly'>Monthly</SelectItem>
                        <SelectItem value='yearly'>Yearly</SelectItem>
                        <SelectItem value='never'>Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor='new-priority'>Priority</Label>
                    <Select
                      value={String(newEntry.priority)}
                      onValueChange={(value) =>
                        handleNewEntryChange("priority", parseFloat(value))
                      }
                    >
                      <SelectTrigger id='new-priority'>
                        <SelectValue placeholder='Select priority' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='1.0'>1.0 (Highest)</SelectItem>
                        <SelectItem value='0.9'>0.9</SelectItem>
                        <SelectItem value='0.8'>0.8 (Default)</SelectItem>
                        <SelectItem value='0.7'>0.7</SelectItem>
                        <SelectItem value='0.6'>0.6</SelectItem>
                        <SelectItem value='0.5'>0.5 (Medium)</SelectItem>
                        <SelectItem value='0.4'>0.4</SelectItem>
                        <SelectItem value='0.3'>0.3</SelectItem>
                        <SelectItem value='0.2'>0.2</SelectItem>
                        <SelectItem value='0.1'>0.1 (Lowest)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='col-span-4 md:col-span-1'>
                    <Button
                      type='button'
                      onClick={addEntry}
                      className='w-full'
                    >
                      <Plus className='h-4 w-4 mr-2' /> Add Entry
                    </Button>
                  </div>
                </div>

                {sitemapEntries.length === 0 ? (
                  <div className='py-4 text-center text-muted-foreground'>
                    No sitemap entries added yet. Add URLs above to include in
                    your sitemap.
                  </div>
                ) : (
                  <div className='mt-6 border rounded-md'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>URL</TableHead>
                          <TableHead>Frequency</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead className='w-[100px]'>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sitemapEntries.map((entry, index) => (
                          <TableRow key={entry.id || index}>
                            <TableCell className='font-medium break-all'>
                              {entry.url}
                            </TableCell>
                            <TableCell>{entry.changefreq}</TableCell>
                            <TableCell>{entry.priority}</TableCell>
                            <TableCell>
                              <Button
                                variant='ghost'
                                size='icon'
                                onClick={() => removeEntry(index)}
                              >
                                <Trash className='h-4 w-4 text-destructive' />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type='submit'
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Saving...
                  </>
                ) : (
                  "Save Configuration"
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>
                Important notes about sitemap configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-2 text-muted-foreground'>
                <p>
                  <strong>Automatic entries:</strong> Your sitemap will
                  automatically include blog posts and portfolios from your
                  database.
                </p>
                <p>
                  <strong>Change frequency:</strong> How often the page is
                  likely to change. Search engines use this as a hint.
                </p>
                <p>
                  <strong>Priority:</strong> The priority of this URL relative
                  to other URLs on your site. Valid values range from 0.0 to
                  1.0.
                </p>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
}
