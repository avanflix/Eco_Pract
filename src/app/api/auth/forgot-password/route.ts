import { NextResponse } from "next/server";
import { createPasswordResetToken } from "@/src/lib/services/userService";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    const token = await createPasswordResetToken(email);
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;

    // Send email via nodemailer
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"EcoPract" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: "Reset your EcoPract password",
      html: `
        <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #faf8f4; border-radius: 24px;">
          <h1 style="font-family: Georgia, serif; font-size: 28px; color: #1c4d35; margin-bottom: 8px;">Reset your password</h1>
          <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin-bottom: 28px;">
            We received a request to reset the password for your EcoPract account. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
          </p>
          <a href="${resetUrl}" style="display: inline-block; background: #1c4d35; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 999px; font-size: 15px; font-weight: 600; margin-bottom: 28px;">
            Reset Password
          </a>
          <p style="color: #9ca3af; font-size: 13px; line-height: 1.6;">
            If you didn't request a password reset, you can safely ignore this email — your password won't change.<br><br>
            Or copy this link into your browser:<br>
            <a href="${resetUrl}" style="color: #1c4d35; word-break: break-all;">${resetUrl}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #e8e2d8; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">© ${new Date().getFullYear()} EcoPract. All rights reserved.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "Reset link sent to your email" });
  } catch (error: any) {
    console.error("[POST /api/auth/forgot-password]", error);
    if (error.message === "No account found with that email address") {
      return NextResponse.json(
        { success: false, message: "No account found with that email address. Please register first." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: false, message: "Failed to send reset email. Try again." }, { status: 500 });
  }
}
