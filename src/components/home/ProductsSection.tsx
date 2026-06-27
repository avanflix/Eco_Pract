"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ShoppingBag, Info, Loader2, Plus, Minus } from "lucide-react";
import { useCart } from "@/src/app/context/CartContext";
import type { OrderTier } from "@/src/app/context/CartContext";

interface PricingTier { pricePerPlate: number; pricePerPack: number }
interface ProductAPI {
  _id: string; name: string; slug: string; tier: OrderTier; category: string;
  size?: string; packSize: number; image: string; description?: string;
  pricing: {
    normal: PricingTier; bulk1000: PricingTier; bulk5000: PricingTier; premium?: PricingTier;
  };
}
type Tiers = Partial<Record<OrderTier, { perPlate: number; perPack: number }>>;

function toTiers(pricing: ProductAPI["pricing"]): Tiers {
  return {
    normal:   { perPlate: pricing.normal.pricePerPlate,   perPack: pricing.normal.pricePerPack },
    bulk1000: { perPlate: pricing.bulk1000.pricePerPlate, perPack: pricing.bulk1000.pricePerPack },
    bulk5000: { perPlate: pricing.bulk5000.pricePerPlate, perPack: pricing.bulk5000.pricePerPack },
    ...(pricing.premium ? { premium: { perPlate: pricing.premium.pricePerPlate, perPack: pricing.premium.pricePerPack } } : {}),
  };
}

const tierLabels: Record<OrderTier, string> = {
  normal:   "Normal",
  bulk1000: "Bulk 1000",
  bulk5000: "Bulk 5000",
  premium:  "Premium",
};

const tierColors: Record<OrderTier, string> = {
  normal:   "bg-gray-100 text-gray-700 border-gray-300",
  bulk1000: "bg-blue-50 text-blue-700 border-blue-300",
  bulk5000: "bg-green-50 text-green-700 border-green-300",
  premium:  "bg-amber-50 text-amber-700 border-amber-300",
};

const categoryDisplay: Record<string, string> = {
  "buffet-plates": "Buffet Plates",
  bowls:           "Bowls",
  special:         "Special",
};

function getTierPriceDisplay(tier: OrderTier, tierData: { perPlate: number; perPack: number }, packSize: number) {
  if (tier === "bulk1000") {
    const packs = Math.ceil(1000 / packSize);
    const totalPrice = packs * tierData.perPack;
    return {
      displayPrice: `$${totalPrice.toLocaleString()}`,
      caption: `pack of 1,000 plates`,
      perUnitNote: `$${tierData.perPack.toFixed(2)}/pack · $${tierData.perPlate.toFixed(2)}/plate`,
    };
  }
  if (tier === "bulk5000") {
    const packs = Math.ceil(5000 / packSize);
    const totalPrice = packs * tierData.perPack;
    return {
      displayPrice: `$${totalPrice.toLocaleString()}`,
      caption: `pack of 5,000 plates`,
      perUnitNote: `$${tierData.perPack.toFixed(2)}/pack · $${tierData.perPlate.toFixed(2)}/plate`,
    };
  }
  return {
    displayPrice: `$${tierData.perPack.toFixed(2)}`,
    caption: `pack of ${packSize} plates`,
    perUnitNote: `$${tierData.perPlate.toFixed(2)}/plate`,
  };
}

