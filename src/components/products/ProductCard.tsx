import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";

type ProductImage = {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
};

type ProductCategory = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  type: "IMPORT" | "EXPORT";
  shortDescription: string | null;
  description: string | null;
  featured: boolean;
  category: ProductCategory | null;
  images: ProductImage[];
};

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({
  product,
}: ProductCardProps) {
  const firstImage =
    product.images?.[0]?.url || "";

  const imageAlt =
    product.images?.[0]?.alt ||
    product.name;

  const typeLabel =
    product.type === "IMPORT"
      ? "Import"
      : "Export";

  return (
    <article className="group w-full overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">

      {/* IMAGE */}

      <Link
        href={`/products/${product.type.toLowerCase()}/${product.slug}`}
        className="block"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--primary-light)]">

          {firstImage ? (
            <img
              src={firstImage}
              alt={imageAlt}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package
                size={48}
                className="text-[#1455a0] dark:text-[#68b0ff]"
              />
            </div>
          )}

          {/* Gradient overlay */}

          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />

          {/* TYPE */}

          <div className="absolute right-4 top-4 rounded-full border border-white/30 bg-black/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white backdrop-blur-md">
            {typeLabel}
          </div>

          {/* FEATURED */}

          {product.featured && (
            <div className="absolute left-4 top-4 rounded-full bg-[#c9a24d] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white shadow-lg">
              Featured
            </div>
          )}

        </div>
      </Link>

      {/* CONTENT */}

      <div className="p-6 sm:p-7">

        {/* CATEGORY */}

        {product.category?.name && (
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c9a24d] dark:text-[#d8b45b]">
            {product.category.name}
          </div>
        )}

        {/* NAME */}

        <h2 className="mt-3 text-2xl font-bold tracking-tight text-[var(--foreground)]">
          {product.name}
        </h2>

        {/* DESCRIPTION */}

        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--foreground)]/65">
          {product.shortDescription ||
            product.description ||
            "Explore product information and trade opportunities with Krupali Traders Private Limited."}
        </p>

        {/* BUTTON */}

        <Link
          href={`/products/${product.type.toLowerCase()}/${product.slug}`}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1455a0] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#1455a0]/20 transition duration-300 hover:-translate-y-0.5 hover:bg-[#0f4688] hover:shadow-xl dark:bg-[#1d68b8] dark:hover:bg-[#2678ca]"
        >
          View Product

          <ArrowRight
            size={17}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>

      </div>
    </article>
  );
}