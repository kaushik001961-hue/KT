"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Globe2,
  PackageCheck,
  SearchCheck,
} from "lucide-react";
import Link from "next/link";

import ProductCard from "@/components/products/ProductCard";

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
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";

  shortDescription: string | null;
  description: string | null;
  specifications: string | null;

  countryOfOrigin: string | null;
  packaging: string | null;
  minimumOrderQuantity: string | null;

  featured: boolean;

  category: ProductCategory | null;

  images: ProductImage[];
};

export default function ImportProductsPage() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/products?type=IMPORT",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load import products."
          );
        }

        const data =
          await response.json();

        if (!mounted) {
          return;
        }

        setProducts(
          Array.isArray(data.products)
            ? data.products
            : []
        );
      } catch (err) {
        console.error(
          "IMPORT_PRODUCTS_LOAD_ERROR",
          err
        );

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load import products."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="gradient-section overflow-hidden">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden px-5 pb-16 pt-28 sm:pb-20 sm:pt-32 lg:px-8">

        {/* Decorative glows */}

        <div className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-[#68b0ff]/10 blur-3xl" />

        <div className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-[#c9a24d]/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl">

          <div className="mx-auto max-w-4xl text-center">

            {/* LABEL */}

            <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#c9a24d] dark:text-[#d8b45b]">
              Available Products
            </div>

            {/* HEADING */}

            <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
              <span className="gradient-text">
                Explore our import products.
              </span>
            </h1>

            {/* DESCRIPTION */}

            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[var(--foreground)]/65 sm:text-lg">
              Browse our currently published import
              products and explore individual product
              information.
            </p>

          </div>

        </div>
      </section>

      {/* =====================================================
          PRODUCTS
      ===================================================== */}

      <section className="px-5 pb-20 sm:pb-24 lg:px-8">

        <div className="mx-auto max-w-7xl">

          {/* PRODUCT COUNT */}

          <div className="mb-8 flex justify-center sm:justify-end">

            <div className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2 text-sm font-semibold text-[var(--foreground)] shadow-sm">
              {loading
                ? "Loading..."
                : `${products.length} ${
                    products.length === 1
                      ? "Product"
                      : "Products"
                  }`}
            </div>

          </div>

          {/* ERROR */}

          {error && (
            <div className="mx-auto max-w-2xl rounded-2xl border border-red-500/20 bg-red-500/10 px-6 py-5 text-center text-sm font-medium text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* LOADING */}

          {loading && !error && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {[1, 2, 3].map(
                (item) => (
                  <div
                    key={item}
                    className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-sm"
                  >
                    <div className="aspect-[4/3] animate-pulse bg-[var(--primary-light)]" />

                    <div className="space-y-4 p-7">

                      <div className="h-3 w-24 animate-pulse rounded bg-[var(--primary-light)]" />

                      <div className="h-7 w-40 animate-pulse rounded bg-[var(--primary-light)]" />

                      <div className="h-16 animate-pulse rounded bg-[var(--primary-light)]" />

                      <div className="h-12 animate-pulse rounded-full bg-[var(--primary-light)]" />

                    </div>
                  </div>
                )
              )}

            </div>
          )}

          {/* PRODUCTS */}

          {!loading &&
            !error &&
            products.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            )}

          {/* EMPTY STATE */}

          {!loading &&
            !error &&
            products.length === 0 && (
              <div className="mx-auto max-w-2xl rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-10 text-center shadow-sm sm:p-14">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary-light)]">
                  <PackageCheck
                    size={30}
                    className="text-[#1455a0] dark:text-[#68b0ff]"
                  />
                </div>

                <h2 className="mt-6 text-2xl font-bold text-[var(--foreground)]">
                  No import products available
                </h2>

                <p className="mt-3 leading-7 text-[var(--foreground)]/60">
                  Our import product catalogue is
                  currently being updated. Please
                  check again soon or contact our team
                  for sourcing requirements.
                </p>

                <Link
                  href="/contact"
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#1455a0] px-6 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#0f4688] dark:bg-[#1d68b8] dark:hover:bg-[#2678ca]"
                >
                  Discuss Requirements
                  <ArrowRight size={17} />
                </Link>

              </div>
            )}

        </div>
      </section>

      {/* =====================================================
          SOURCING SECTION
      ===================================================== */}

      <section className="px-5 pb-20 sm:pb-24 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="gradient-card gradient-border rounded-[2rem] p-7 sm:p-10 lg:p-14">

            <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">

              {/* TEXT */}

              <div>

                <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#c9a24d] dark:text-[#d8b45b]">
                  International Sourcing
                </div>

                <h2 className="mt-4 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
                  Source globally with confidence.
                </h2>

                <p className="mt-5 leading-8 text-[var(--foreground)]/65">
                  We help connect businesses with
                  international sourcing opportunities
                  through professional communication,
                  coordination and a quality-focused
                  approach.
                </p>

                <Link
                  href="/contact"
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#1455a0] px-6 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#0f4688] dark:bg-[#1d68b8] dark:hover:bg-[#2678ca]"
                >
                  Send an Enquiry
                  <ArrowRight size={17} />
                </Link>

              </div>

              {/* FEATURES */}

              <div className="grid gap-4 sm:grid-cols-2">

                <div className="gradient-card gradient-border rounded-3xl p-6">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-light)]">
                    <Globe2
                      size={24}
                      className="text-[#1455a0] dark:text-[#68b0ff]"
                    />
                  </div>

                  <h3 className="mt-5 font-bold text-[var(--foreground)]">
                    Global Sourcing
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[var(--foreground)]/60">
                    Supporting international sourcing
                    requirements and trade
                    opportunities.
                  </p>

                </div>

                <div className="gradient-card gradient-border rounded-3xl p-6">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-light)]">
                    <SearchCheck
                      size={24}
                      className="text-[#1455a0] dark:text-[#68b0ff]"
                    />
                  </div>

                  <h3 className="mt-5 font-bold text-[var(--foreground)]">
                    Product Requirements
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[var(--foreground)]/60">
                    Share your product and quantity
                    requirements with our team.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

    </main>
  );
}