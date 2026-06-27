import mongoose from "mongoose";

const PincodeSchema = new mongoose.Schema(
  {
    pincode: { type: String, required: true, unique: true, index: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: "US" },
    isDeliverable: { type: Boolean, default: true },
    deliveryDays: { type: Number, default: 5 }, // estimated delivery days
    zone: { type: String }, // e.g. "East", "West", "Central"
    salesTaxRate: { type: Number, default: 0.08 }, // 8% default US sales tax
  },
  { timestamps: true, collection: "pincodes" }
);

const Pincode = mongoose.models.Pincode || mongoose.model("Pincode", PincodeSchema);
export default Pincode;
