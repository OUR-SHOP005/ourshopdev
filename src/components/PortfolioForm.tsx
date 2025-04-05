"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PortfolioRequestSchema } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";
import {
  useCreatePortfolio,
  useUpdatePortfolio,
} from "@/lib/api/services/portfolioService";
import { z } from "zod";
import { cn } from "@/lib/utils";

// Error interfaces for better type safety
interface ApiError {
  message: string;
  errors?: Record<string, string>;
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string>;
    };
  };
}

type PortfolioFormData = z.infer<typeof PortfolioRequestSchema>;

interface PortfolioFormProps {
  initialData?: Partial<PortfolioFormData>;
  onClose?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const LOCAL_STORAGE_KEY_NEW = "PortfolioFormData_new";
const LOCAL_STORAGE_KEY = "PortfolioFormData";

const PortfolioForm = ({
  initialData,
  onClose,
  onOpenChange,
  open,
}: PortfolioFormProps) => {
  // Debug the open state
  useEffect(() => {
    console.log("Form open state:", open);
  }, [open]);

  console.log("Initial Data:?:", initialData);
  // Memoize initial form values
  const defaultValues = useMemo(
    () => ({
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      excerpt: initialData?.excerpt || "",
      content: initialData?.content || "",
      category: initialData?.category || "",
      status: initialData?.status || "planned",
      technologies: initialData?.technologies || [],
      githubUrl: initialData?.githubUrl || "",
      liveUrl: initialData?.liveUrl || "",
      featuredImage: initialData?.featuredImage || "",
      gallery: initialData?.gallery || [],
      startDate: initialData?.startDate || "",
      endDate: initialData?.endDate || "",
      markdown: initialData?.markdown ?? true,
      featured: initialData?.featured || false,
    }),
    [initialData]
  );

  // State management with initialization potentially from localStorage
  const [technologies, setTechnologies] = useState<string[]>(
    defaultValues.technologies
  );
  const [gallery, setGallery] = useState<string[]>(defaultValues.gallery);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newTechnology, setNewTechnology] = useState("");
  const [userEditedFields, setUserEditedFields] = useState<
    Record<string, boolean>
  >({});

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid: formIsValid },
    setValue,
    watch,
    reset,
    trigger,
  } = useForm<PortfolioFormData>({
    resolver: zodResolver(PortfolioRequestSchema),
    defaultValues,
    mode: "onChange",
  });

  // Log form state for debugging
  useEffect(() => {
    console.log("Form errors:", errors);
    console.log("Form is valid:", formIsValid);
    console.log("Required fields:", {
      title: watch("title"),
      slug: watch("slug"),
      description: watch("description"),
      excerpt: watch("excerpt"),
      content: watch("content"),
      category: watch("category"),
      status: watch("status"),
      technologies: technologies,
    });
  }, [errors, formIsValid, watch, technologies]);

  // Memoize form field watchers
  const title = watch("title");
  const description = watch("description");
  const content = watch("content");
  const excerpt = watch("excerpt");
  const featuredImage = watch("featuredImage");

  // Memoize mutation hooks
  const createPortfolioMutation = useCreatePortfolio();
  const updatePortfolioMutation = useUpdatePortfolio();

  // Debug mutation status
  useEffect(() => {
    console.log("Create mutation status:", {
      isPending: createPortfolioMutation.isPending,
      isError: createPortfolioMutation.isError,
      error: createPortfolioMutation.error,
    });
  }, [
    createPortfolioMutation.isPending,
    createPortfolioMutation.isError,
    createPortfolioMutation.error,
  ]);

  // Load saved form data from localStorage on initial render
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        let savedData = null;
        let storageKey = "";

        if (initialData?._id) {
          // Existing Portfolio: Load from specific key
          storageKey = `${LOCAL_STORAGE_KEY}_${initialData._id}`;
          savedData = localStorage.getItem(storageKey);
        } else {
          // New Portfolio: Load from new Portfolio key
          storageKey = LOCAL_STORAGE_KEY_NEW;
          savedData = localStorage.getItem(storageKey);
        }

        if (savedData) {
          const parsedData = JSON.parse(savedData);
          console.log("Loading from localStorage:", parsedData);

          // Handle form fields
          Object.entries(parsedData).forEach(([key, value]) => {
            console.log(`Setting value for key: ${key}, value: ${value}`); // Track change
            if (key !== "technologies" && key !== "gallery") {
              // Handle date fields specifically to ensure proper format
              if (key === "startDate" || key === "endDate") {
                if (value) {
                  // Convert date to YYYY-MM-DD format for input fields
                  const date = new Date(value as string);
                  if (!isNaN(date.getTime())) {
                    const formattedDate = date.toISOString().split("T")[0];
                    setValue(
                      key as keyof PortfolioFormData,
                      formattedDate as string
                    );
                    console.log(`Formatted date for ${key}: ${formattedDate}`); // Track change
                  }
                } else {
                  setValue(key as keyof PortfolioFormData, "" as string);
                  console.log(`Cleared value for ${key}`); // Track change
                }
              } else {
                setValue(key as keyof PortfolioFormData, value as string);
                console.log(`Set value for ${key}: ${value}`); // Track change
              }
            }
          });

          // Handle technologies array
          if (
            Array.isArray(parsedData.technologies) &&
            parsedData.technologies.length > 0
          ) {
            setTechnologies(parsedData.technologies);
            console.log(
              "Setting technologies from localStorage:",
              parsedData.technologies
            );
          }

          // Handle gallery array
          if (
            Array.isArray(parsedData.gallery) &&
            parsedData.gallery.length > 0
          ) {
            setGallery(parsedData.gallery);
          }
        }
      } catch (error) {
        console.error("Error loading form data from localStorage:", error);
      }
    }
  }, [initialData, setValue]);

  // Save form data to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const formData = watch();
      const dataToSave = {
        ...formData,
        technologies,
        gallery,
        githubUrl: formData.githubUrl || undefined, // Convert empty string to undefined
        liveUrl: formData.liveUrl || undefined, // Convert empty string to undefined
        // Use string dates directly
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        aiGenerated: false,
      };
      console.log("Data to save:", dataToSave);
      // Use different keys for new and existing portfolios
      const storageKey = initialData?._id
        ? `${LOCAL_STORAGE_KEY}_${initialData._id}`
        : LOCAL_STORAGE_KEY_NEW;

      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    }
  }, [watch, technologies, gallery, initialData]);

  // Auto-generate slug when title changes if slug hasn't been manually edited
  useEffect(() => {
    if (title && !userEditedFields.slug) {
      const slugValue = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setValue("slug", slugValue, { shouldDirty: true });
    }
  }, [title, setValue, userEditedFields.slug]);

  // Auto-generate excerpt from description if not manually edited
  useEffect(() => {
    if (description && !userEditedFields.excerpt) {
      const truncatedDescription =
        description.length > 160
          ? description.substring(0, 157) + "..."
          : description;
      setValue("excerpt", truncatedDescription, { shouldDirty: true });
    }
  }, [description, setValue, userEditedFields.excerpt]);

  // Mark field as user edited
  const markFieldAsEdited = (fieldName: string) => {
    setUserEditedFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  // Reset user edited status if field is emptied
  const checkEmptyField = (fieldName: string, value: string | undefined) => {
    if (!value && userEditedFields[fieldName]) {
      setUserEditedFields((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  // Memoize callbacks
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen && hasUnsavedChanges) {
        if (
          window.confirm(
            "You have unsaved changes. Are you sure you want to close?"
          )
        ) {
          setHasUnsavedChanges(false);
          onOpenChange(newOpen);
          reset();
          // Clear localStorage for new portfolios when closing without saving
          if (!initialData?._id) {
            localStorage.removeItem(LOCAL_STORAGE_KEY_NEW);
          }
        }
      } else {
        onOpenChange(newOpen);
      }
    },
    [hasUnsavedChanges, onOpenChange, reset, initialData?._id]
  );

  const onSubmit = useCallback(
    async (formData: PortfolioFormData) => {
      console.log("Form submission data:", formData);
      console.log("Current technologies:", technologies);

      // Full validation before submission
      const isValid = await trigger();

      if (!isValid) {
        toast.error("Please fix the validation errors before submitting");
        return;
      }

      try {
        setIsSaving(true);

        if (technologies.length === 0) {
          toast.error("At least one technology is required");
          setIsSaving(false);
          return;
        }

        // Check if slug is unique for new portfolios
        if (!initialData?._id) {
          const isSlugValid = await validateSlug();
          if (!isSlugValid) {
            setIsSaving(false);
            return;
          }
        }

        // Ensure all required fields have values
        const requiredFields = [
          "title",
          "slug",
          "description",
          "excerpt",
          "content",
          "category",
          "status",
        ];
        for (const field of requiredFields) {
          if (!formData[field as keyof PortfolioFormData]) {
            toast.error(`${field} is required`);
            setIsSaving(false);
            return;
          }
        }

        // Validate with schema first
        const validatedData = PortfolioRequestSchema.parse(formData);

        // Prepare the data with proper types
        const completeData = {
          ...validatedData,
          technologies,
          gallery,
          githubUrl: validatedData.githubUrl || undefined, // Convert empty string to undefined
          liveUrl: validatedData.liveUrl || undefined, // Convert empty string to undefined
          // Store dates as ISO strings for API compatibility
          startDate: validatedData.startDate || undefined,
          endDate: validatedData.endDate || undefined,
          aiGenerated: false,
        };

        if (initialData?._id) {
          await updatePortfolioMutation.mutateAsync({
            id: initialData._id,
            data: completeData,
          });
          toast.success("Portfolio updated successfully");

          // Clear localStorage for this specific Portfolio
          localStorage.removeItem(`${LOCAL_STORAGE_KEY}_${initialData._id}`);
        } else {
          console.log("Creating new Portfolio with data:", completeData);
          try {
            const result = await createPortfolioMutation.mutateAsync(
              completeData
            );
            console.log("Create Portfolio result:", result);
            toast.success("Portfolio created successfully");

            // Clear general localStorage for new portfolios
            localStorage.removeItem(LOCAL_STORAGE_KEY_NEW);
          } catch (mutationError: unknown) {
            console.error("Mutation error details:", mutationError);

            const error = mutationError as ApiError;

            // Handle duplicate slug error
            if (
              error?.message?.includes("E11000 duplicate key error") ||
              error?.message?.includes("dup key: { slug:")
            ) {
              toast.error(
                "A Portfolio with this slug already exists. Please choose a different slug."
              );
              setIsSaving(false);
              return; // Return early to prevent the form from closing
            }

            // Handle other validation errors
            if (error?.errors) {
              const errorMessages = Object.values(error.errors).join(", ");
              toast.error(`Validation error: ${errorMessages}`);
            } else {
              // Rethrow to be caught by the outer catch
              throw mutationError;
            }

            setIsSaving(false);
            return;
          }
        }

        setHasUnsavedChanges(false);
        setUserEditedFields({});
        reset();
        onClose?.();
      } catch (error) {
        console.error("Form submission error:", error);
        let errorMessage = "An error occurred while saving the Portfolio";

        // Check if it's a response error with a message
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === "object" && error !== null) {
          // Try to extract message from response
          const errorObj = error as ApiError;
          if (errorObj.response?.data?.message) {
            errorMessage = errorObj.response.data.message;
          } else if (errorObj.message) {
            errorMessage = errorObj.message;
          }
        }

        toast.error(errorMessage);
      } finally {
        setIsSaving(false);
      }
    },
    [
      technologies,
      gallery,
      initialData,
      updatePortfolioMutation,
      createPortfolioMutation,
      reset,
      onClose,
      trigger,
    ]
  );

  // Effect to track unsaved changes
  useEffect(() => {
    if (isDirty) {
      setHasUnsavedChanges(true);
    }
  }, [isDirty]);

  // Handle image uploads
  const handleImageUpload = async (
    file: File,
    type: "featured" | "gallery"
  ) => {
    const formData = new FormData();
    formData.append("images", file);
    setIsUploading(true);
    let uploadedImageUrl = "";

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      uploadedImageUrl = data.files[0]?.url;

      if (!uploadedImageUrl) {
        throw new Error("No image URL received");
      }

      if (type === "featured") {
        setValue("featuredImage", uploadedImageUrl, { shouldDirty: true });
      } else {
        setGallery((prev) => [...prev, uploadedImageUrl]);
      }

      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Error uploading image");
      console.error("Image upload error:", error);
      if (type === "featured") {
        setValue("featuredImage", "", { shouldDirty: true });
      } else if (uploadedImageUrl) {
        setGallery((prev) => prev.filter((u) => u !== uploadedImageUrl));
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Technology management
  const handleAddTechnology = () => {
    if (newTechnology && !technologies.includes(newTechnology)) {
      const updatedTechnologies = [...technologies, newTechnology];
      console.log("Adding technology, new list:", updatedTechnologies);
      setTechnologies(updatedTechnologies);
      setNewTechnology("");
      setHasUnsavedChanges(true);
    }
  };

  const handleRemoveTechnology = (tech: string) => {
    setTechnologies((prev) => prev.filter((t) => t !== tech));
    setHasUnsavedChanges(true);
  };

  // Gallery management
  const handleRemoveGalleryImage = (url: string) => {
    setGallery((prev) => prev.filter((u) => u !== url));
    setHasUnsavedChanges(true);
  };

  // Slug generation
  const generateSlug = () => {
    const slugValue = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setValue("slug", slugValue, { shouldDirty: true });
  };

  // Add slug validation function
  const validateSlug = useCallback(async () => {
    const currentSlug = watch("slug");
    if (!currentSlug || initialData?.slug === currentSlug) return true;

    try {
      // Check if a Portfolio with this slug already exists
      const response = await fetch(`/api/portfolio?slug=${currentSlug}`);
      const data = await response.json();

      // If the API returns a Portfolio, the slug is already in use
      if (response.ok && data.portfolios && data.portfolios.length > 0) {
        toast.error(
          "This slug is already in use. Please choose a different one."
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error checking slug availability:", error);
      return true; // Allow submission on error
    }
  }, [watch, initialData?.slug]);

  // Add slug validation on blur
  const handleSlugBlur = async () => {
    if (watch("slug")) {
      markFieldAsEdited("slug");
      await validateSlug();
    }
  };

  return (
    <form
      onSubmit={(e) => {
        console.log("Form submission event triggered");
        handleSubmit((data) => {
          console.log("Form validation passed, calling onSubmit");
          onSubmit(data);
        })(e);
      }}
      className='space-y-4'
    >
      {/* Basic Information */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>yeah Basic Information</h3>
        <div className='space-y-2'>
          <Label htmlFor='title'>Title *</Label>
          <div className='relative'>
            <Input
              id='title'
              {...register("title")}
              maxLength={100}
            />
            <span className='absolute bottom-1 right-2 text-xs text-muted-foreground'>
              {title?.length || 0}/100
            </span>
          </div>
          {errors.title && (
            <p className='text-sm text-red-500'>{errors.title.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='slug'>Slug *</Label>
          <div className='flex gap-2'>
            <Input
              id='slug'
              {...register("slug")}
              onFocus={() => markFieldAsEdited("slug")}
              onBlur={async (e) => {
                checkEmptyField("slug", e.target.value);
                await handleSlugBlur();
              }}
            />
            <Button
              type='button'
              variant='outline'
              onClick={generateSlug}
            >
              Generate
            </Button>
          </div>
          {errors.slug && (
            <p className='text-sm text-red-500'>{errors.slug.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='description'>Description *</Label>
          <div className='relative'>
            <Textarea
              id='description'
              {...register("description")}
              maxLength={500}
              className='min-h-[100px] resize-none'
            />
            <span className='absolute bottom-2 right-2 text-xs text-muted-foreground'>
              {description?.length || 0}/500
            </span>
          </div>
          {errors.description && (
            <p className='text-sm text-red-500'>{errors.description.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='excerpt'>Excerpt *</Label>
          <div className='relative'>
            <Input
              id='excerpt'
              {...register("excerpt")}
              maxLength={160}
              onFocus={() => markFieldAsEdited("excerpt")}
              onBlur={(e) => checkEmptyField("excerpt", e.target.value)}
            />
            <span className='absolute bottom-1 right-2 text-xs text-muted-foreground'>
              {excerpt?.length || 0}/160
            </span>
          </div>
          {errors.excerpt && (
            <p className='text-sm text-red-500'>{errors.excerpt.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='content'>Content *</Label>
          <div className='relative'>
            <Textarea
              id='content'
              {...register("content")}
              className='min-h-[200px]'
              maxLength={10000}
            />
            <span className='absolute bottom-2 right-2 text-xs text-muted-foreground'>
              {content?.length || 0}/10000
            </span>
          </div>
          {errors.content && (
            <p className='text-sm text-red-500'>{errors.content.message}</p>
          )}
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='category'>Category *</Label>
            <Input
              id='category'
              {...register("category")}
            />
            {errors.category && (
              <p className='text-sm text-red-500'>{errors.category.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='status'>Status *</Label>
            <Select
              value={watch("status")}
              onValueChange={(value: "planned" | "in-progress" | "completed") =>
                setValue("status", value, { shouldDirty: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Select status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='planned'>Planned</SelectItem>
                <SelectItem value='in-progress'>In Progress</SelectItem>
                <SelectItem value='completed'>Completed</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className='text-sm text-red-500'>{errors.status.message}</p>
            )}
          </div>
        </div>

        <div className='space-y-2'>
          <Label>Technologies *</Label>
          <div className='flex gap-2'>
            <Input
              value={newTechnology}
              onChange={(e) => setNewTechnology(e.target.value)}
              placeholder='Add technology'
            />
            <Button
              type='button'
              onClick={handleAddTechnology}
            >
              Add
            </Button>
          </div>
          <div className='flex flex-wrap gap-2 mt-2'>
            {technologies.map((tech) => (
              <div
                key={tech}
                className='bg-secondary text-secondary-foreground px-2 py-1 rounded-md flex items-center gap-2'
              >
                {tech}
                <button
                  type='button'
                  onClick={() => handleRemoveTechnology(tech)}
                  className='text-secondary-foreground/50 hover:text-secondary-foreground'
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='githubUrl'>GitHub URL</Label>
            <Input
              id='githubUrl'
              {...register("githubUrl")}
            />
            {errors.githubUrl && (
              <p className='text-sm text-red-500'>{errors.githubUrl.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='liveUrl'>Live URL</Label>
            <Input
              id='liveUrl'
              {...register("liveUrl")}
            />
            {errors.liveUrl && (
              <p className='text-sm text-red-500'>{errors.liveUrl.message}</p>
            )}
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='startDate'>Start Date</Label>
            <Input
              type='date'
              id='startDate'
              {...register("startDate")}
            />
            {errors.startDate && (
              <p className='text-sm text-red-500'>{errors.startDate.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='endDate'>End Date</Label>
            <Input
              type='date'
              id='endDate'
              {...register("endDate")}
              min={watch("startDate") || undefined}
            />
            {errors.endDate && (
              <p className='text-sm text-red-500'>{errors.endDate.message}</p>
            )}
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='featuredImage'>Featured Image</Label>
          <div className='flex gap-4 items-start'>
            <div className='flex-1'>
              <Input
                id='featuredImageFile'
                type='file'
                accept='image/*'
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file, "featured");
                  }
                }}
                disabled={isUploading}
                className='mb-2'
              />
              {isUploading && (
                <div className='flex items-center text-sm text-muted-foreground'>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Uploading...
                </div>
              )}
            </div>
            <div
              className={cn(
                "relative w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center",
                featuredImage
                  ? "border-transparent"
                  : "border-muted-foreground/25"
              )}
            >
              {featuredImage ? (
                <>
                  <Image
                    src={featuredImage}
                    alt='Featured image preview'
                    fill
                    className='object-cover rounded-lg'
                    sizes='128px'
                  />
                  <button
                    type='button'
                    onClick={() =>
                      setValue("featuredImage", "", { shouldDirty: true })
                    }
                    className='absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-lg hover:bg-destructive/90 transition-colors'
                  >
                    <X className='h-4 w-4' />
                  </button>
                </>
              ) : (
                <span className='text-sm text-muted-foreground'>No image</span>
              )}
            </div>
          </div>
        </div>

        <div className='space-y-2'>
          <Label>Gallery Images</Label>
          <div className='flex gap-2'>
            <Input
              type='file'
              accept='image/*'
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImageUpload(file, "gallery");
                }
              }}
              disabled={isUploading}
            />
          </div>
          <div className='flex flex-wrap gap-2 mt-2'>
            {gallery.map((url) => (
              <div
                key={url}
                className='relative group'
              >
                <div className='relative w-20 h-20'>
                  <Image
                    src={url}
                    alt='Gallery image'
                    fill
                    className='object-cover rounded'
                    sizes='80px'
                  />
                  <button
                    type='button'
                    onClick={() => handleRemoveGalleryImage(url)}
                    className='absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100'
                  >
                    <X className='h-4 w-4' />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='flex items-center space-x-2'>
          <input
            type='checkbox'
            id='markdown'
            {...register("markdown")}
            className='rounded border-gray-300'
          />
          <Label htmlFor='markdown'>Use Markdown</Label>
        </div>
      </div>

      <DialogFooter>
        <Button
          type='button'
          variant='outline'
          onClick={() => handleOpenChange(false)}
        >
          Cancel
        </Button>
        <Button
          type='submit'
          disabled={
            createPortfolioMutation.isPending ||
            updatePortfolioMutation.isPending ||
            isSaving
          }
        >
          {createPortfolioMutation.isPending ||
          updatePortfolioMutation.isPending ||
          isSaving ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              {initialData?._id ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>{initialData?._id ? "Update" : "Create"} Portfolio</>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default PortfolioForm;
