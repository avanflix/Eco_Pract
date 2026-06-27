import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    image: { type: String, required: true },
    tier: {
      type: String,
      enum: ["normal", "bulk1000", "bulk5000", "premium"],
      required: true,
    },
    pricePerPlate: { type: Number, required: true },
    pricePerPack: { type: Number, required: true },
    packSize: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const StatusHistorySchema = new mongoose.Schema(
  {
    fromStatus: { type: String },
    toStatus: { type: String, required: true },
    changedBy: { type: String },
    note: { type: String },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    discountCode: { type: String },
    discountAmount: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, required: true },

    // Payment
    paymentMethod: {
      type: String,
      enum: ["stripe", "cod"],
      default: "stripe",
    },
    paymentIntentId: String,
    checkoutSessionId: String,
    stripeRefundId: String,
    refundAmount: Number,
    refundedAt: Date,
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded", "failed"],
      default: "pending",
    },

    status: {
      type: String,
      enum: ["Processing", "Confirmed", "Shipped", "Delivered", "Cancelled", "Refunded"],
      default: "Processing",
    },

    region: { type: String, enum: ["IN", "US"], default: "US" },

    cancellationReason: String,
    cancelledAt: Date,
    cancelledBy: String,

    statusHistory: { type: [StatusHistorySchema], default: [] },
    estimatedDelivery: String,

    shippingAddress: {
      fullName: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: "US" },
      phone: String,
    },
  },
  { timestamps: true, collection: "orders" }
);

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
export default Order;
