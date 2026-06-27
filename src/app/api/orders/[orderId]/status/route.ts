import { NextResponse } from "next/server";
import { updateOrderStatus } from "@/src/lib/services/orderService";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const { status, adminEmail, note } = await request.json();
    const allowed = ["Processing", "Confirmed", "Shipped", "Delivered"];
    if (!allowed.includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 });
    }
    await updateOrderStatus(orderId, status, adminEmail || "admin", note);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[PATCH /api/orders/status]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
