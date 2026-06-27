import { NextResponse } from "next/server";
import { getUserById, updateUserProfile, changePassword } from "@/src/lib/services/userService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "id is required" }, { status: 400 });
    const user = await getUserById(id);
    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, name, phone, address } = await request.json();
    if (!id) return NextResponse.json({ success: false, message: "id is required" }, { status: 400 });
    const user = await updateUserProfile(id, { name, phone, address });
    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
