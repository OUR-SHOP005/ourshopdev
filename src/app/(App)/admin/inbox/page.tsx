"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { useContacts } from "@/lib/api/services/contactService";
import { ClerkLoaded, ClerkLoading, useAuth } from "@clerk/nextjs";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactDetailsModal } from "./contact-details-modal";
import { ReplyModal } from "./reply-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

export default function InboxPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const router = useRouter();
  const { isLoaded } = useAuth();

  const { data: contacts, isLoading } = useContacts(
    statusFilter !== "all"
      ? { status: statusFilter as "unread" | "read" | "replied" }
      : {}
  );


  useEffect(() => {console.log(statusFilter)},[statusFilter])
  
  useEffect(() => {
    // Event listeners for modal triggers
    const handleViewDetails = (e: CustomEvent) => {
      setSelectedContact(e.detail.contact);
      setIsDetailsModalOpen(true);
    };

    const handleReply = (e: CustomEvent) => {
      setSelectedContact(e.detail.contact);
      setIsReplyModalOpen(true);
    };

    document.addEventListener(
      "view-contact-details",
      handleViewDetails as EventListener
    );
    document.addEventListener("reply-to-contact", handleReply as EventListener);

    return () => {
      document.removeEventListener(
        "view-contact-details",
        handleViewDetails as EventListener
      );
      document.removeEventListener(
        "reply-to-contact",
        handleReply as EventListener
      );
    };
  }, [isLoaded, router]);

  return (
    <>
      <ClerkLoading>
        <div className='container py-10'>
          <div className='space-y-6'>
            <Skeleton className='h-8 w-32 md:h-10 md:w-48' />

            <div className='mb-6'>
              <div className='flex space-x-1 md:space-x-2'>
                <Skeleton className='h-8 w-16 md:w-20 rounded-md' />
                <Skeleton className='h-8 w-16 md:w-20 rounded-md' />
                <Skeleton className='h-8 w-16 md:w-20 rounded-md' />
                <Skeleton className='h-8 w-16 md:w-20 rounded-md' />
              </div>
            </div>

            <div className='rounded-md border'>
              <div className='border-b p-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <Skeleton className='h-4 w-24 md:w-32' />
                  </div>
                  <Skeleton className='h-8 w-32 md:w-40' />
                </div>
              </div>

              <div className='divide-y'>
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className='p-4'
                  >
                    <div className='grid grid-cols-1 md:grid-cols-5 gap-4 items-center'>
                      <Skeleton className='h-5 w-24 md:w-32' />
                      <Skeleton className='h-5 w-32 md:w-48 md:col-span-2' />
                      <div className='flex items-center'>
                        <Skeleton className='h-5 w-16' />
                      </div>
                      <div className='flex items-center justify-between'>
                        <Skeleton className='h-5 w-24 md:w-32' />
                        <Skeleton className='h-8 w-8 rounded-md' />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className='p-4 border-t'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <Skeleton className='h-8 w-8 rounded-md' />
                    <Skeleton className='h-8 w-8 rounded-md' />
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-8 w-20 rounded-md' />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ClerkLoading>

      <ClerkLoaded>
        <div className='container py-10'>
          <h1 className='text-2xl font-bold mb-6'>Inbox</h1>

          <Tabs
            defaultValue='all'
            onValueChange={setStatusFilter}
            className='mb-6'
          >
            <TabsList>
              <TabsTrigger value='all'>All</TabsTrigger>
              <TabsTrigger value='unread'>Unread</TabsTrigger>
              <TabsTrigger value='read'>Read</TabsTrigger>
              <TabsTrigger value='replied'>Replied</TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className='rounded-md border'>
              <div className='border-b p-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <Skeleton className='h-4 w-24 md:w-32' />
                  </div>
                  <Skeleton className='h-8 w-32 md:w-40' />
                </div>
              </div>

              <div className='divide-y'>
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className='p-4'
                  >
                    <div className='grid grid-cols-1 md:grid-cols-5 gap-4 items-center'>
                      <Skeleton className='h-5 w-24 md:w-32' />
                      <Skeleton className='h-5 w-32 md:w-48 md:col-span-2' />
                      <div className='flex items-center'>
                        <Skeleton className='h-5 w-16' />
                      </div>
                      <div className='flex items-center justify-between'>
                        <Skeleton className='h-5 w-24 md:w-32' />
                        <Skeleton className='h-8 w-8 rounded-md' />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className='p-4 border-t'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <Skeleton className='h-8 w-8 rounded-md' />
                    <Skeleton className='h-8 w-8 rounded-md' />
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-8 w-20 rounded-md' />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={contacts || []}
            />
          )}

          {selectedContact && (
            <>
              <ContactDetailsModal
                open={isDetailsModalOpen}
                onOpenChange={setIsDetailsModalOpen}
                contact={selectedContact}
              />

              <ReplyModal
                open={isReplyModalOpen}
                onOpenChange={setIsReplyModalOpen}
                contact={selectedContact}
              />
            </>
          )}
        </div>
      </ClerkLoaded>
    </>
  );
}
