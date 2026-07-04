/**
 * Seed script — populates products in USD pricing.
 * Run: npx tsx scripts/seed.ts
 */
import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("MONGODB_URI missing in .env.local");

const PricingTierSchema = new mongoose.Schema({ pricePerPlate: Number, pricePerPack: Number }, { _id: false });
const PricingSchema = new mongoose.Schema({
  normal: PricingTierSchema, bulk1000: PricingTierSchema,
  bulk5000: PricingTierSchema, premium: PricingTierSchema,
}, { _id: false });
const ProductSchema = new mongoose.Schema({
  name: String, slug: String, category: String, size: String,
  packSize: Number, image: String, description: String,
  pricing: PricingSchema, isActive: { type: Boolean, default: true },
}, { collection: "products" });
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

// USD pricing
// Pack of 20 for normal; pack of 100 for bulk
const products = [
  {
    name: "8 Inch Buffet Plate", slug: "8-inch-buffet-plate", category: "buffet-plates",
    size: "8 Inch", packSize: 100, image: "/images/categories/plates.jpg",
    description: "Premium Sal & Palash Buffet Plate perfect for appetizers and small portions.",
    pricing: {
      normal:   { pricePerPlate: 0.60, pricePerPack: 12.00 },   // pack of 20
      bulk1000: { pricePerPlate: 0.55, pricePerPack: 55.00 },   // pack of 100 → 1000 = 10 packs = $550; but per product spec: 800 per pack, total 8000
      bulk5000: { pricePerPlate: 0.50, pricePerPack: 50.00 },   // pack of 100 → 5000 = 50 packs = $2500
      premium:  { pricePerPlate: 1.00, pricePerPack: 20.00 },
    },
  },
  {
    name: "9 Inch Buffet Plate", slug: "9-inch-buffet-plate", category: "buffet-plates",
    size: "9 Inch", packSize: 100, image: "/images/categories/plates.jpg",
    description: "Ideal for salads, desserts and medium servings. Natural leaf texture.",
    pricing: {
      normal:   { pricePerPlate: 0.65, pricePerPack: 13.00 },
      bulk1000: { pricePerPlate: 0.60, pricePerPack: 60.00 },
      bulk5000: { pricePerPlate: 0.55, pricePerPack: 55.00 },
      premium:  { pricePerPlate: 1.10, pricePerPack: 22.00 },
    },
  },
  {
    name: "10 Inch Buffet Plate", slug: "10-inch-buffet-plate", category: "buffet-plates",
    size: "10 Inch", packSize: 100, image: "/images/categories/plates.jpg",
    description: "Standard dinner plate size, perfect for main courses at events.",
    pricing: {
      normal:   { pricePerPlate: 0.70, pricePerPack: 14.00 },
      bulk1000: { pricePerPlate: 0.65, pricePerPack: 65.00 },
      bulk5000: { pricePerPlate: 0.60, pricePerPack: 60.00 },
      premium:  { pricePerPlate: 1.20, pricePerPack: 24.00 },
    },
  },
  {
    name: "11 Inch Buffet Plate", slug: "11-inch-buffet-plate", category: "buffet-plates",
    size: "11 Inch", packSize: 100, image: "/images/categories/plates.jpg",
    description: "Large plate ideal for generous portions and banquet-style events.",
    pricing: {
      normal:   { pricePerPlate: 0.80, pricePerPack: 16.00 },
      bulk1000: { pricePerPlate: 0.75, pricePerPack: 75.00 },
      bulk5000: { pricePerPlate: 0.70, pricePerPack: 70.00 },
      premium:  { pricePerPlate: 1.40, pricePerPack: 28.00 },
    },
  },
  {
    name: "12 Inch Buffet Plate", slug: "12-inch-buffet-plate", category: "buffet-plates",
    size: "12 Inch", packSize: 100, image: "/images/categories/plates.jpg",
    description: "Extra large for buffets and full meal servings. Strong and sturdy.",
    pricing: {
      normal:   { pricePerPlate: 0.85, pricePerPack: 17.00 },
      bulk1000: { pricePerPlate: 0.80, pricePerPack: 80.00 },
      bulk5000: { pricePerPlate: 0.75, pricePerPack: 75.00 },
      premium:  { pricePerPlate: 1.50, pricePerPack: 30.00 },
    },
  },
  {
    name: "6 Inch Bowl", slug: "6-inch-bowl", category: "bowls",
    size: "6 Inch", packSize: 100, image: "/images/categories/cups.jpg",
    description: "Eco-friendly bowl for soups, curries and side dishes.",
    pricing: {
      normal:   { pricePerPlate: 0.50, pricePerPack: 10.00 },
      bulk1000: { pricePerPlate: 0.45, pricePerPack: 45.00 },
      bulk5000: { pricePerPlate: 0.40, pricePerPack: 40.00 },
      premium:  { pricePerPlate: 0.80, pricePerPack: 16.00 },
    },
  },
  {
    name: "4.5 Inch Bowl", slug: "4-5-inch-bowl", category: "bowls",
    size: "4.5 Inch", packSize: 100, image: "/images/categories/cups.jpg",
    description: "Small bowls for dips, sauces and snacks. Compostable and sturdy.",
    pricing: {
      normal:   { pricePerPlate: 0.40, pricePerPack: 8.00 },
      bulk1000: { pricePerPlate: 0.35, pricePerPack: 35.00 },
      bulk5000: { pricePerPlate: 0.30, pricePerPack: 30.00 },
      premium:  { pricePerPlate: 0.60, pricePerPack: 12.00 },
    },
  },
  {
    name: "Idly Plate", slug: "idly-plate", category: "special",
    packSize: 100, image: "/images/categories/plates.jpg",
    description: "Traditional idly plate with compartments, made from natural Sal & Palash leaf.",
    pricing: {
      normal:   { pricePerPlate: 0.90, pricePerPack: 90.00 },
      bulk1000: { pricePerPlate: 0.80, pricePerPack: 80.00 },  // 1000 = 10 packs × $80 = $800 total
      bulk5000: { pricePerPlate: 0.70, pricePerPack: 70.00 },  // 5000 = 50 packs × $70 = $3500 total
    },
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI, { dbName: "eco-pract" });
  console.log("Connected to MongoDB");
  for (const p of products) {
    await Product.findOneAndUpdate({ slug: p.slug }, p, { upsert: true, new: true });
    console.log(`✓ Upserted: ${p.name}`);
  }
  console.log("\nSeeding complete!");
  await mongoose.disconnect();
}

seed().catch((err) => { console.error("Seed error:", err); process.exit(1); });
