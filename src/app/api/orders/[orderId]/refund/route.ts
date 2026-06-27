import { NextResponse } from "next/server";
import { processRefund } from "@/src/lib/services/orderService";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const { refundAmount, adminEmail } = await request.json();

    // In production: call Stripe API here:
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_US or _IN based on order.region);
    // const refund = await stripe.refunds.create({ payment_intent: order.paymentIntentId, amount: Math.round(refundAmount * 100) });
    // const stripeRefundId = refund.id;

    const stripeRefundId = `ref_${Date.now()}`; // placeholder until Stripe keys are set
    await processRefund(orderId, refundAmount, adminEmail || "admin", stripeRefundId);
    return NextResponse.json({ success: true, refundId: stripeRefundId });
  } catch (error: any) {
    console.error("[POST /api/orders/refund]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
