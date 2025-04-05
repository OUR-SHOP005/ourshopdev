"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  MoreHorizontal,
  Shield,
  Ban,
  User,
  Search,
  FilterX,
} from "lucide-react";
import { UserData } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [adminFilter, setAdminFilter] = useState<boolean | null>(null);
  const [bannedFilter, setBannedFilter] = useState<boolean | null>(null);
  const [processingUser, setProcessingUser] = useState<string | null>(null);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);

      let url = `/api/users?page=${page}&pageSize=${pageSize}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (adminFilter !== null) url += `&isAdmin=${adminFilter}`;
      if (bannedFilter !== null) url += `&isBanned=${bannedFilter}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.users);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Initialize with first page
  useEffect(() => {
    fetchUsers();
  }, [page, search, adminFilter, bannedFilter]);

  // Handle search
  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle user update
  const updateUser = async (
    clerkId: string,
    updates: { is_admin?: boolean; is_banned?: boolean }
  ) => {
    try {
      setProcessingUser(clerkId);

      const response = await fetch(`/api/users/${clerkId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update user");
      }

      // Update local state
      setUsers((prev) =>
        prev.map((user) => {
          if (user.clerk_id === clerkId) {
            return { ...user, ...updates };
          }
          return user;
        })
      );

      toast.success("User updated successfully");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unknown error occurred";
      toast.error(message);
    } finally {
      setProcessingUser(null);
    }
  };

  // Handle admin toggle
  const toggleAdmin = (user: UserData) => {
    updateUser(user.clerk_id, { is_admin: !user.is_admin });
  };

  // Handle ban toggle
  const toggleBan = (user: UserData) => {
    updateUser(user.clerk_id, { is_banned: !user.is_banned });
  };

  // Reset filters
  const resetFilters = () => {
    setSearch("");
    setSearchInput("");
    setAdminFilter(null);
    setBannedFilter(null);
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
        <h1 className='text-3xl font-bold tracking-tight'>User Management</h1>
        <Button
          variant='outline'
          size='sm'
          onClick={resetFilters}
          disabled={!search && adminFilter === null && bannedFilter === null}
          className='flex items-center gap-1'
        >
          <FilterX className='h-4 w-4' />
          Reset Filters
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Manage user roles and access</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and filters */}
          <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center justify-between'>
            <div className='flex sm:w-[300px] items-center gap-2'>
              <Input
                placeholder='Search users...'
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button
                variant='outline'
                size='icon'
                onClick={handleSearch}
              >
                <Search className='h-4 w-4' />
              </Button>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                variant={adminFilter === true ? "default" : "outline"}
                size='sm'
                onClick={() =>
                  setAdminFilter((prev) => (prev === true ? null : true))
                }
                className='flex items-center gap-1'
              >
                <Shield className='h-4 w-4' />
                Admins
              </Button>
              <Button
                variant={bannedFilter === true ? "destructive" : "outline"}
                size='sm'
                onClick={() =>
                  setBannedFilter((prev) => (prev === true ? null : true))
                }
                className='flex items-center gap-1'
              >
                <Ban className='h-4 w-4' />
                Banned
              </Button>
              <Button
                variant={adminFilter === false ? "secondary" : "outline"}
                size='sm'
                onClick={() =>
                  setAdminFilter((prev) => (prev === false ? null : false))
                }
                className='flex items-center gap-1'
              >
                <User className='h-4 w-4' />
                Regular
              </Button>
            </div>
          </div>

          {/* Users table */}
          {loading ? (
            <div className='flex justify-center items-center h-64'>
              <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
            </div>
          ) : error ? (
            <div className='text-center text-destructive p-6'>{error}</div>
          ) : users.length === 0 ? (
            <div className='text-center text-muted-foreground p-6'>
              No users found. Try adjusting your filters.
            </div>
          ) : (
            <>
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.clerk_id}>
                        <TableCell>
                          <div className='flex items-center gap-3'>
                            {user.profile_image_url && (
                              <Avatar>
                                <AvatarImage src={user.profile_image_url} />
                                <AvatarFallback>
                                  {user.first_name?.charAt(0) ||
                                    user.last_name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div>
                              <p className='font-medium'>{`${
                                user.first_name || ""
                              } ${user.last_name || ""}`}</p>
                              <p className='text-xs text-muted-foreground'>
                                {user.clerk_id}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <div className='flex flex-wrap gap-1'>
                            {user.is_admin && (
                              <Badge className='bg-primary/90'>Admin</Badge>
                            )}
                            {user.is_banned && (
                              <Badge variant='destructive'>Banned</Badge>
                            )}
                            {!user.is_admin && !user.is_banned && (
                              <Badge variant='outline'>Regular User</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className='text-right'>
                          {processingUser === user.clerk_id ? (
                            <Loader2 className='ml-auto h-4 w-4 animate-spin' />
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                >
                                  <MoreHorizontal className='h-4 w-4' />
                                  <span className='sr-only'>Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                <DropdownMenuItem
                                  onClick={() => toggleAdmin(user)}
                                >
                                  {user.is_admin ? (
                                    <>
                                      <User className='mr-2 h-4 w-4' />
                                      Remove Admin
                                    </>
                                  ) : (
                                    <>
                                      <Shield className='mr-2 h-4 w-4' />
                                      Make Admin
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => toggleBan(user)}
                                  className={
                                    user.is_banned
                                      ? "text-green-600"
                                      : "text-destructive"
                                  }
                                >
                                  {user.is_banned ? (
                                    <>
                                      <User className='mr-2 h-4 w-4' />
                                      Unban User
                                    </>
                                  ) : (
                                    <>
                                      <Ban className='mr-2 h-4 w-4' />
                                      Ban User
                                    </>
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination className='mt-6'>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(Math.max(1, page - 1))}
                      />
                    </PaginationItem>

                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      // Only show pages close to current page
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= page - 1 && pageNum <= page + 1)
                      ) {
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              isActive={pageNum === page}
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      // Show ellipsis for skipped pages
                      if (
                        (pageNum === 2 && page > 3) ||
                        (pageNum === totalPages - 1 && page < totalPages - 2)
                      ) {
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          handlePageChange(Math.min(totalPages, page + 1))
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
