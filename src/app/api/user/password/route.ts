import { NextResponse } from "next/server";
import { changePassword } from "@/src/lib/services/userService";

export async function POST(request: Request) {
  try {
    const { id, currentPassword, newPassword } = await request.json();
    if (!id || !currentPassword || !newPassword) {
      return NextResponse.json({ success: false, message: "All fields required" }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, message: "Password must be at least 6 characters" }, { status: 400 });
    }
    await changePassword(id, currentPassword, newPassword);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
