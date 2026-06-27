import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import User from "@/src/models/user";
import Order from "@/src/models/order";

// Valid coupons config
const COUPONS: Record<string, { type: "percent" | "fixed"; value: number; firstOrderOnly?: boolean }> = {
  WELCOME10: { type: "percent", value: 10, firstOrderOnly: true }, // 10% first order discount
  ECOLIFE: { type: "percent", value: 5 },
  SAVE20: { type: "fixed", value: 20 },
};

export async function POST(request: Request) {
  try {
    const { code, userEmail, subtotal } = await request.json();
    if (!code || !userEmail || subtotal == null) {
      return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
    }
    const coupon = COUPONS[code.toUpperCase()];
    if (!coupon) {
      return NextResponse.json({ success: false, message: "Invalid coupon code." });
    }
    await connectDB();
    // Check first order only
    if (coupon.firstOrderOnly) {
      const orderCount = await Order.countDocuments({ userEmail });
      const user = await User.findOne({ email: userEmail.toLowerCase() }).lean() as any;
      if (orderCount > 0 || user?.firstOrderCouponUsed) {
        return NextResponse.json({ success: false, message: "This coupon is for first orders only." });
      }
    }
    let discountAmount = 0;
    if (coupon.type === "percent") {
      discountAmount = Math.round((subtotal * coupon.value) / 100 * 100) / 100;
    } else {
      discountAmount = Math.min(coupon.value, subtotal);
    }
    return NextResponse.json({
      success: true,
      code: code.toUpperCase(),
      type: coupon.type,
      value: coupon.value,
      discountAmount,
      message: coupon.type === "percent"
        ? `${coupon.value}% discount applied!`
        : `$${coupon.value} discount applied!`,
    });
  } catch (error: any) {
    console.error("[POST /api/coupon]", error);
    return NextResponse.json({ success: false, message: "Failed to validate coupon" }, { status: 500 });
  }
}
