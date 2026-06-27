export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  material: string;
  image: string;
  images?: string[];
  badge?: string;
  inStock: boolean;
  rating?: number;
  reviews?: number;
  features?: string[];
  variants?: ProductVariant[];
  weight?: string;
  dimensions?: string;
  minOrder?: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  price?: number;
  inStock: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  count?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: ProductVariant;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}
