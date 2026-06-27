import "server-only";
import { connectDB } from "@/src/lib/mongodb";
import Order from "@/src/models/order";
import User from "@/src/models/user";
import type { CartItem } from "@/src/app/context/CartContext";

interface CreateOrderParams {
  userEmail: string;
  userName: string;
  userId: string | null;
  items: CartItem[];
  subtotal: number;
  discountCode?: string;
  discountAmount?: number;
  taxRate?: number;
  taxAmount?: number;
  total: number;
  shippingAddress?: object;
  paymentMethod?: "stripe" | "cod";
  region?: "IN" | "US";
}

export async function createOrder(params: CreateOrderParams) {
  await connectDB();
  const {
    userEmail, userName, userId, items,
    subtotal, discountCode, discountAmount = 0,
    taxRate = 0, taxAmount = 0, total,
    shippingAddress, paymentMethod = "stripe", region = "US",
  } = params;

  const orderId = `EP-${Date.now()}`;
  const deliveryDays = 5;
  const estimatedDelivery = new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000)
    .toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const order = await Order.create({
    orderId, userEmail, userName,
    ...(userId ? { userId } : {}),
    items: items.map((i) => ({
      name: i.name, slug: i.slug, image: i.image, tier: i.tier,
      pricePerPlate: i.pricePerPlate, pricePerPack: i.pricePerPack,
      packSize: i.packSize, quantity: i.quantity,
    })),
    subtotal: subtotal ?? total,
    discountCode: discountCode || null,
    discountAmount,
    taxRate,
    taxAmount,
    total,
    paymentMethod,
    region,
    status: "Processing",
    estimatedDelivery,
    shippingAddress: shippingAddress || null,
    statusHistory: [{ fromStatus: null, toStatus: "Processing", changedBy: "system" }],
  });

  // Mark first order coupon used if applicable
  if (discountCode === "WELCOME10" && userId) {
    await User.findByIdAndUpdate(userId, { firstOrderCouponUsed: true, hasPlacedOrder: true });
  } else if (userId) {
    await User.findByIdAndUpdate(userId, { hasPlacedOrder: true });
  }

  return {
    id: order.orderId,
    date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    estimatedDelivery,
    status: order.status,
    subtotal, discountCode, discountAmount, taxRate, taxAmount, total,
    items,
    shippingAddress,
    paymentMethod,
    cancellationReason: null,
  };
}

export async function getOrdersByUser(userEmail: string) {
  await connectDB();
  const orders = await Order.find({ userEmail }).sort({ createdAt: -1 }).lean().exec();
  return orders.map((o: any) => ({
    id: o.orderId,
    date: new Date(o.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    estimatedDelivery: o.estimatedDelivery,
    status: o.status,
    subtotal: o.subtotal ?? o.total,
    discountCode: o.discountCode || null,
    discountAmount: o.discountAmount || 0,
    taxRate: o.taxRate || 0,
    taxAmount: o.taxAmount || 0,
    total: o.total,
    items: o.items,
    shippingAddress: o.shippingAddress || null,
    paymentMethod: o.paymentMethod || "stripe",
    cancellationReason: o.cancellationReason || null,
    paymentStatus: o.paymentStatus,
  }));
}

export async function getAllOrders() {
  await connectDB();
  const orders = await Order.find({}).sort({ createdAt: -1 }).lean().exec();
  return orders.map((o: any) => ({
    _id: String(o._id),
    id: o.orderId,
    userEmail: o.userEmail,
    userName: o.userName,
    date: new Date(o.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    estimatedDelivery: o.estimatedDelivery,
    status: o.status,
    paymentStatus: o.paymentStatus,
    subtotal: o.subtotal ?? o.total,
    discountAmount: o.discountAmount || 0,
    taxAmount: o.taxAmount || 0,
    total: o.total,
    items: o.items,
    cancellationReason: o.cancellationReason || null,
    cancelledAt: o.cancelledAt || null,
    cancelledBy: o.cancelledBy || null,
    stripeRefundId: o.stripeRefundId || null,
    refundAmount: o.refundAmount || null,
    refundedAt: o.refundedAt || null,
    region: o.region || "US",
    paymentMethod: o.paymentMethod || "stripe",
    statusHistory: o.statusHistory || [],
    shippingAddress: o.shippingAddress || null,
    paymentIntentId: o.paymentIntentId || null,
    createdAt: o.createdAt,
  }));
}

export async function updateOrderStatus(orderId: string, newStatus: string, adminEmail: string, note?: string) {
  await connectDB();
  const order = await Order.findOne({ orderId });
  if (!order) throw new Error("Order not found");
  const fromStatus = order.status;
  order.status = newStatus;
  order.statusHistory.push({ fromStatus, toStatus: newStatus, changedBy: adminEmail, note: note || "" });
  await order.save();
  return { success: true };
}

export async function cancelOrder(orderId: string, reason: string, adminEmail: string) {
  await connectDB();
  const order = await Order.findOne({ orderId });
  if (!order) throw new Error("Order not found");
  if (["Cancelled", "Refunded", "Delivered"].includes(order.status)) {
    throw new Error("Cannot cancel this order");
  }
  const fromStatus = order.status;
  order.status = "Cancelled";
  order.cancellationReason = reason;
  order.cancelledAt = new Date();
  order.cancelledBy = adminEmail;
  order.statusHistory.push({ fromStatus, toStatus: "Cancelled", changedBy: adminEmail, note: reason });
  await order.save();
  return { success: true, paymentStatus: order.paymentStatus, paymentIntentId: order.paymentIntentId };
}

export async function processRefund(orderId: string, refundAmount: number, adminEmail: string, stripeRefundId?: string) {
  await connectDB();
  const order = await Order.findOne({ orderId });
  if (!order) throw new Error("Order not found");
  order.paymentStatus = "refunded";
  order.status = "Refunded";
  order.stripeRefundId = stripeRefundId || `ref_manual_${Date.now()}`;
  order.refundAmount = refundAmount;
  order.refundedAt = new Date();
  order.statusHistory.push({ fromStatus: order.status, toStatus: "Refunded", changedBy: adminEmail, note: `Refund of $${refundAmount} processed` });
  await order.save();
  return { success: true };
}
