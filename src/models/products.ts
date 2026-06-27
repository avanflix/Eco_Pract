import mongoose from "mongoose";

const PricingTierSchema = new mongoose.Schema(
  {
    pricePerPlate: { type: Number, required: true },
    pricePerPack: { type: Number, required: true },
  },
  { _id: false }
);

const PricingSchema = new mongoose.Schema(
  {
    normal: { type: PricingTierSchema, required: true },
    bulk1000: { type: PricingTierSchema, required: true },
    bulk5000: { type: PricingTierSchema, required: true },
    premium: { type: PricingTierSchema },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    size: { type: String },
    packSize: { type: Number, required: true, default: 20 },
    image: { type: String, required: true },
    description: { type: String },
    pricing: { type: PricingSchema, required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: "products",
  }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;
