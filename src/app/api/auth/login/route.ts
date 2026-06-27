import { NextResponse } from "next/server";
import { loginUser } from "@/src/lib/services/userService";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }
    const user = await loginUser(email, password);
    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    if (error.message === "Invalid email or password") {
      return NextResponse.json({ success: false, message: error.message }, { status: 401 });
    }
    console.error("[POST /api/auth/login]", error);
    return NextResponse.json({ success: false, message: "Login failed" }, { status: 500 });
  }
}
