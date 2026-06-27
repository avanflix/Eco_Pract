import { NextResponse } from "next/server";
import { createOrder, getOrdersByUser, getAllOrders } from "@/src/lib/services/orderService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const admin = searchParams.get("admin");
    if (admin === "true") {
      const orders = await getAllOrders();
      return NextResponse.json({ success: true, data: orders });
    }
    if (!email) {
      return NextResponse.json({ success: false, message: "email is required" }, { status: 400 });
    }
    const orders = await getOrdersByUser(email);
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    console.error("[GET /api/orders]", error);
    return NextResponse.json({ success: false, message: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userEmail, userName, userId, items,
      subtotal, discountCode, discountAmount,
      taxRate, taxAmount, total,
      shippingAddress, paymentMethod, region,
    } = body;

    if (!userEmail || !userName || !items?.length || total == null) {
      return NextResponse.json(
        { success: false, message: "Missing required order fields" },
        { status: 400 }
      );
    }

    const order = await createOrder({
      userEmail, userName, userId: userId ?? null,
      items, subtotal, discountCode, discountAmount,
      taxRate, taxAmount, total,
      shippingAddress, paymentMethod: paymentMethod || "stripe",
      region: region || "US",
    });

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    console.error("[POST /api/orders]", error);
    return NextResponse.json({ success: false, message: "Failed to place order" }, { status: 500 });
  }
}
