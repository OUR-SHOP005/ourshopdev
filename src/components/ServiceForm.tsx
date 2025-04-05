"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ServiceFormData, ServiceRequestSchema } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { DialogFooter, Dialog } from "@/components/ui/dialog";
import { useCreateService, useUpdateService } from "@/lib/api/services";

interface ServiceFormProps {
  initialData?: ServiceFormData & { _id?: string };
  onClose?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ServiceForm = ({
  initialData,
  onClose,
  open,
  onOpenChange,
}: ServiceFormProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
  } = useForm<ServiceFormData>({
    resolver: zodResolver(ServiceRequestSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      image: initialData?.image || "",
      featured: initialData?.featured || false,
    },
  });

  const watchName = watch("name");
  const watchImage = watch("image");
  const watchFeatured = watch("featured");

  useEffect(() => {
    if (isDirty) {
      setHasUnsavedChanges(true);
    }
  }, [isDirty]);

  useEffect(() => {
    const isMutating =
      createServiceMutation.isPending || updateServiceMutation.isPending;
    setIsSubmitting(isMutating);

    if (createServiceMutation.isSuccess || updateServiceMutation.isSuccess) {
      toast.success(
        initialData?._id
          ? "Service updated successfully"
          : "Service created successfully"
      );
      setIsSubmitting(false);
      setHasUnsavedChanges(false);
      onOpenChange(false);
    }

    if (createServiceMutation.isError || updateServiceMutation.isError) {
      toast.error("Failed to save service");
      setIsSubmitting(false);
    }
  }, [
    createServiceMutation.isPending,
    updateServiceMutation.isPending,
    createServiceMutation.isSuccess,
    updateServiceMutation.isSuccess,
    createServiceMutation.isError,
    updateServiceMutation.isError,
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
        setValue("image", imageUrl);
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

  const onSubmit = async (formData: ServiceFormData) => {
    try {
      // Validate the data with Zod schema
      const validationResult = ServiceRequestSchema.safeParse(formData);

      if (!validationResult.success) {
        const errors = validationResult.error.errors;
        // Show validation errors
        errors.forEach((error) => {
          toast.error(`${error.path.join(".")}: ${error.message}`);
        });
        return;
      }

      if (initialData?._id) {
        await updateServiceMutation.mutateAsync({
          id: initialData._id,
          data: formData,
        });
      } else {
        await createServiceMutation.mutateAsync(formData);
      }

      onClose?.();
    } catch (error) {
      toast.error("Failed to save service");
      console.error("Form submission error:", error);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='space-y-4'
      >
        {/* Basic Information */}
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold'>Service Information</h3>
          <div className='space-y-2'>
            <Label htmlFor='name'>Name *</Label>
            <div className='relative'>
              <Input
                id='name'
                {...register("name")}
                maxLength={100}
              />
              <span className='absolute bottom-1 right-2 text-xs text-muted-foreground'>
                {watchName?.length || 0}/100
              </span>
            </div>
            {errors.name && (
              <p className='text-sm text-red-500'>{errors.name.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='price'>Price *</Label>
            <Input
              id='price'
              type='number'
              step='0.01'
              min='0'
              {...register("price", { valueAsNumber: true })}
            />
            {errors.price && (
              <p className='text-sm text-red-500'>{errors.price.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='image'>Service Image</Label>
            <div className='flex gap-4 items-start'>
              <div className='flex-1'>
                <Input
                  id='imageFile'
                  type='file'
                  accept='image/*'
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageUpload(file);
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
              {watchImage && (
                <div className='relative w-32 h-32'>
                  <Image
                    src={watchImage}
                    alt='Service image preview'
                    className='object-cover rounded-lg'
                    fill
                    sizes='128px'
                  />
                  <button
                    type='button'
                    onClick={() => setValue("image", "")}
                    className='absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-lg hover:bg-destructive/90 transition-colors'
                  >
                    <X className='h-4 w-4' />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className='flex items-center space-x-2'>
            <Switch
              id='featured'
              checked={watchFeatured}
              onCheckedChange={(checked) => setValue("featured", checked)}
            />
            <Label htmlFor='featured'>Featured</Label>
          </div>
        </div>

        <div className='space-y-4'>
          <h3 className='text-lg font-semibold'>Description</h3>
          <div className='space-y-2'>
            <Label htmlFor='description'>Description *</Label>
            <Textarea
              id='description'
              {...register("description")}
              className='min-h-[150px]'
            />
            {errors.description && (
              <p className='text-sm text-red-500'>
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
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
                {initialData?._id ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{initialData?._id ? "Update" : "Create"} Service</>
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};

export default ServiceForm;
