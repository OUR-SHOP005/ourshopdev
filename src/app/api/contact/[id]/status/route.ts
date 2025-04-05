import { NextResponse } from "next/server";
import { Contact } from "@/lib/models";
import connectDB from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Status update schema
const StatusUpdateSchema = z.object({
  status: z.enum(["unread", "read", "replied"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ensure params.id is processed correctly
    const contactId = (await params).id;

    const body = await request.json();

    // Validate the status value
    const { status } = StatusUpdateSchema.parse(body);

    await connectDB();

    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      { status },
      { new: true }
    );

    if (!updatedContact) {
      return NextResponse.json(
        { message: "Contact message not found" },
        { status: 404 }
      );
    }

    revalidatePath("/admin/inbox");

    return NextResponse.json(updatedContact);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation Error", errors: err.errors },
        { status: 400 }
      );
    }

    console.error("Update Contact Status Error:", err);
    return NextResponse.json(
      { message: "Failed to update contact status" },
      { status: 500 }
    );
  }
}
