"use client";

import { useState } from "react";
import {
  useBlogs,
  useDeleteBlog,
  useUpdateBlog,
} from "@/lib/api/services/blogService";
import { IBlog, BlogFormData } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon, PlusIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";
import BlogForm from "@/components/BlogForm"; // Adjust if your component has a different name
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

export default function AdminBlogPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<IBlog | null>(null);
  const [aiData, setAiData] = useState<IBlog | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);

  // Fetch blogs with TanStack Query
  const { data, isLoading } = useBlogs({});
  const blogs = data;

  // Use our custom mutation hooks
  const deleteMutation = useDeleteBlog();
  const updateMutation = useUpdateBlog();

  const handleEdit = (blog: IBlog) => {
    setSelectedBlog(blog);
    setIsEditDialogOpen(true);
  };

  const aiCreation = (blog: IBlog) => {
    setAiData(blog);
    setIsCreateDialogOpen(true);
  };

  const fetchAIBlog = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setIsAILoading(true);
    try {
      const response = await fetch(
        `/api/ai/blog?topic=${encodeURIComponent(topic)}`
      );
      if (!response.ok) {
        throw new Error("Failed to generate blog post");
      }
      const data = await response.json();
      aiCreation(data);
      setIsAIDialogOpen(false);
    } catch (error) {
      console.error("Error fetching AI blog:", error);
      toast.error("Failed to generate blog post");
    } finally {
      setIsAILoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          toast.success("Blog post deleted successfully");
        },
        onError: () => {
          toast.error("Failed to delete blog post");
        },
      });
    }
  };

  const handlePublishToggle = (blog: IBlog) => {
    updateMutation.mutate(
      {
        id: blog._id || "",
        data: {
          isPublished: !blog.isPublished,
          publishedAt: !blog.isPublished ? new Date().toISOString() : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            `Blog ${
              blog.isPublished ? "unpublished" : "published"
            } successfully`
          );
        },
        onError: () => {
          toast.error(
            `Failed to ${blog.isPublished ? "unpublish" : "publish"} blog`
          );
        },
      }
    );
  };

  const toggleFeatured = (blog: IBlog) => {
    updateMutation.mutate(
      {
        id: blog._id || "",
        data: { featured: !blog.featured },
      },
      {
        onSuccess: () => {
          toast.success(
            `Blog ${blog.featured ? "removed from" : "marked as"} featured`
          );
        },
        onError: () => {
          toast.error("Failed to update featured status");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <Card className='m-4'>
        <CardContent className='p-6'>
          <div className='space-y-4'>
            <Skeleton className='h-8 w-48' />
            <Skeleton className='h-72 w-full' />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='p-4 space-y-4'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Blog Posts</h1>
        <div className='flex gap-2'>
          <Dialog
            open={isAIDialogOpen}
            onOpenChange={setIsAIDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant='outline'>
                <span className='hidden md:block'>AI Blog Generator</span>
                <span className='block md:hidden'>AI</span>
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px]'>
              <DialogHeader>
                <DialogTitle>Generate Blog with AI</DialogTitle>
                <DialogDescription>
                  Enter a topic to generate a blog post using AI.
                </DialogDescription>
              </DialogHeader>
              <div className='flex flex-col gap-4 py-4'>
                <Input
                  placeholder='Enter blog topic'
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
                <Button
                  onClick={fetchAIBlog}
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
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className='mr-2 h-4 w-4' />
                <span className='hidden md:block'>New Blog Post</span>
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[625px]'>
              <DialogHeader>
                <DialogTitle>Create New Blog Post</DialogTitle>
                <DialogDescription>
                  Fill in the blog details below.
                </DialogDescription>
              </DialogHeader>
              <BlogForm
                initialData={
                  aiData as (BlogFormData & { _id?: string }) | undefined
                }
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
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
            <DialogTitle>Edit Blog Post</DialogTitle>
            <DialogDescription>
              Update the blog details below.
            </DialogDescription>
          </DialogHeader>
          <BlogForm
            initialData={
              selectedBlog as (BlogFormData & { _id?: string }) | undefined
            }
            onOpenChange={setIsEditDialogOpen}
            open={isEditDialogOpen}
          />
        </DialogContent>
      </Dialog>

      {/* Blogs Table */}
      <Card>
        <CardContent className='p-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published Date</TableHead>
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
                        <Skeleton className='h-6 w-[100px]' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-6 w-[150px]' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-8 w-8' />
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : blogs?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className='text-center'
                  >
                    No blog posts found
                  </TableCell>
                </TableRow>
              ) : (
                blogs?.map((blog: IBlog) => (
                  <TableRow key={blog._id || blog.slug}>
                    <TableCell className='font-medium'>
                      {blog.title}
                      {blog.featured && (
                        <Badge className='ml-2 bg-amber-500 hover:bg-amber-600'>
                          Featured
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={blog.isPublished ? "default" : "outline"}>
                        {blog.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {blog.publishedAt
                        ? new Date(blog.publishedAt).toLocaleDateString()
                        : "Not published"}
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
                          <DropdownMenuItem onClick={() => handleEdit(blog)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handlePublishToggle(blog)}
                          >
                            {blog.isPublished ? "Unpublish" : "Publish"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toggleFeatured(blog)}
                          >
                            {blog.featured
                              ? "Remove from Featured"
                              : "Mark as Featured"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className='text-red-600'
                            onClick={() => handleDelete(blog._id || "")}
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
