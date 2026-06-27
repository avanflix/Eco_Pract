import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import User from "@/src/models/user";

// GET /api/user/cart?userId=xxx  — load cart from DB
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ success: false, message: "userId required" }, { status: 400 });
    }
    await connectDB();
    const user = await User.findById(userId).lean() as any;
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: user.cart || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Failed to load cart" }, { status: 500 });
  }
}

// PUT /api/user/cart  — save cart to DB (full replace)
export async function PUT(request: Request) {
  try {
    const { userId, cart } = await request.json();
    if (!userId) {
      return NextResponse.json({ success: false, message: "userId required" }, { status: 400 });
    }
    await connectDB();
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { cart: cart ?? [] } },
      { new: true }
    ).lean() as any;
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: user.cart });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Failed to save cart" }, { status: 500 });
  }
}