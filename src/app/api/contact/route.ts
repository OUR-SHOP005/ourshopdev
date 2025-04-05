import { NextResponse } from "next/server";
import { Contact } from "@/lib/models";
import connectDB from "@/lib/db";
import { Resend } from "resend";
import { z } from "zod";
import { ContactSchema } from "@/lib/types";
// import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
// import AdminMail from "@/components/AdminMail";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const contactData = await request.json();

    console.log(contactData);

    const validatedData = ContactSchema.parse(contactData);

    await connectDB();
    const contact = await Contact.create(validatedData);

    // Send email notification
    const fromEmail = `OurShop <${
      process.env.FROM_OUR_EMAIL || "hello@utkarshchaudhary.space"
    }>`;
    const toEmail =
      process.env.RECIPIENT_EMAIL || "ourshop005@gmail.com";

    // Validate the 'from' email address
    if (!fromEmail || !fromEmail.includes("@")) {
      console.error("Invalid 'from' email address");
      return NextResponse.json(
        { message: "Failed to send message: Invalid 'from' email address" },
        { status: 400 }
      );
    }

    // const { data, error } = await resend.emails.send({
    //   from: fromEmail,
    //   to: toEmail,
    //   subject: `New Contact: ${body.subject}`,
    //   text: `New message from ${body.name} (${body.email}): ${body.message}`,
    //   react: AdminMail({
    //     name: body.name,
    //     email: body.email,
    //     subject: body.subject,
    //     message: body.message,
    //   }),
    // });
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `New Contact: ${contactData.subject}`,
      text: `New message from ${contactData.name} (${contactData.email}): ${contactData.message}`,
      html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>From:</strong> ${contactData.name} (${contactData.email})</p>
      <p><strong>Subject:</strong> ${contactData.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${contactData.message}</p>
  `,
    });

    if (error) {
      console.error("Failed to send email:", error);
      return NextResponse.json(
        { message: `Failed to send email: ${error.message}` },
        { status: 500 }
      );
    }
    console.log("email sucess", data);

    revalidatePath("/admin/inbox");

    return NextResponse.json(
      {
        message: "Message sent successfully",
        contactId: contact._id,
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation Error", errors: err.errors },
        { status: 400 }
      );
    }
    console.error("Contact Error:", err);
    return NextResponse.json(
      { message: "Failed to send message" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || false;
    console.log(`status At Api: ${status}`);
    await connectDB();

    let query = {};
    if (status && ["unread", "read", "replied"].includes(status)) {
      query = { status };
    }

    const messages = await Contact.find(query).sort({ createdAt: -1 });

    console.log(`Messages At Api:`, messages);
    if (!messages.length) {
      return NextResponse.json(messages, { status: 200 });
    }

    return NextResponse.json(messages);
  } catch (err) {
    console.error("Get Messages Error:", err);
    return NextResponse.json(
      { message: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Contact ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const deletedContact = await Contact.findByIdAndDelete(id);

    if (!deletedContact) {
      return NextResponse.json(
        { message: "Contact not found" },
        { status: 404 }
      );
    }

    revalidatePath("/admin/inbox");
    return NextResponse.json(
      { message: "Contact deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Delete Contact Error:", err);
    return NextResponse.json(
      { message: "Failed to delete contact" },
      { status: 500 }
    );
  }
}
