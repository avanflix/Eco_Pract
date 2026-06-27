import { NextResponse } from "next/server";
import { getProducts, getProductsByCategory } from "@/src/lib/services/productService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const products = category
      ? await getProductsByCategory(category)
      : await getProducts();

    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    console.error("[GET /api/products]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
