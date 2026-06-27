import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import Pincode from "@/src/models/pincode";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    if (!code) {
      return NextResponse.json({ success: false, message: "Pincode is required" }, { status: 400 });
    }
    await connectDB();
    const pincode = await Pincode.findOne({ pincode: code.trim() }).lean() as any;
    if (!pincode) {
      return NextResponse.json({
        success: false,
        deliverable: false,
        message: "We don't deliver to this zip code yet.",
      });
    }
    if (!pincode.isDeliverable) {
      return NextResponse.json({
        success: true,
        deliverable: false,
        message: `Sorry, we don't deliver to ${pincode.city}, ${pincode.state} at this time.`,
        city: pincode.city,
        state: pincode.state,
      });
    }
    return NextResponse.json({
      success: true,
      deliverable: true,
      city: pincode.city,
      state: pincode.state,
      zone: pincode.zone,
      deliveryDays: pincode.deliveryDays,
      salesTaxRate: pincode.salesTaxRate,
      message: `Delivery available to ${pincode.city}, ${pincode.state} in ${pincode.deliveryDays} business days.`,
    });
  } catch (error: any) {
    console.error("[GET /api/pincode]", error);
    return NextResponse.json({ success: false, message: "Failed to check pincode" }, { status: 500 });
  }
}
