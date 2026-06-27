import { NextResponse } from "next/server";
import { verifyOtpAndGetResetToken } from "@/src/lib/services/userService";

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();
    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const resetToken = await verifyOtpAndGetResetToken(email, otp);
    return NextResponse.json({ success: true, resetToken });
  } catch (error: any) {
    console.error("[POST /api/auth/verify-otp]", error);
    if (error.message === "Invalid or expired OTP") {
      return NextResponse.json(
        { success: false, message: "Invalid or expired OTP. Please try again." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
