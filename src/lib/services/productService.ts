// SERVER-ONLY — never import this in a "use client" component
import "server-only";
import { connectDB } from "@/src/lib/mongodb";
import Product from "@/src/models/products";

export type OrderTier = "normal" | "bulk1000" | "bulk5000" | "premium";

export interface ProductDoc {
  _id: string;
  name: string;
  slug: string;
  category: string;
  size?: string;
  packSize: number;
  image: string;
  description?: string;
  pricing: {
    normal:   { pricePerPlate: number; pricePerPack: number };
    bulk1000: { pricePerPlate: number; pricePerPack: number };
    bulk5000: { pricePerPlate: number; pricePerPack: number };
    premium?: { pricePerPlate: number; pricePerPack: number };
  };
  isActive: boolean;
}

export async function getProducts(): Promise<ProductDoc[]> {
  await connectDB();
  const products = await Product.find({ isActive: true }).lean().exec();
  return products.map((p: any) => ({ ...p, _id: String(p._id) }));
}

export async function getProductBySlug(slug: string): Promise<ProductDoc | null> {
  await connectDB();
  const product = await Product.findOne({ slug, isActive: true }).lean().exec();
  if (!product) return null;
  return { ...(product as any), _id: String((product as any)._id) };
}

export async function getProductsByCategory(category: string): Promise<ProductDoc[]> {
  await connectDB();
  const products = await Product.find({ category, isActive: true }).lean().exec();
  return products.map((p: any) => ({ ...p, _id: String(p._id) }));
}

/** Convert MongoDB pricing shape → tiers shape used by UI */
export function toTiers(pricing: ProductDoc["pricing"]) {
  return {
    normal:   { perPlate: pricing.normal.pricePerPlate,   perPack: pricing.normal.pricePerPack },
    bulk1000: { perPlate: pricing.bulk1000.pricePerPlate, perPack: pricing.bulk1000.pricePerPack },
    bulk5000: { perPlate: pricing.bulk5000.pricePerPlate, perPack: pricing.bulk5000.pricePerPack },
    ...(pricing.premium
      ? { premium: { perPlate: pricing.premium.pricePerPlate, perPack: pricing.premium.pricePerPack } }
      : {}),
  };
}
