import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import Contact from "@/src/models/contact";

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: "Name, email and message are required" },
        { status: 400 }
      );
    }

    await connectDB();
    await Contact.create({ name, email, subject, message });

    return NextResponse.json({ success: true, message: "Message received" });
  } catch (error: any) {
    console.error("[POST /api/contact]", error);
    return NextResponse.json({ success: false, message: "Failed to send message" }, { status: 500 });
  }
}
