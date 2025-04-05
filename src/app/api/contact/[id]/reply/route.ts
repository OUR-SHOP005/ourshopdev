import { NextResponse } from "next/server";
import { Contact } from "@/lib/models";
import connectDB from "@/lib/db";
import { z } from "zod";
import { Resend } from "resend";
import { revalidatePath } from "next/cache";
import usersMail from "@/components/Mail/usersMail";
const resend = new Resend(process.env.RESEND_API_KEY);

// Reply schema
const ReplySchema = z.object({
  message: z.string().min(10, "Reply must be at least 10 characters"),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const contactId = (await params).id;
    const body = await request.json();

    // Validate the reply message
    const { message } = ReplySchema.parse(body);

    await connectDB();

    // Find the contact message
    const contact = await Contact.findById(contactId);

    if (!contact) {
      return NextResponse.json(
        { message: "Contact message not found" },
        { status: 404 }
      );
    }

    // Update the contact status to replied
    contact.status = "replied";
    await contact.save();
    const html = usersMail(contact.name, message);
    console.log(html);
    // Send the reply email
    await resend.emails.send({
      from: `OurShop <${
        process.env.FROM_REPLY_EMAIL || "reply@utkarshchaudhary.space"
      }>`,
      to: contact.email,
      subject: `Re: ${contact.subject}`,
      html: html,
    });

    revalidatePath("/admin/inbox");

    return NextResponse.json({
      message: "Reply sent successfully",
      contact,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation Error", errors: err.errors },
        { status: 400 }
      );
    }

    console.error("Reply Error:", err);
    return NextResponse.json(
      { message: "Failed to send reply" },
      { status: 500 }
    );
  }
}
