import Link from "next/link";
import Image from "next/image";

interface Product {
  _id?: string;
  name: string;
  slug: string;
  category: string;
  image: string;
  price: number;
  description?: string;
}
interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  return (
    <Link href={`/products/${product.slug}`}>
      <div className="group rounded-[32px] overflow-hidden bg-white shadow-md cursor-pointer">
        <div className="relative h-72 overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition duration-500"
          />
        </div>

        <div className="p-6">
          <h3 className="font-semibold">{product.name}</h3>

          <p className="mt-2 text-xl font-bold text-[var(--primary)]">
            ₹{product.price}
          </p>
        </div>
      </div>
    </Link>
  );
}