"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { ISEO } from "@/lib/types";

// Define the SEO form schema
const seoFormSchema = z.object({
  pagePath: z.string().min(1, "Page path is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(160, "Description must not exceed 160 characters"),
  keywords: z.string().optional(),
  robots: z.string().default("index, follow"),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
});

type SEOFormData = z.infer<typeof seoFormSchema>;

export default function SEOAdminPage() {
  const router = useRouter();
  const [seoEntries, setSeoEntries] = useState<ISEO[]>([]);
  const [selectedSEO, setSelectedSEO] = useState<ISEO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<SEOFormData>({
    resolver: zodResolver(seoFormSchema),
    defaultValues: {
      pagePath: "",
      title: "",
      description: "",
      keywords: "",
      robots: "index, follow",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
    },
  });

  // Fetch SEO entries on component mount
  useEffect(() => {
    fetchSEOEntries();
  }, []);

  // Set form values when selected SEO changes
  useEffect(() => {
    if (selectedSEO) {
      setValue("pagePath", selectedSEO.pagePath);
      setValue("title", selectedSEO.title);
      setValue("description", selectedSEO.description);
      setValue("keywords", selectedSEO.keywords?.join(", ") || "");
      setValue("robots", selectedSEO.robots || "index, follow");
      setValue("ogTitle", selectedSEO.openGraph?.title || "");
      setValue("ogDescription", selectedSEO.openGraph?.description || "");
      setValue("ogImage", selectedSEO.openGraph?.images?.[0]?.url || "");
    }
  }, [selectedSEO, setValue]);

  // Fetch SEO entries from API
  const fetchSEOEntries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/seo");
      if (response.ok) {
        const data = await response.json();
        setSeoEntries(data);
      } else {
        toast.error("Failed to fetch SEO entries");
      }
    } catch (error) {
      console.error("Error fetching SEO entries:", error);
      toast.error("An error occurred while fetching SEO entries");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data: SEOFormData) => {
    setIsSubmitting(true);
    try {
      // Convert comma-separated keywords to array
      const keywordsArray = data.keywords
        ? data.keywords.split(",").map((k) => k.trim())
        : [];

      // Prepare the payload
      const payload = {
        pagePath: data.pagePath,
        title: data.title,
        description: data.description,
        keywords: keywordsArray,
        robots: data.robots,
        openGraph: {
          title: data.ogTitle || data.title,
          description: data.ogDescription || data.description,
          images: data.ogImage
            ? [
                {
                  url: data.ogImage,
                },
              ]
            : undefined,
        },
      };

      // Determine if this is a create or update operation
      const method = selectedSEO ? "PUT" : "POST";
      const endpoint = selectedSEO ? `/api/seo/${selectedSEO._id}` : "/api/seo";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(
          `SEO metadata ${selectedSEO ? "updated" : "created"} successfully`
        );
        setDialogOpen(false);
        await fetchSEOEntries();
        reset();
        setSelectedSEO(null);
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to save SEO metadata");
      }
    } catch (error) {
      console.error("Error saving SEO metadata:", error);
      toast.error("An error occurred while saving SEO metadata");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle SEO entry deletion
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this SEO entry?")) {
      setIsDeleting(true);
      try {
        const response = await fetch(`/api/seo/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          toast.success("SEO entry deleted successfully");
          await fetchSEOEntries();
        } else {
          toast.error("Failed to delete SEO entry");
        }
      } catch (error) {
        console.error("Error deleting SEO entry:", error);
        toast.error("An error occurred while deleting SEO entry");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("images", file);
    setIsUploading(true);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.files[0]?.url;
        setValue("ogImage", imageUrl);
        toast.success("Image uploaded successfully");
      } else {
        toast.error("Error uploading image");
      }
    } catch {
      toast.error("Error uploading image");
    } finally {
      setIsUploading(false);
    }
  };

  // Open form dialog with new or existing SEO data
  const openFormDialog = (seo?: ISEO) => {
    setSelectedSEO(seo || null);
    setDialogOpen(true);
    if (!seo) {
      reset();
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>SEO Management</h1>
        <Button onClick={() => openFormDialog()}>
          <Plus className='mr-2 h-4 w-4' />
          <span className='hidden md:block'>Add SEO Entry</span>
        </Button>
      </div>

      <Tabs
        defaultValue='pages'
        className='w-full'
      >
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='pages'>Page Metadata</TabsTrigger>
          <TabsTrigger value='global'>Global Settings</TabsTrigger>
        </TabsList>

        <TabsContent
          value='pages'
          className='mt-4'
        >
          {isLoading ? (
            <div className='flex justify-center py-8'>
              <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
            </div>
          ) : seoEntries.length === 0 ? (
            <Card>
              <CardContent className='py-10 text-center'>
                <p className='text-muted-foreground'>
                  No SEO entries found. Create your first entry to improve your
                  website&apos;s search engine visibility.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className='grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
              {seoEntries.map((seo) => (
                <Card key={seo._id}>
                  <CardHeader>
                    <CardTitle className='text-lg'>{seo.title}</CardTitle>
                    <CardDescription>{seo.pagePath}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className='text-sm text-muted-foreground line-clamp-3'>
                      {seo.description}
                    </p>
                  </CardContent>
                  <CardFooter className='flex justify-between'>
                    <Button
                      variant='outline'
                      onClick={() => openFormDialog(seo)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant='destructive'
                      onClick={() => handleDelete(seo._id || "")}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        <Trash className='h-4 w-4' />
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent
          value='global'
          className='mt-4'
        >
          <Card>
            <CardHeader>
              <CardTitle>Global SEO Settings</CardTitle>
              <CardDescription>
                Configure global SEO settings that apply to your entire website.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground'>
                Global SEO settings can be managed in the site configuration.
                These include default metadata, robots.txt configuration, and
                sitemap settings.
              </p>
              <div className='mt-4 grid gap-4 grid-cols-1 md:grid-cols-2'>
                <Button
                  variant='outline'
                  onClick={() => router.push("/admin/seo/robots")}
                >
                  Edit robots.txt
                </Button>
                <Button
                  variant='outline'
                  onClick={() => router.push("/admin/seo/sitemap")}
                >
                  Sitemap Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      >
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>
              {selectedSEO ? "Edit SEO Metadata" : "Add SEO Metadata"}
            </DialogTitle>
            <DialogDescription>
              Configure SEO metadata for a specific page to improve search
              engine visibility.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className='space-y-6'
          >
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='pagePath'>Page Path *</Label>
                <Input
                  id='pagePath'
                  placeholder='/about, /blog, etc.'
                  {...register("pagePath")}
                />
                {errors.pagePath && (
                  <p className='text-sm text-destructive'>
                    {errors.pagePath.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='title'>Page Title *</Label>
                <Input
                  id='title'
                  placeholder='My Page Title'
                  {...register("title")}
                />
                {errors.title && (
                  <p className='text-sm text-destructive'>
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='description'>Meta Description *</Label>
                <Textarea
                  id='description'
                  placeholder='A brief description of the page content (50-160 characters)'
                  {...register("description")}
                />
                {errors.description && (
                  <p className='text-sm text-destructive'>
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='keywords'>Keywords</Label>
                <Input
                  id='keywords'
                  placeholder='keyword1, keyword2, keyword3'
                  {...register("keywords")}
                />
                <p className='text-xs text-muted-foreground'>
                  Comma-separated list of keywords
                </p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='robots'>Robots</Label>
                <Input
                  id='robots'
                  placeholder='index, follow'
                  {...register("robots")}
                />
              </div>
            </div>

            <div className='space-y-4'>
              <h3 className='font-medium'>Open Graph Settings</h3>

              <div className='space-y-2'>
                <Label htmlFor='ogTitle'>OG Title</Label>
                <Input
                  id='ogTitle'
                  placeholder='Leave blank to use page title'
                  {...register("ogTitle")}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='ogDescription'>OG Description</Label>
                <Textarea
                  id='ogDescription'
                  placeholder='Leave blank to use meta description'
                  {...register("ogDescription")}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='ogImage'>OG Image</Label>
                <div className='flex flex-col gap-2'>
                  <Input
                    id='ogImage'
                    placeholder='Image URL'
                    {...register("ogImage")}
                  />
                  <div className='flex items-center gap-2'>
                    <Input
                      id='ogImageFile'
                      type='file'
                      accept='image/*'
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file);
                        }
                      }}
                      disabled={isUploading}
                    />
                    {isUploading && (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
