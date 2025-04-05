"use client";

import { useState, useEffect } from "react";
import { IContact } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Copy, Check, User, Mail, FileText, Calendar } from "lucide-react";
import { useUpdateContactStatus } from "@/lib/api/services/contactService";
import { toast } from "sonner";

interface ContactDetailsModalProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  contact: IContact;
}

export function ContactDetailsModal({
  open,
  onOpenChange,
  contact,
}: ContactDetailsModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { mutate: updateStatus } = useUpdateContactStatus(contact._id as string);

  // Move status update logic into useEffect
  useEffect(() => {
    // Update status to read when opened if status is unread
    if (open && contact.status === "unread") {
      updateStatus({ status: "read" });
    }
  }, [open, contact.status, updateStatus, contact._id]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success(`${fieldName} copied to clipboard!`);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Contact Message Details</DialogTitle>
          <DialogDescription>
            Received on {format(new Date(contact.createdAt), "PPP 'at' p")}
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          <Card>
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <User className='h-4 w-4 text-muted-foreground' />
                  <CardTitle className='text-sm font-medium'>Name</CardTitle>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => copyToClipboard(contact.name, "Name")}
                >
                  {copiedField === "Name" ? (
                    <Check className='h-4 w-4' />
                  ) : (
                    <Copy className='h-4 w-4' />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className='pt-0'>
              <p>{contact.name}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Mail className='h-4 w-4 text-muted-foreground' />
                  <CardTitle className='text-sm font-medium'>Email</CardTitle>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => copyToClipboard(contact.email, "Email")}
                >
                  {copiedField === "Email" ? (
                    <Check className='h-4 w-4' />
                  ) : (
                    <Copy className='h-4 w-4' />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className='pt-0'>
              <p>{contact.email}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <FileText className='h-4 w-4 text-muted-foreground' />
                  <CardTitle className='text-sm font-medium'>Subject</CardTitle>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => copyToClipboard(contact.subject, "Subject")}
                >
                  {copiedField === "Subject" ? (
                    <Check className='h-4 w-4' />
                  ) : (
                    <Copy className='h-4 w-4' />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className='pt-0'>
              <p>{contact.subject}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4 text-muted-foreground' />
                  <CardTitle className='text-sm font-medium'>Message</CardTitle>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => copyToClipboard(contact.message, "Message")}
                >
                  {copiedField === "Message" ? (
                    <Check className='h-4 w-4' />
                  ) : (
                    <Copy className='h-4 w-4' />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className='pt-0'>
              <p className='whitespace-pre-wrap'>{contact.message}</p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
