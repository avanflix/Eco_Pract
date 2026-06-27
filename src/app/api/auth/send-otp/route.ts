import { NextResponse } from "next/server";
import { createOtpForEmail } from "@/src/lib/services/userService";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    // ── 1. Generate OTP & verify user exists ──────────────────────────────
    let otp: string;
    let name: string;

    try {
      const result = await createOtpForEmail(email);
      otp = result.otp;
      name = result.name;
    } catch (err: any) {
      if (err.message === "No account found with that email address") {
        return NextResponse.json(
          { success: false, message: "No account found with that email address. Please register first." },
          { status: 404 }
        );
      }
      throw err;
    }

    // ── 2. Validate SMTP config ───────────────────────────────────────────
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = Number(process.env.SMTP_PORT) || 587;

    if (!smtpUser || !smtpPass || smtpUser === "your@gmail.com") {
      console.error("[send-otp] SMTP not configured — check SMTP_USER and SMTP_PASS in .env.local");
      return NextResponse.json(
        { success: false, message: "Email service is not configured. Please contact support." },
        { status: 503 }
      );
    }

    // ── 3. Send OTP email ─────────────────────────────────────────────────
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false, // STARTTLS on port 587
      auth: { user: smtpUser, pass: smtpPass },
    });

    // Verify connection before sending
    await transporter.verify();

    const fromAddress = `"EcoPract" <${smtpUser}>`;
    const year = new Date().getFullYear();

    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: `${otp} is your EcoPract verification code`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#faf8f4;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#1c4d35;padding:28px 40px;text-align:center;">
              <span style="font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">🌿 EcoPract</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="font-size:22px;font-weight:700;color:#111827;margin:0 0 12px;">Password Reset OTP</h1>
              <p style="font-size:15px;color:#6b7280;line-height:1.7;margin:0 0 28px;">
                Hi <strong style="color:#111827;">${name}</strong>, we received a request to reset your EcoPract password.
                Use the code below — it's valid for <strong>10 minutes</strong>.
              </p>

              <!-- OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center" style="background:#ffffff;border:2px dashed #1c4d35;border-radius:16px;padding:28px 20px;">
                    <p style="font-size:12px;color:#9ca3af;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 10px;">Your one-time code</p>
                    <p style="font-size:52px;font-weight:800;letter-spacing:14px;color:#1c4d35;margin:0;font-family:'Courier New',monospace;">${otp}</p>
                  </td>
                </tr>
              </table>

              <p style="font-size:13px;color:#9ca3af;line-height:1.6;margin:0;">
                If you didn't request a password reset, you can safely ignore this email. Your account remains secure.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #e8e2d8;padding:20px 40px;text-align:center;">
              <p style="font-size:12px;color:#9ca3af;margin:0;">© ${year} EcoPract. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
      text: `Your EcoPract password reset OTP is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, ignore this email.`,
    });

    return NextResponse.json({ success: true, message: "OTP sent to your email" });

  } catch (error: any) {
    console.error("[POST /api/auth/send-otp]", error?.code, error?.message);

    // Specific Gmail auth error
    if (error?.code === "EAUTH") {
      return NextResponse.json(
        { success: false, message: "Email service authentication failed. Please contact support." },
        { status: 503 }
      );
    }
    if (error?.code === "ECONNECTION" || error?.code === "ETIMEDOUT") {
      return NextResponse.json(
        { success: false, message: "Could not connect to email server. Please try again." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}
