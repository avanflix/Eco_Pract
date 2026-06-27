import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import User from "@/src/models/user";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ success: false, message: "userId required" }, { status: 400 });
    await connectDB();
    const user = await User.findById(userId).lean() as any;
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: user.addresses || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, address } = await request.json();
    if (!userId || !address) return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
    await connectDB();
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    // If this is marked default, unset others
    if (address.isDefault) {
      user.addresses = user.addresses.map((a: any) => ({ ...a.toObject(), isDefault: false }));
    }
    // If first address, make default
    if (user.addresses.length === 0) address.isDefault = true;
    user.addresses.push(address);
    await user.save();
    const added = user.addresses[user.addresses.length - 1];
    return NextResponse.json({ success: true, data: added });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Failed to add address" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId, addressId, address } = await request.json();
    if (!userId || !addressId) return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
    await connectDB();
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    if (address.isDefault) {
      user.addresses = user.addresses.map((a: any) => ({ ...a.toObject(), isDefault: false }));
    }
    const idx = user.addresses.findIndex((a: any) => String(a._id) === addressId);
    if (idx === -1) return NextResponse.json({ success: false, message: "Address not found" }, { status: 404 });
    user.addresses[idx] = { ...user.addresses[idx].toObject(), ...address, _id: user.addresses[idx]._id };
    await user.save();
    return NextResponse.json({ success: true, data: user.addresses[idx] });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Failed to update address" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const addressId = searchParams.get("addressId");
    if (!userId || !addressId) return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
    await connectDB();
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    user.addresses = user.addresses.filter((a: any) => String(a._id) !== addressId);
    await user.save();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Failed to delete address" }, { status: 500 });
  }
}
