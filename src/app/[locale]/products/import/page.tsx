"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import {
  ArrowRight,
  PackageCheck,
  FolderOpen,
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
  image?: string | null;
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

type CategoryWithThumbnail = {
  id: string;
  name: string;
  thumbnailUrl: string | null;
};

/* ============================================================
   CATEGORY FALLBACK IMAGES
   ============================================================ */

const CATEGORY_FALLBACK_IMAGES: Record<
  string,
  string
> = {
  "Indian Spices":
    "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=85",

  "Nuts & Seed":
    "https://down-my.img.susercontent.com/file/2fdb7d8f2a69cb220a9327d0b74ecdba",

  Handicrafts:
    "https://shikhas.co/cdn/shop/files/handicraft-brand.png?v=1780937039&width=1200",

  Honey:
    "https://d2j6dbq0eux0bg.cloudfront.net/images/78328829/products/635443944/5761458506.jpg",

  "Fresh Vegetable":
    "https://voxdev.org/sites/default/files/cover_images/AdobeStock_8183040732.jpeg",
};

/* ============================================================
   HELPERS
   ============================================================ */

/**
 * Determines whether an image URL is a placeholder.
 */
function isPlaceholderImage(
  url: string | null | undefined
): boolean {
  if (!url) {
    return true;
  }

  const normalizedUrl =
    url.toLowerCase().trim();

  return (
    normalizedUrl.includes("placehold.co") ||
    normalizedUrl.includes("placeholder.com") ||
    normalizedUrl.includes("placeholder")
  );
}

/**
 * Returns the first real image from a product.
 */
function getRealProductImage(
  product: Product
): string | null {
  const sortedImages =
    product.images
      ?.slice()
      .sort(
        (a, b) =>
          a.sortOrder - b.sortOrder
      ) || [];

  const realImage =
    sortedImages.find(
      (image) =>
        image.url &&
        !isPlaceholderImage(image.url)
    );

  return realImage?.url || null;
}

/**
 * Returns the best image available for a category.
 *
 * Priority:
 * 1. Real product image
 * 2. Category fallback image
 * 3. null
 */
function getCategoryFallbackImage(
  categoryName: string
): string | null {
  return (
    CATEGORY_FALLBACK_IMAGES[
      categoryName
    ] || null
  );
}

/* ============================================================
   MAIN CONTENT
   ============================================================ */

