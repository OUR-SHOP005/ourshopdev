"use client";

import { useState } from "react";
import {
  usePortfolios,
  useDeletePortfolio,
  useUpdatePortfolio,
} from "@/lib/api/services/portfolioService";
import { IPortfolio, PortfolioFormData } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DotsHorizontalIcon, PlusIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";
import PortfolioForm from "@/components/PortfolioForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminportfoliosPage() {
  // State declarations - all grouped together
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    technology: "all",
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState<IPortfolio | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [aiData, setAiData] = useState<IPortfolio | null>(null);
  const [idea, setIdea] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);

  // Query hooks
  const { data, isLoading, error } = usePortfolios(filters);
  const deleteMutation = useDeletePortfolio();
  const updateMutation = useUpdatePortfolio();

  // Extract unique categories and technologies before any conditionals
  const categories = [
    ...new Set((data || []).map((p: IPortfolio) => p.category).filter(Boolean)),
  ] as string[];

  const technologies = [
    ...new Set(
      (data || [])
        .flatMap((p: IPortfolio) => p.technologies || [])
        .filter(Boolean)
    ),
  ] as string[];

  // Event handlers
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateDialogClose = () => {
    setIsCreateDialogOpen(false);
  };

  const aiCreation = (Portfolio: IPortfolio) => {
    setAiData(Portfolio);
    setIsCreateDialogOpen(true);
  };

  const fetchAIPortfolio = async () => {
    if (!idea.trim()) {
      toast.error("Please enter a Portfolio idea");
      return;
    }

    setIsAILoading(true);
    try {
      const response = await fetch(
        `/api/ai/Portfolio?idea=${encodeURIComponent(idea)}`
      );
      if (!response.ok) {
        throw new Error("Failed to generate Portfolio");
      }
      const data = await response.json();
      aiCreation(data);
      setIsAIDialogOpen(false);
    } catch (error) {
      console.error("Error fetching AI Portfolio:", error);
      toast.error("Failed to generate Portfolio");
    } finally {
      setIsAILoading(false);
    }
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setSelectedPortfolio(null);
  };

  const handleEdit = (Portfolio: IPortfolio) => {
    setSelectedPortfolio(Portfolio);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this Portfolio?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          toast.success("Portfolio deleted successfully");
        },
        onError: (error: Error) => {
          toast.error("Failed to delete Portfolio");
          console.error("Delete error:", error);
        },
      });
    }
  };

  const toggleFeatured = (Portfolio: IPortfolio) => {
    if (Portfolio._id) {
      updateMutation.mutate(
        {
          id: Portfolio._id,
          data: { featured: !Portfolio.featured },
        },
        {
          onSuccess: () => {
            toast.success(
              `Portfolio ${
                Portfolio.featured ? "removed from" : "marked as"
              } featured`
            );
          },
          onError: (error: Error) => {
            toast.error("Failed to update featured status");
            console.error("Update error:", error);
          },
        }
      );
    }
  };

  if (error) {
    return (
      <Card className='m-4'>
        <CardContent className='p-6'>
          <div className='text-center text-red-500'>
            Error loading portfolios. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='p-4 space-y-4'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>portfolios</h1>
        <div className='flex gap-2'>
          <Dialog
            open={isAIDialogOpen}
            onOpenChange={setIsAIDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant='outline'>
                <span className='hidden md:block'>AI Portfolio Generator</span>
                <span className='block md:hidden'>AI</span>
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px]'>
              <DialogHeader>
                <DialogTitle>Generate Portfolio with AI</DialogTitle>
                <DialogDescription>
                  Enter a Portfolio idea to generate a Portfolio using AI.
                </DialogDescription>
              </DialogHeader>
              <div className='flex flex-col gap-4 py-4'>
                <Input
                  placeholder='Enter Portfolio idea'
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                />
                <Button
                  onClick={fetchAIPortfolio}
                  disabled={isAILoading}
                >
                  {isAILoading ? "Generating..." : "Fetch AI Content"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <PlusIcon className='mr-2 h-4 w-4' />
              New Portfolio
            </Button>
            <DialogContent className='sm:max-w-[625px]'>
              <DialogHeader>
                <DialogTitle>
                  <span className='hidden md:block'>Create New Portfolio</span>
                  <span className='block md:hidden'>+</span>
                </DialogTitle>
                <DialogDescription>
                  Fill in the Portfolio details below.
                </DialogDescription>
              </DialogHeader>
              <PortfolioForm
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onClose={handleCreateDialogClose}
                initialData={
                  aiData as (PortfolioFormData & { _id?: string }) | undefined
                }
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      >
        <DialogContent className='sm:max-w-[625px]'>
          <DialogHeader>
            <DialogTitle>Edit Portfolio</DialogTitle>
            <DialogDescription>
              Update the Portfolio details below.
            </DialogDescription>
          </DialogHeader>
          <PortfolioForm
            initialData={
              selectedPortfolio as
                | (PortfolioFormData & { _id?: string })
                | undefined
            }
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onClose={handleEditDialogClose}
          />
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Filters</CardTitle>
        </CardHeader>
        <CardContent className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='space-y-2'>
            <Label>Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All</SelectItem>
                <SelectItem value='in-progress'>In Progress</SelectItem>
                <SelectItem value='completed'>Completed</SelectItem>
                <SelectItem value='planned'>Planned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label>Category</Label>
            <Select
              value={filters.category}
              onValueChange={(value) => handleFilterChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select category' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All</SelectItem>
                {categories.map((category) => (
                  <SelectItem
                    key={category}
                    value={category}
                  >
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label>Technology</Label>
            <Select
              value={filters.technology}
              onValueChange={(value) => handleFilterChange("technology", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select technology' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All</SelectItem>
                {technologies.map((tech) => (
                  <SelectItem
                    key={tech}
                    value={tech}
                  >
                    {tech}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* portfolios Table */}
      <Card>
        <CardContent className='p-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='w-[100px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className='h-6 w-[250px]' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-6 w-[300px]' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-6 w-[100px]' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-8 w-8' />
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : data?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className='text-center'
                  >
                    No portfolios found
                  </TableCell>
                </TableRow>
              ) : (
                data?.map((Portfolio: IPortfolio) => (
                  <TableRow key={Portfolio._id}>
                    <TableCell className='font-medium'>
                      {Portfolio.title}
                      {Portfolio.featured && (
                        <Badge className='ml-2 bg-amber-500 hover:bg-amber-600'>
                          Featured
                        </Badge>
                      )}
                      {Portfolio.aiGenerated && (
                        <Badge className='ml-2 bg-purple-500 hover:bg-purple-600'>
                          AI Generated
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className='truncate max-w-[300px]'>
                      {Portfolio.description}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          Portfolio.status === "completed"
                            ? "default"
                            : Portfolio.status === "in-progress"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {Portfolio.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='ghost'
                            className='h-8 w-8 p-0'
                          >
                            <DotsHorizontalIcon className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleEdit(Portfolio)}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toggleFeatured(Portfolio)}
                          >
                            {Portfolio.featured
                              ? "Remove from Featured"
                              : "Mark as Featured"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className='text-red-600'
                            onClick={() => handleDelete(Portfolio._id || "")}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
