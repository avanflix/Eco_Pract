import { NextResponse } from "next/server";
import { validateResetToken } from "@/src/lib/services/userService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    if (!token) {
      return NextResponse.json({ success: false, valid: false });
    }
    const valid = await validateResetToken(token);
    return NextResponse.json({ success: true, valid });
  } catch (error: any) {
    console.error("[GET /api/auth/validate-reset-token]", error);
    return NextResponse.json({ success: false, valid: false });
  }
}
