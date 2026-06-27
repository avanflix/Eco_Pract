import { NextResponse } from "next/server";
import { registerUser } from "@/src/lib/services/userService";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email and password are required" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const user = await registerUser(name, email, password);
    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    if (error.message === "Email already registered") {
      return NextResponse.json({ success: false, message: error.message }, { status: 409 });
    }
    console.error("[POST /api/auth/register]", error);
    return NextResponse.json({ success: false, message: "Registration failed" }, { status: 500 });
  }
}