function ImportProductsContent() {
  const searchParams =
    useSearchParams();

  const params = useParams();

  const locale =
    (params?.locale as string) || "en";

  const categoryId =
    searchParams
      .get("categoryId")
      ?.trim() || "";

  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<CategoryWithThumbnail[]>(
      []
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* ==========================================================
     LOAD PRODUCTS
     ========================================================== */

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const query =
          new URLSearchParams();

        query.set("type", "IMPORT");

        if (categoryId) {
          query.set(
            "categoryId",
            categoryId
          );
        }

        const response =
          await fetch(
            `/api/products?${query.toString()}`,
            {
              method: "GET",
              cache: "no-store",
            }
          );

        if (!response.ok) {
          throw new Error(
            "Unable to load import data."
          );
        }

        const data =
          await response.json();

        if (!mounted) {
          return;
        }

        const fetchedProducts =
          Array.isArray(data.products)
            ? data.products
            : [];

        setProducts(
          fetchedProducts
        );

        /* ======================================================
           BUILD CATEGORY LIST
           ====================================================== */

        if (!categoryId) {
          const catMap =
            new Map<
              string,
              CategoryWithThumbnail
            >();

          fetchedProducts.forEach(
            (product: Product) => {
              if (
                !product.category
              ) {
                return;
              }

              const catId =
                product.category.id;

              const categoryName =
                product.category.name;

              const existing =
                catMap.get(catId);

              /*
               * Look for a REAL image.
               *
               * This searches every product
               * belonging to the category.
               *
               * It ignores placehold.co.
               */
              const realImage =
                getRealProductImage(
                  product
                );

              /*
               * Category-specific fallback.
               */
              const fallbackImage =
                getCategoryFallbackImage(
                  categoryName
                );

              /* ----------------------------------------------
                 FIRST PRODUCT IN CATEGORY
                 ---------------------------------------------- */

              if (!existing) {
                catMap.set(catId, {
                  id: catId,

                  name: categoryName,

                  /*
                   * Priority:
                   * real product image
                   * fallback category image
                   * null
                   */
                  thumbnailUrl:
                    realImage ||
                    fallbackImage ||
                    null,
                });

                return;
              }

              /* ----------------------------------------------
                 UPDATE CATEGORY IF REAL IMAGE FOUND
                 ---------------------------------------------- */

              /*
               * If the existing image is a fallback,
               * replace it with a real product image.
               */
              const existingIsFallback =
                existing.thumbnailUrl ===
                fallbackImage;

              if (
                realImage &&
                (
                  !existing.thumbnailUrl ||
                  existingIsFallback ||
                  isPlaceholderImage(
                    existing.thumbnailUrl
                  )
                )
              ) {
                existing.thumbnailUrl =
                  realImage;
              }
            }
          );

          setCategories(
            Array.from(
              catMap.values()
            )
          );
        }
      } catch (err) {
        console.error(
          "IMPORT_DATA_LOAD_ERROR",
          err
        );

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load import data."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [categoryId]);

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <main className="gradient-section overflow-hidden">
      {/* ======================================================
          HERO
          ====================================================== */}

      <section className="relative overflow-hidden px-5 pb-16 pt-44 sm:pb-20 sm:pt-48 lg:px-8">
        {/* Background glow */}
        <div className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-[#68b0ff]/10 blur-3xl" />

        <div className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-[#c9a24d]/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            {/* Label */}
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#c9a24d] dark:text-[#d8b45b]">
              {categoryId
                ? "Filtered Category"
                : "Available Categories"}
            </div>

            {/* Heading */}
            <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
              <span className="gradient-text">
                {categoryId
                  ? "Explore category products."
                  : "Explore our import categories."}
              </span>
            </h1>

            {/* Description */}
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[var(--foreground)]/65 sm:text-lg">
              {categoryId
                ? "Showing products available under this selected import category."
                : "Select a category below to browse published import products and individual product information."}
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================
          PRODUCTS / CATEGORIES SECTION
          ====================================================== */}

      <section className="px-5 pb-20 sm:pb-24 lg:px-8">
        <div className="mx-auto max-w-7xl">

          {/* ==================================================
              BACK BUTTON
              ================================================== */}

          {categoryId && (
            <div className="mb-8 flex justify-start">
              <Link
                href={`/${locale}/products/import`}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2 text-sm font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--primary-light)]"
              >
                ← Back to All Categories
              </Link>
            </div>
          )}

          {/* ==================================================
              COUNT BADGE
              ================================================== */}

          <div className="mb-8 flex justify-center sm:justify-end">
            <div className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2 text-sm font-semibold text-[var(--foreground)] shadow-sm">
              {loading
                ? "Loading..."
                : categoryId
                ? `${products.length} ${
                    products.length === 1
                      ? "Product"
                      : "Products"
                  }`
                : `${categories.length} ${
                    categories.length === 1
                      ? "Category"
                      : "Categories"
                  }`}
            </div>
          </div>

          {/* ==================================================
              ERROR
              ================================================== */}

          {error && (
            <div className="mx-auto max-w-2xl rounded-2xl border border-red-500/20 bg-red-500/10 px-6 py-5 text-center text-sm font-medium text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* ==================================================
              LOADING SKELETON
              ================================================== */}

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
                      <div className="h-7 w-40 animate-pulse rounded bg-[var(--primary-light)]" />

                      <div className="h-4 w-24 animate-pulse rounded bg-[var(--primary-light)]" />
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* ==================================================
              CATEGORIES GRID
              ================================================== */}

          {!loading &&
            !error &&
            !categoryId &&
            categories.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map(
                  (cat) => (
                    <Link
                      key={cat.id}
                      href={`/${locale}/products/import?categoryId=${cat.id}`}
                      className="group flex items-center gap-5 overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                      {/* ========================================
                          CATEGORY IMAGE
                          ======================================== */}

                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--primary-light)]">
                        {cat.thumbnailUrl ? (
                          <img
                            src={
                              cat.thumbnailUrl
                            }
                            alt={
                              cat.name
                            }
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                            onError={(
                              event
                            ) => {
                              /*
                               * If a remote fallback
                               * image fails, hide it
                               * and show the folder icon.
                               */
                              const image =
                                event.currentTarget;

                              image.style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[#1455a0] dark:text-[#68b0ff]">
                            <FolderOpen
                              size={24}
                            />
                          </div>
                        )}

                        {/* Fallback icon behind image */}
                        <div className="absolute inset-0 -z-0 flex items-center justify-center text-[#1455a0] dark:text-[#68b0ff]">
                          <FolderOpen
                            size={24}
                          />
                        </div>
                      </div>

                      {/* ========================================
                          CATEGORY NAME
                          ======================================== */}

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-xl font-bold text-[var(--foreground)] transition group-hover:text-[#1455a0] dark:group-hover:text-[#68b0ff]">
                          {cat.name}
                        </h3>

                        <p className="mt-1 text-xs text-[var(--foreground)]/60">
                          View items
                        </p>
                      </div>

                      {/* ========================================
                          ARROW
                          ======================================== */}

                      <ArrowRight
                        className="flex-shrink-0 text-[var(--foreground)]/30 transition group-hover:translate-x-1 group-hover:text-[#1455a0] dark:group-hover:text-[#68b0ff]"
                        size={20}
                      />
                    </Link>
                  )
                )}
              </div>
            )}

          {/* ==================================================
              PRODUCTS GRID
              ================================================== */}

          {!loading &&
            !error &&
            categoryId &&
            products.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map(
                  (product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  )
                )}
              </div>
            )}

          {/* ==================================================
              EMPTY STATE
              ================================================== */}

          {!loading &&
            !error &&
            (
              (categoryId &&
                products.length === 0) ||
              (!categoryId &&
                categories.length === 0)
            ) && (
              <div className="mx-auto max-w-2xl rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-10 text-center shadow-sm sm:p-14">
                {/* Icon */}
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary-light)]">
                  <PackageCheck
                    size={30}
                    className="text-[#1455a0] dark:text-[#68b0ff]"
                  />
                </div>

                {/* Heading */}
                <h2 className="mt-6 text-2xl font-bold text-[var(--foreground)]">
                  {categoryId
                    ? "Currently no product available for this category"
                    : "No import categories available"}
                </h2>

                {/* Description */}
                <p className="mt-3 leading-7 text-[var(--foreground)]/60">
                  {categoryId
                    ? "There are currently no published products available in this category."
                    : "Our import product catalogue is currently being updated."}
                </p>

                {/* Contact button */}
                <Link
                  href={`/${locale}/contact`}
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#1455a0] px-6 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#0f4688]"
                >
                  Discuss Requirements
                  <ArrowRight
                    size={17}
                  />
                </Link>
              </div>
            )}
        </div>
      </section>
    </main>
  );
}

/* ==============================================================
   PAGE
   ============================================================== */

export default function ImportProductsPage() {
  return (
    <Suspense fallback={null}>
      <ImportProductsContent />
    </Suspense>
  );
}