"use client";

import { useState } from "react";
import {
  useGetServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from "@/lib/api/services/serviceService";
import { IService, ServiceFormData } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ServiceSchema } from "@/lib/types";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, PlusCircle, Save, Trash2, Edit, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ServicesAdminPage() {
  const { data: services, isLoading: isLoadingServices } = useGetServices();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const [activeTab, setActiveTab] = useState("services");
  const [editingService, setEditingService] = useState<IService | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ServiceFormData>({
    resolver: zodResolver(ServiceSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      image: "",
      featured: false,
    },
  });

  const watchImage = watch("image");

  // Initialize form when editing a service
  const handleEditService = (service: IService) => {
    setEditingService(service);
    setValue("name", service.name);
    setValue("description", service.description);
    setValue("price", service.price);
    setValue("image", service.image);
    setValue("featured", service.featured);
    setActiveTab("editor");
  };

  const handleCreateNewService = () => {
    setEditingService(null);
    reset({
      name: "",
      description: "",
      price: 0,
      image: "",
      featured: false,
    });
    setActiveTab("editor");
  };

  const handleDeleteService = (serviceId: string) => {
    setServiceToDelete(serviceId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteService = async () => {
    if (serviceToDelete) {
      try {
        await deleteService.mutateAsync(serviceToDelete);
      } catch (error) {
        console.error("Error deleting service:", error);
      } finally {
        setDeleteDialogOpen(false);
        setServiceToDelete(null);
      }
    }
  };

  const onSubmit = async (data: ServiceFormData) => {
    try {
      if (editingService && editingService._id) {
        await updateService.mutateAsync({
          id: editingService._id,
          data,
        });
        toast.success("Service updated successfully");
      } else {
        await createService.mutateAsync(data);
        toast.success("Service created successfully");
      }
      setActiveTab("services");
    } catch (error) {
      toast.error("Failed to save service");
      console.error("Error saving service:", error);
    }
  };

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("images", file);
    setIsUploadingImage(true);

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
    } catch (error) {
      toast.error("Error uploading image");
      console.error("Upload error:", error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (isLoadingServices) {
    return (
      <div className='p-4 space-y-4'>
        <Skeleton className='h-10 w-1/3' />
        <Skeleton className='h-4 w-1/4' />
        <div className='space-y-2'>
          <Skeleton className='h-12 w-full' />
          <Skeleton className='h-12 w-full' />
          <Skeleton className='h-12 w-full' />
        </div>
      </div>
    );
  }

  return (
    <div className='p-4 space-y-4'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold'>Services Management</h1>
          <p className='text-muted-foreground'>
            Create and manage the services you offer
          </p>
        </div>
        <Button onClick={handleCreateNewService}>
          <PlusCircle className='mr-2 h-4 w-4' />
          Add New Service
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className='mb-4'>
          <TabsTrigger value='services'>All Services</TabsTrigger>
          <TabsTrigger value='editor'>
            {editingService ? "Edit Service" : "Create Service"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='services'>
          <Card>
            <CardHeader>
              <CardTitle>Services List</CardTitle>
              <CardDescription>View and manage your services</CardDescription>
            </CardHeader>
            <CardContent>
              {services && services.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service._id}>
                        <TableCell>
                          <div className='h-12 w-12 relative'>
                            <AspectRatio ratio={1 / 1}>
                              {service.image ? (
                                <Image
                                  src={service.image}
                                  alt={service.name}
                                  fill
                                  className='object-cover rounded-md'
                                />
                              ) : (
                                <div className='h-full w-full bg-muted rounded-md flex items-center justify-center'>
                                  No Image
                                </div>
                              )}
                            </AspectRatio>
                          </div>
                        </TableCell>
                        <TableCell className='font-medium'>
                          {service.name}
                        </TableCell>
                        <TableCell>Rs.{service.price.toFixed(2)}</TableCell>
                        <TableCell>{service.featured ? "Yes" : "No"}</TableCell>
                        <TableCell className='text-right'>
                          <div className='flex justify-end gap-2'>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant='outline'
                                  size='sm'
                                >
                                  <Eye className='h-4 w-4' />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>{service.name}</DialogTitle>
                                  <DialogDescription>
                                    Service Details
                                  </DialogDescription>
                                </DialogHeader>
                                <div className='space-y-4 mt-4'>
                                  {service.image && (
                                    <div className='w-full h-48 relative'>
                                      <AspectRatio ratio={16 / 9}>
                                        <Image
                                          src={service.image}
                                          alt={service.name}
                                          fill
                                          className='object-cover rounded-md'
                                        />
                                      </AspectRatio>
                                    </div>
                                  )}
                                  <div>
                                    <h3 className='font-semibold'>Price</h3>
                                    <p>Rs.{service.price.toFixed(2)}</p>
                                  </div>
                                  <div>
                                    <h3 className='font-semibold'>
                                      Description
                                    </h3>
                                    <p>{service.description}</p>
                                  </div>
                                  <div className='flex items-center gap-2'>
                                    <h3 className='font-semibold'>Featured:</h3>
                                    <span>
                                      {service.featured ? "Yes" : "No"}
                                    </span>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleEditService(service)}
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                            <AlertDialog
                              open={
                                deleteDialogOpen &&
                                serviceToDelete === service._id
                              }
                              onOpenChange={(open) => {
                                if (!open) {
                                  setDeleteDialogOpen(false);
                                  setServiceToDelete(null);
                                }
                              }}
                            >
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant='destructive'
                                  size='sm'
                                  onClick={() =>
                                    handleDeleteService(service._id || "")
                                  }
                                >
                                  <Trash2 className='h-4 w-4' />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you sure you want to delete this
                                    service?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete the service &quot;
                                    {service.name}&quot; and remove all data
                                    associated with it.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={confirmDeleteService}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className='text-center py-10'>
                  <p className='text-muted-foreground'>No services found</p>
                  <Button
                    variant='outline'
                    className='mt-4'
                    onClick={handleCreateNewService}
                  >
                    <PlusCircle className='mr-2 h-4 w-4' />
                    Create Your First Service
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='editor'>
          <Card>
            <CardHeader>
              <CardTitle>
                {editingService ? "Edit Service" : "Create New Service"}
              </CardTitle>
              <CardDescription>
                {editingService
                  ? "Update the details of your service"
                  : "Fill out the form to create a new service"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className='space-y-6'
              >
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <Label htmlFor='name'>Service Name</Label>
                    <Input
                      id='name'
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className='text-sm text-red-500'>
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='price'>Price (Rs.)</Label>
                    <Input
                      id='price'
                      type='number'
                      step='0.01'
                      {...register("price", {
                        valueAsNumber: true,
                      })}
                    />
                    {errors.price && (
                      <p className='text-sm text-red-500'>
                        {errors.price.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='description'>Description</Label>
                  <Textarea
                    id='description'
                    {...register("description")}
                    rows={5}
                  />
                  {errors.description && (
                    <p className='text-sm text-red-500'>
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='image'>Service Image</Label>
                  <div className='flex items-start gap-4'>
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
                        disabled={isUploadingImage}
                      />
                      {isUploadingImage && (
                        <div className='flex items-center mt-2 text-sm text-muted-foreground'>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Uploading...
                        </div>
                      )}
                    </div>

                    {watchImage && (
                      <div className='w-24 h-24 relative'>
                        <AspectRatio ratio={1}>
                          <Image
                            src={watchImage}
                            alt='Service Image'
                            fill
                            className='object-cover rounded-md'
                          />
                        </AspectRatio>
                      </div>
                    )}
                  </div>
                  {errors.image && (
                    <p className='text-sm text-red-500'>
                      {errors.image.message}
                    </p>
                  )}
                </div>

                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='featured'
                    checked={watch("featured")}
                    onCheckedChange={(checked) => {
                      setValue("featured", checked as boolean);
                    }}
                  />
                  <Label
                    htmlFor='featured'
                    className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                  >
                    Feature this service on the homepage
                  </Label>
                </div>

                <div className='flex justify-end gap-4'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setActiveTab("services")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type='submit'
                    disabled={
                      createService.isPending || updateService.isPending
                    }
                  >
                    {createService.isPending || updateService.isPending ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className='mr-2 h-4 w-4' />
                        {editingService ? "Update Service" : "Create Service"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
