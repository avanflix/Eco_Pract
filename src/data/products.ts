export type ProductTier = {
  normal:   { perPlate: number; perPack: number };
  bulk1000: { perPlate: number; perPack: number };
  bulk5000: { perPlate: number; perPack: number };
  premium?: { perPlate: number; perPack: number };
};

export type Product = {
  id: number; name: string; slug: string; category: string;
  description: string; image: string; packSize: number; tiers: ProductTier;
};

// USD pricing — pack of 20 plates
// bulk1000 total = (1000/20) * pricePerPack = 50 * 8 = $400 (example)
// The products section calculates total automatically
export const products: Product[] = [
  {
    id: 1, name: '8" Buffet Plate', slug: "8-buffet-plate", category: "buffet-plates",
    description: "Perfect for appetizers and small portions. 100% biodegradable areca palm leaf.",
    image: "/images/categories/plates.jpg", packSize: 20,
    tiers: {
      normal:   { perPlate: 0.60, perPack: 12.00 },
      bulk1000: { perPlate: 0.55, perPack: 11.00 }, // 1000 plates = 50 packs = $550 → rounded ≈ $550
      bulk5000: { perPlate: 0.50, perPack: 10.00 }, // 5000 plates = 250 packs = $2500
      premium:  { perPlate: 1.00, perPack: 20.00 },
    },
  },
  {
    id: 2, name: '9" Buffet Plate', slug: "9-buffet-plate", category: "buffet-plates",
    description: "Ideal for salads, desserts and medium servings. Natural leaf texture.",
    image: "/images/categories/plates.jpg", packSize: 20,
    tiers: {
      normal:   { perPlate: 0.65, perPack: 13.00 },
      bulk1000: { perPlate: 0.60, perPack: 12.00 },
      bulk5000: { perPlate: 0.55, perPack: 11.00 },
      premium:  { perPlate: 1.10, perPack: 22.00 },
    },
  },
  {
    id: 3, name: '10" Buffet Plate', slug: "10-buffet-plate", category: "buffet-plates",
    description: "Standard dinner plate size, perfect for main courses at events.",
    image: "/images/categories/plates.jpg", packSize: 20,
    tiers: {
      normal:   { perPlate: 0.70, perPack: 14.00 },
      bulk1000: { perPlate: 0.65, perPack: 13.00 },
      bulk5000: { perPlate: 0.60, perPack: 12.00 },
      premium:  { perPlate: 1.20, perPack: 24.00 },
    },
  },
  {
    id: 7, name: '6" Bowl', slug: "6-bowl", category: "bowls",
    description: "Eco-friendly bowl for soups, curries and side dishes.",
    image: "/images/categories/cups.jpg", packSize: 20,
    tiers: {
      normal:   { perPlate: 0.50, perPack: 10.00 },
      bulk1000: { perPlate: 0.45, perPack: 9.00 },
      bulk5000: { perPlate: 0.40, perPack: 8.00 },
      premium:  { perPlate: 0.80, perPack: 16.00 },
    },
  },
];
