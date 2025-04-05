"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BlogFormData, BlogRequestSchema } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { DialogFooter, Dialog } from "@/components/ui/dialog";
import { useCreateBlog, useUpdateBlog } from "@/lib/api/services/blogService";

interface BlogFormProps {
  initialData?: BlogFormData & { _id?: string };
  onClose?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BlogForm = ({
  initialData,
  onClose,
  open,
  onOpenChange,
}: BlogFormProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const createBlogMutation = useCreateBlog();
  const updateBlogMutation = useUpdateBlog();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
  } = useForm<BlogFormData>({
    resolver: zodResolver(BlogRequestSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      content: initialData?.content || "",
      excerpt: initialData?.excerpt || "",
      featuredImage: initialData?.featuredImage || "",
      featured: initialData?.featured || false,
      isPublished: initialData?.isPublished || false,
      seo: {
        metaTitle: initialData?.seo?.metaTitle || "",
        metaDescription: initialData?.seo?.metaDescription || "",
        canonicalUrl: initialData?.seo?.canonicalUrl || ""
      },
    },
  });

  const watchTitle = watch("title");
  const watchExcerpt = watch("excerpt");
  const watchFeaturedImage = watch("featuredImage");
  const watchFeatured = watch("featured");
  const watchIsPublished = watch("isPublished");

  useEffect(() => {
    if (isDirty) {
      setHasUnsavedChanges(true);
    }
  }, [isDirty]);

  useEffect(() => {
    const isMutating = createBlogMutation.isPending || updateBlogMutation.isPending;
    setIsSubmitting(isMutating);
    
    if (createBlogMutation.isSuccess || updateBlogMutation.isSuccess) {
      toast.success(initialData?._id ? "Blog updated successfully" : "Blog created successfully");
      setIsSubmitting(false);
      setHasUnsavedChanges(false);
      onOpenChange(false);
    }

    if (createBlogMutation.isError || updateBlogMutation.isError) {
      toast.error("Failed to save blog post");
      setIsSubmitting(false);
    }
  }, [
    createBlogMutation.isPending,
    updateBlogMutation.isPending,
    createBlogMutation.isSuccess,
    updateBlogMutation.isSuccess,
    createBlogMutation.isError,
    updateBlogMutation.isError,
    initialData?._id,
    onOpenChange,
  ]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && hasUnsavedChanges) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to close?"
        )
      ) {
        setHasUnsavedChanges(false);
        onOpenChange(newOpen);
      }
    } else {
      onOpenChange(newOpen);
    }
  };

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
        setValue("featuredImage", imageUrl);
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

  const onSubmit = async (formData: BlogFormData) => {
    try {
      // Prepare SEO data by filling empty fields with fallbacks
      const seoData = {
        metaTitle: formData.seo?.metaTitle || formData.title,
        metaDescription: formData.seo?.metaDescription || formData.excerpt || formData.content.slice(0, 160),
        canonicalUrl: formData.seo?.canonicalUrl || ""
      };

      // Prepare the final data with complete SEO information
      const finalData: BlogFormData = {
        ...formData,
        seo: seoData,
        isPublished: formData.isPublished || false,
        featured: formData.featured || false,
      };

      // Validate the data with Zod schema
      const validationResult = BlogRequestSchema.safeParse(finalData);

      if (!validationResult.success) {
        const errors = validationResult.error.errors;
        // Show validation errors
        errors.forEach((error) => {
          toast.error(`${error.path.join('.')}: ${error.message}`);
        });
        return;
      }

      if (initialData?._id) {
        await updateBlogMutation.mutateAsync({
          id: initialData._id,
          data: finalData,
        });
        toast.success("Blog updated successfully");
      } else {
        await createBlogMutation.mutateAsync(finalData);
        toast.success("Blog created successfully");
      }
      
      onClose?.();
    } catch (error) {
      toast.error("Failed to save blog post");
      console.error("Form submission error:", error);
    }
  };

 


  const generateSlug = () => {
    const currentTitle = watchTitle;
    if (currentTitle) {
      const slug = currentTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setValue("slug", slug);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <div className="relative">
              <Input id="title" {...register("title")} maxLength={100} />
              <span className="absolute bottom-1 right-2 text-xs text-muted-foreground">
                {watchTitle?.length || 0}/100
              </span>
            </div>
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <div className="flex gap-2">
              <Input id="slug" {...register("slug")} />
              <Button type="button" variant="outline" onClick={generateSlug}>
                Generate
              </Button>
            </div>
            {errors.slug && (
              <p className="text-sm text-red-500">{errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="featuredImage">Featured Image</Label>
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <Input
                  id="featuredImageFile"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageUpload(file);
                    }
                  }}
                  disabled={isUploading}
                  className="mb-2"
                />
                {isUploading && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </div>
                )}
              </div>
              {watchFeaturedImage && (
                <div className="relative w-32 h-32">
                  <Image
                    src={watchFeaturedImage}
                    alt="Featured image preview"
                    className="object-cover rounded-lg"
                    fill
                    sizes="128px"
                  />
                  <button
                    type="button"
                    onClick={() => setValue("featuredImage", "")}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-lg hover:bg-destructive/90 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={watchFeatured}
                onCheckedChange={(checked) => setValue("featured", checked)}
              />
              <Label htmlFor="featured">Featured</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isPublished"
                checked={watchIsPublished}
                onCheckedChange={(checked) => setValue("isPublished", checked)}
              />
              <Label htmlFor="isPublished">Published</Label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Content</h3>
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <div className="relative">
              <Textarea
                id="excerpt"
                {...register("excerpt")}
                maxLength={160}
                className="min-h-[80px] resize-none"
              />
              <span className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                {watchExcerpt?.length || 0}/160
              </span>
            </div>
            {errors.excerpt && (
              <p className="text-sm text-red-500">{errors.excerpt.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              {...register("content")}
              className="min-h-[300px]"
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content.message}</p>
            )}
          </div>
        </div>

        

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">SEO Settings</h3>
          <div className="space-y-2">
            <Label htmlFor="seo.metaTitle">Meta Title</Label>
            <Input
              id="seo.metaTitle"
              {...register("seo.metaTitle")}
              placeholder="Leave blank to use blog title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo.metaDescription">Meta Description</Label>
            <Textarea
              id="seo.metaDescription"
              {...register("seo.metaDescription")}
              placeholder="Leave blank to use blog excerpt"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo.canonicalUrl">Canonical URL</Label>
            <Input
              id="seo.canonicalUrl"
              {...register("seo.canonicalUrl")}
              placeholder="Optional: URL to the canonical version of this content"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialData?._id ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{initialData?._id ? "Update" : "Create"} Blog Post</>
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};

export default BlogForm;
