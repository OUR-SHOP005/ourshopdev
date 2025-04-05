import { ColumnDef } from "@tanstack/react-table";
import { IContact } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { toast } from "sonner";

export const columns: ColumnDef<IContact>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Name'
      />
    ),
  },
  {
    accessorKey: "subject",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Subject'
      />
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Status'
      />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      return (
        <Badge
          variant={
            status === "unread"
              ? "destructive"
              : status === "read"
              ? "outline"
              : "default"
          }
        >
          {status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Date'
      />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <div>{format(date, "MMM dd, yyyy HH:mm")}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const contact = row.original;

      const handleDelete = async () => {
        try {
          const response = await fetch(`/api/contact?id=${contact._id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete contact");
          }

          toast.success("Contact deleted successfully");
          // Trigger a refresh of the table
          window.location.reload();
        } catch (error) {
          toast.error("Failed to delete contact");
          console.error("Delete error:", error);
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              className='h-8 w-8 p-0'
            >
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem
              onClick={() => {
                // Open view details modal
                document.dispatchEvent(
                  new CustomEvent("view-contact-details", {
                    detail: { contact },
                  })
                );
              }}
            >
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                // Open reply modal
                document.dispatchEvent(
                  new CustomEvent("reply-to-contact", {
                    detail: { contact },
                  })
                );
              }}
            >
              {contact.status === "replied" ? "View Reply" : "Reply"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className='text-red-600 focus:text-red-600'
            >
              <Trash2 className='mr-2 h-4 w-4' />
              
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
