import { NextResponse } from "next/server";
import { Contact } from "@/lib/models";
import connectDB from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data = await params;
    const id = data.id;

    await connectDB();

    const contact = await Contact.findById(id);

    if (!contact) {
      return NextResponse.json(
        { message: "Contact message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(contact);
  } catch (err) {
    console.error("Get Contact Detail Error:", err);
    return NextResponse.json(
      { message: "Failed to fetch contact details" },
      { status: 500 }
    );
  }
}
