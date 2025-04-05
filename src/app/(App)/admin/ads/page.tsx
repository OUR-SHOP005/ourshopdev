"use client";

import { useState } from "react";
import {
  useAds,
  useCreateAd,
  useUpdateAd,
  useDeleteAd,
} from "@/lib/api/services/adService";
import { IAd } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { AdCard } from "@/components/ads/AdCard";
import { AdForm } from "@/components/ads/AdForm";
import { AdFilters } from "@/components/ads/AdFilters";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminAdsPage() {
  const [filters, setFilters] = useState<
    Record<string, string | number | boolean>
  >({
    sortBy: "created_at",
    sortOrder: "desc",
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentAd, setCurrentAd] = useState<IAd | null>(null);

  // Fetch ads with current filters
  const { data, isLoading, error } = useAds(filters);
  const { mutate: createAd, isPending: isCreating } = useCreateAd();
  const { mutate: updateAd, isPending: isUpdating } = useUpdateAd();
  const { mutate: deleteAd, isPending: isDeleting } = useDeleteAd();

  // Handle create ad
  const handleCreateAd = (
    formData: Omit<IAd, "_id" | "impressions" | "clicks" | "created_at">
  ) => {
    createAd(formData, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        toast.success("Ad created successfully");
      },
      onError: (error) => {
        toast.error(`Failed to create ad: ${error.message}`);
      },
    });
  };

  // Handle edit ad
  const handleEditAd = (ad: IAd) => {
    setCurrentAd(ad);
    setIsEditDialogOpen(true);
  };

  // Handle update ad
  const handleUpdateAd = (formData: Partial<IAd>) => {
    if (!currentAd?._id) return;

    updateAd(
      { _id: currentAd._id as string, data: formData },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          toast.success("Ad updated successfully");
        },
        onError: (error) => {
          toast.error(`Failed to update ad: ${error.message}`);
        },
      }
    );
  };

  // Handle delete dialog
  const handleDeleteDialog = (id: string) => {
    const adToDelete = data?.ads.find((ad) => ad._id === id);
    setCurrentAd(adToDelete || null);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (!currentAd?._id) {
      console.error("Cannot delete: No ad ID available", { currentAd });
      toast.error("Cannot delete ad: Missing ID");
      return;
    }

    console.log("Attempting to delete ad:", currentAd._id);

    deleteAd(currentAd._id as string, {
      onSuccess: () => {
        console.log("Delete success for ad:", currentAd._id);
        setIsDeleteDialogOpen(false);
        toast.success("Ad deleted successfully");
      },
      onError: (error) => {
        console.error("Delete failed for ad:", currentAd._id, error);
        toast.error(`Failed to delete ad: ${error.message}`);
      },
    });
  };

  // Apply filters
  const handleFilter = (
    newFilters: Record<string, string | number | boolean>
  ) => {
    setFilters({ ...newFilters });
  };

  return (
    <div className='container py-8'>
      <div className='flex items-center justify-between mb-8'>
        <h1 className='text-3xl font-bold'>Ad Management</h1>
        <div className='flex items-center gap-3'>
          <AdFilters onFilter={handleFilter} />
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className='mr-2 h-4 w-4' />
            Add Ad
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className='bg-destructive/20 text-destructive p-4 rounded-md mb-6'>
          Failed to load ads. Please try again.
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
          {Array.from({ length: 8 }).map((_, index) => (
            <Card
              key={index}
              className='overflow-hidden h-full flex flex-col'
            >
              <div className='relative h-40'>
                <Skeleton className='absolute inset-0' />
              </div>

              <CardContent className='pt-4 flex-grow'>
                <Skeleton className='h-6 w-3/4 mb-1' />

                <div className='mt-3 space-y-2'>
                  {/* Skeleton for targeting info */}
                  <div className='flex flex-wrap gap-1 mb-2'>
                    <Skeleton className='h-5 w-16 rounded-full' />
                    <Skeleton className='h-5 w-20 rounded-full' />
                  </div>

                  {/* Skeleton for stats */}
                  <div className='grid grid-cols-2 gap-2'>
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-4 w-20' />
                  </div>

                  <Skeleton className='h-4 w-16' />
                  <Skeleton className='h-3 w-24' />
                </div>
              </CardContent>

              <CardFooter className='border-t p-3 pt-3 bg-muted/30'>
                <div className='flex justify-between w-full'>
                  <Skeleton className='h-9 w-16' />
                  <Skeleton className='h-9 w-16' />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {data?.ads && data.ads.length > 0 ? (
            data.ads.map((ad: IAd) => (
              <AdCard
                key={ad._id}
                ad={ad}
                onEdit={handleEditAd}
                onDelete={handleDeleteDialog}
              />
            ))
          ) : (
            <div className='col-span-full text-center py-12 text-muted-foreground'>
              No ads found. Create your first ad by clicking &quot;Add Ad&quot;.
            </div>
          )}
        </div>
      )}

      {/* Create Ad Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      >
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Create New Ad</DialogTitle>
            <DialogDescription>
              Create a new ad to display on your blog posts.
            </DialogDescription>
          </DialogHeader>
          <AdForm
            onSubmit={handleCreateAd}
            isSubmitting={isCreating}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Ad Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      >
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Edit Ad</DialogTitle>
            <DialogDescription>
              Update the details of your ad.
            </DialogDescription>
          </DialogHeader>
          <AdForm
            ad={currentAd as IAd}
            onSubmit={handleUpdateAd}
            isSubmitting={isUpdating}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the ad &quot;{currentAd?.title}
              &quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
