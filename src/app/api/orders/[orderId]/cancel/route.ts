import { NextResponse } from "next/server";
import { cancelOrder } from "@/src/lib/services/orderService";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const { reason, adminEmail } = await request.json();
    const result = await cancelOrder(orderId, reason || "Cancelled", adminEmail || "customer");
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("[POST /api/orders/cancel]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
