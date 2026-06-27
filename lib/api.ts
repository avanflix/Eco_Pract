import { Product, Category, ApiResponse } from "@/types";

// ─── Config ───────────────────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.ecopract.com/v1";

// ─── Fetch helper ─────────────────────────────────────────────────────────────
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(process.env.NEXT_PUBLIC_API_KEY && {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
      }),
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// ─── Products API ─────────────────────────────────────────────────────────────
export async function getProducts(params?: {
  category?: string;
  page?: number;
  limit?: number;
  search?: string;
  sort?: "price_asc" | "price_desc" | "newest" | "popular";
}): Promise<ApiResponse<Product[]>> {
  const query = new URLSearchParams();
  if (params?.category) query.set("category", params.category);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.search) query.set("search", params.search);
  if (params?.sort) query.set("sort", params.sort);

  return apiFetch<ApiResponse<Product[]>>(
    `/products${query.toString() ? `?${query}` : ""}`
  );
}

export async function getProduct(id: string): Promise<ApiResponse<Product>> {
  return apiFetch<ApiResponse<Product>>(`/products/${id}`);
}

export async function getCategories(): Promise<ApiResponse<Category[]>> {
  return apiFetch<ApiResponse<Category[]>>("/categories");
}

// ─── Orders API ───────────────────────────────────────────────────────────────
export interface OrderPayload {
  items: { productId: string; quantity: number; variantId?: string }[];
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  notes?: string;
}

export async function createOrder(
  payload: OrderPayload
): Promise<ApiResponse<{ orderId: string; total: number }>> {
  return apiFetch("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ─── Bulk Quote API ───────────────────────────────────────────────────────────
export interface BulkQuotePayload {
  name: string;
  email: string;
  phone: string;
  company?: string;
  products: string;
  quantity: number;
  message?: string;
}

export async function submitBulkQuote(
  payload: BulkQuotePayload
): Promise<ApiResponse<{ quoteId: string }>> {
  return apiFetch("/quotes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ─── Mock data (used when API is unavailable) ─────────────────────────────────
export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Palash Leaf Dinner Plate",
    description:
      "Handcrafted from authentic Palash (Flame of the Forest) leaves. Naturally water-resistant, completely biodegradable. Perfect for weddings, events & daily use.",
    price: 6,
    originalPrice: 10,
    category: "plates",
    material: "Palash Leaf",
    image: "/products/palash-plate.jpg",
    badge: "Bestseller",
    inStock: true,
    rating: 4.8,
    reviews: 342,
    features: ["100% Natural", "Water-resistant", "Biodegradable in 30 days", "Chemical-free"],
    minOrder: 50,
  },
  {
    id: "2",
    name: "Sal Leaf Bowl Set",
    description:
      "Traditional Sal leaf bowls, perfect for soups, curries, and desserts. Sourced sustainably from forest communities.",
    price: 8,
    originalPrice: 12,
    category: "bowls",
    material: "Sal Leaf",
    image: "/products/sal-bowl.jpg",
    badge: "New",
    inStock: true,
    rating: 4.7,
    reviews: 198,
    features: ["Leak-proof", "Heat-resistant", "Compostable", "Forest-sourced"],
    minOrder: 100,
  },
  {
    id: "3",
    name: "Bamboo Cutlery Set",
    description:
      "Premium bamboo fork, knife & spoon set. Reusable, durable and crafted for eco-conscious dining experiences.",
    price: 45,
    originalPrice: 65,
    category: "cutlery",
    material: "Bamboo",
    image: "/products/bamboo-cutlery.jpg",
    inStock: true,
    rating: 4.9,
    reviews: 521,
    features: ["Reusable", "Dishwasher-safe", "Durable", "Premium finish"],
  },
  {
    id: "4",
    name: "Wooden Serving Spoon",
    description:
      "Hand-turned neem wood serving spoon with natural antibacterial properties. Smooth finish, gentle on cookware.",
    price: 120,
    category: "cutlery",
    material: "Neem Wood",
    image: "/products/wooden-spoon.jpg",
    inStock: true,
    rating: 4.6,
    reviews: 87,
    features: ["Antibacterial", "Handcrafted", "Cookware-safe", "Long-lasting"],
  },
  {
    id: "5",
    name: "Palash Leaf Party Pack",
    description:
      "Bulk pack of 100 Palash leaf plates — ideal for weddings, puja ceremonies, and large gatherings.",
    price: 450,
    originalPrice: 600,
    category: "bulk",
    material: "Palash Leaf",
    image: "/products/party-pack.jpg",
    badge: "Best Value",
    inStock: true,
    rating: 4.9,
    reviews: 1204,
    minOrder: 1,
  },
  {
    id: "6",
    name: "Bamboo Lunch Box",
    description:
      "Stackable, leak-proof bamboo lunch box with silicone seal. Office-ready, microwave-safe, and planet-friendly.",
    price: 650,
    originalPrice: 850,
    category: "containers",
    material: "Bamboo",
    image: "/products/bamboo-box.jpg",
    badge: "New",
    inStock: true,
    rating: 4.7,
    reviews: 156,
    features: ["Microwave-safe", "Leak-proof", "Stackable", "BPA-free"],
  },
];

export const mockCategories: Category[] = [
  { id: "1", name: "Plates", slug: "plates", description: "Leaf & bamboo plates", icon: "🍽️", count: 12 },
  { id: "2", name: "Bowls", slug: "bowls", description: "Traditional leaf bowls", icon: "🥣", count: 8 },
  { id: "3", name: "Cutlery", slug: "cutlery", description: "Wooden & bamboo cutlery", icon: "🥢", count: 15 },
  { id: "4", name: "Containers", slug: "containers", description: "Eco-friendly storage", icon: "📦", count: 6 },
  { id: "5", name: "Bulk Orders", slug: "bulk", description: "Wholesale & events", icon: "🏢", count: 4 },
];
