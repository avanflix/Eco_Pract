import { NextResponse } from "next/server";
import { resetPasswordWithToken } from "@/src/lib/services/userService";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();
    if (!token || !password) {
      return NextResponse.json({ success: false, message: "Token and password are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ success: false, message: "Password must be at least 6 characters" }, { status: 400 });
    }
    await resetPasswordWithToken(token, password);
    return NextResponse.json({ success: true, message: "Password reset successfully" });
  } catch (error: any) {
    console.error("[POST /api/auth/reset-password]", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to reset password" }, { status: 400 });
  }
}