export default function ProductsSection() {
  const { addToCart, removeFromCart, increaseQuantity, decreaseQuantity, getItemQuantity } = useCart();
  const [products, setProducts] = useState<ProductAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedTiers, setSelectedTiers] = useState<Record<string, OrderTier>>({});

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => { if (data.success) setProducts(data.data); else setError("Failed to load products."); })
      .catch(() => setError("Network error — please refresh."))
      .finally(() => setLoading(false));
  }, []);

  const uniqueCategories = Array.from(new Set(products.map((p) => p.category)));
  const categories = ["All", ...uniqueCategories];
  const filtered = activeCategory === "All" ? products : products.filter((p) => p.category === activeCategory);

  const getTier = (slug: string): OrderTier => selectedTiers[slug] ?? "normal";

  // Get cart quantity for a specific product+tier combination
  const getCartQty = (slug: string, tier: OrderTier): number => getItemQuantity(slug, tier);

  const handleAddOne = (product: ProductAPI) => {
    const tier = getTier(product.slug);
    const tiers = toTiers(product.pricing);
    const tierData = tiers[tier];
    if (!tierData) return;
    addToCart({
      id: product._id, name: product.name, slug: product.slug, image: product.image,
      pricePerPlate: tierData.perPlate, pricePerPack: tierData.perPack,
      packSize: product.packSize, tier,
    });
  };

  const handleIncrease = (slug: string) => {
    const tier = getTier(slug);
    increaseQuantity(slug, tier);
  };

  const handleDecrease = (product: ProductAPI) => {
    const tier = getTier(product.slug);
    const qty = getCartQty(product.slug, tier);
    if (qty <= 1) {
      removeFromCart(product.slug, tier);
    } else {
      decreaseQuantity(product.slug, tier);
    }
  };

  const handleTierChange = (slug: string, newTier: OrderTier) => {
    setSelectedTiers((prev) => ({ ...prev, [slug]: newTier }));
  };

  return (
    <section id="products" className="section-padding bg-[var(--background)]">
      <div className="container-custom">
        <div className="text-center mb-12">
          <span className="text-[var(--primary)] uppercase tracking-widest text-sm font-medium">Our Collection</span>
          <h2 className="heading-lg mt-4 font-display">Areca Leaf Plates & Bowls</h2>
          <p className="text-[var(--text-secondary)] mt-4 max-w-2xl mx-auto">
            Choose your size and order tier. Bulk orders get the best per-plate price — perfect for events and restaurants.
          </p>
        </div>

        {/* Tier info */}
        <div className="bg-white rounded-2xl p-4 mb-10 border border-[var(--border)] flex flex-wrap gap-3 items-center">
          <Info size={16} className="text-[var(--primary)] shrink-0" />
          <span className="text-sm text-[var(--text-secondary)]">Pricing tiers:</span>
          {(["normal", "bulk1000", "bulk5000", "premium"] as OrderTier[]).map((t) => (
            <span key={t} className={`px-3 py-1 rounded-full text-xs border font-medium ${tierColors[t]}`}>
              {tierLabels[t]}
            </span>
          ))}
          <span className="text-xs text-[var(--text-secondary)] ml-auto hidden sm:block">
            Bulk 1000/5000 show total order price
          </span>
        </div>

        {/* Category filter */}
        <div className="flex gap-3 mb-10 flex-wrap">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium border transition ${
                activeCategory === cat
                  ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                  : "bg-white border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
              }`}>
              {cat === "All" ? "All" : (categoryDisplay[cat] ?? cat)}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-24">
            <Loader2 size={36} className="animate-spin text-[var(--primary)]" />
          </div>
        )}
        {!loading && error && <p className="text-center py-20 text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((product) => {
              const tier      = getTier(product.slug);
              const tiers     = toTiers(product.pricing);
              const tierData  = tiers[tier];
              const cartQty   = getCartQty(product.slug, tier);
              const priceDisplay = tierData ? getTierPriceDisplay(tier, tierData, product.packSize) : null;

              return (
                <div key={product.slug}
                  className="bg-white rounded-[32px] overflow-hidden shadow-md hover:-translate-y-1 transition-transform duration-300 group">
                  <div className="relative h-56 overflow-hidden">
                    <Image src={product.image} alt={product.name} fill
                      className="object-cover group-hover:scale-105 transition duration-500" />
                    {cartQty > 0 && (
                      <div className="absolute top-3 right-3 bg-[var(--primary)] text-white text-xs font-bold px-3 py-1.5 rounded-full">
                        {cartQty} in cart
                      </div>
                    )}
                    {(tier === "bulk1000" || tier === "bulk5000") && (
                      <div className="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                        BULK DEAL
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Tier selector */}
                    <div className="mt-4">
                      <p className="text-xs text-[var(--text-secondary)] mb-2 font-medium">Order Tier:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(Object.keys(tiers) as OrderTier[]).map((t) => (
                          <button key={t}
                            onClick={() => handleTierChange(product.slug, t)}
                            className={`px-2.5 py-1 rounded-full text-xs border transition ${
                              tier === t
                                ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                                : "border-gray-200 hover:border-[var(--primary)] hover:text-[var(--primary)]"
                            }`}>
                            {tierLabels[t]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price + CTA */}
                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div>
                        {priceDisplay ? (
                          <>
                            <p className="text-2xl font-bold text-[var(--primary)]">
                              {priceDisplay.displayPrice}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                              {priceDisplay.caption}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)]">
                              {priceDisplay.perUnitNote}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-[var(--text-secondary)]">Not available</p>
                        )}
                      </div>

                      {cartQty > 0 ? (
                        <div className="flex items-center gap-2 bg-white border-2 border-[var(--primary)] rounded-full p-1.5 shrink-0">
                          <button
                            onClick={() => handleDecrease(product)}
                            className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-gray-100 transition text-[var(--primary)]">
                            <Minus size={16} />
                          </button>
                          <span className="font-semibold text-[var(--primary)] min-w-[20px] text-center text-sm">
                            {cartQty}
                          </span>
                          <button
                            onClick={() => handleIncrease(product.slug)}
                            className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-gray-100 transition text-[var(--primary)]">
                            <Plus size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddOne(product)}
                          disabled={!tierData}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition shrink-0 bg-[var(--primary)] text-white hover:bg-[var(--primary-light)] disabled:opacity-40">
                          <ShoppingBag size={15} /> Add
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="text-center py-20 text-[var(--text-secondary)]">No products in this category.</p>
        )}
      </div>
    </section>
  );
}