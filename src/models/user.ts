import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Home" },
    fullName: { type: String },
    line1: { type: String },
    line2: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    country: { type: String, default: "US" },
    phone: { type: String },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

// Embedded cart item — mirrors the CartItem type in CartContext
const CartItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },        // product _id
    name: { type: String, required: true },
    slug: { type: String, required: true },
    image: { type: String, required: true },
    pricePerPlate: { type: Number, required: true },
    pricePerPack: { type: Number, required: true },
    packSize: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    tier: {
      type: String,
      enum: ["normal", "bulk1000", "bulk5000", "premium"],
      required: true,
    },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String },
    addresses: { type: [AddressSchema], default: [] },
    // Legacy single address kept for backward compat
    address: {
      line1: String, line2: String, city: String,
      state: String, pincode: String, country: String,
    },
    // Persisted cart — synced on login/logout/cart changes
    cart: { type: [CartItemSchema], default: [] },
    role: { type: String, enum: ["customer", "staff", "admin"], default: "customer" },
    isActive: { type: Boolean, default: true },
    hasPlacedOrder: { type: Boolean, default: false },
    firstOrderCouponUsed: { type: Boolean, default: false },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
  },
  { timestamps: true, collection: "users" }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;