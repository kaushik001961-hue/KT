"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Edit3,
  Eye,
  Package,
  Plus,
  Search,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import BulkImageUpload from "@/components/admin/BulkImageUpload";

type ProductStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "ARCHIVED";

type Product = {
  id: string;
  name: string;
  slug: string;
  type: "IMPORT" | "EXPORT";
  status: ProductStatus;
  shortDescription: string | null;
  featured: boolean;
  categoryId: string | null;

  category: {
    id: string;
    name: string;
  } | null;

  images: {
    id: string;
    url: string;
    alt: string | null;
  }[];

  createdAt: string;
  updatedAt: string;
};

type Category = {
  id: string;
  name: string;
  type: "IMPORT" | "EXPORT";
  active: boolean;
};

export default function ExportProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showBulkImages, setShowBulkImages] = useState(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<"ALL" | ProductStatus>("ALL");

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      params.set("type", "EXPORT");

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (categoryFilter) {
        params.set("categoryId", categoryFilter);
      }

      if (statusFilter !== "ALL") {
        params.set("status", statusFilter);
      }

      const response = await fetch(
        `/api/admin/products?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to load products."
        );
      }

      setProducts(result.products || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const response = await fetch(
        "/api/admin/categories",
        {
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to load categories."
        );
      }

      setCategories(
        (result.categories || []).filter(
          (category: Category) =>
            category.type === "EXPORT"
        )
      );
    } catch (err) {
      console.error(
        "CATEGORY_LOAD_ERROR",
        err
      );
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 250);

    return () => clearTimeout(timer);
  }, [
    search,
    categoryFilter,
    statusFilter,
  ]);

  async function deleteProduct(
    product: Product
  ) {
    const confirmed = window.confirm(
      `Delete "${product.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/products/${product.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to delete product."
        );
      }

      setSuccess(
        "Product deleted successfully."
      );

      await loadProducts();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete product."
      );
    }
  }

  async function updateProduct(
    product: Product,
    changes: {
      status?: ProductStatus;
      featured?: boolean;
    }
  ) {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/products/${product.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: product.name,
            slug: product.slug,
            type: product.type,

            status:
              changes.status ??
              product.status,

            categoryId:
              product.categoryId,

            shortDescription:
              product.shortDescription,

            featured:
              changes.featured ??
              product.featured,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to update product."
        );
      }

      setSuccess(
        changes.status
          ? changes.status === "PUBLISHED"
            ? "Product published."
            : changes.status === "DRAFT"
              ? "Product moved to draft."
              : "Product archived."
          : changes.featured
            ? "Product marked as featured."
            : "Product removed from featured."
      );

      await loadProducts();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update product."
      );
    }
  }

  function statusClass(
    status: ProductStatus
  ) {
    if (status === "PUBLISHED") {
      return "bg-emerald-500/10 text-emerald-600";
    }

    if (status === "ARCHIVED") {
      return "bg-gray-500/10 text-gray-500";
    }

    return "bg-amber-500/10 text-amber-600";
  }

  const activeProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.status === "PUBLISHED"
      ).length,
    [products]
  );

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-6 text-[var(--foreground)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <header className="mb-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]/45 transition hover:text-blue-600"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>

              <div className="mt-5 flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
                  <Package className="h-7 w-7" />
                </div>

                <div>

                  <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                    Product Management
                  </p>

                  <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                    Export Products
                  </h1>

                </div>

              </div>

              <p className="mt-3 max-w-2xl text-sm text-[var(--foreground)]/55">
                Manage products that Krupali Traders
                exports to international markets.
              </p>

            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/admin/products/export/bulk-update"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-6 py-3.5 text-sm font-bold text-emerald-500 transition hover:-translate-y-0.5 hover:bg-emerald-500 hover:text-white"
              >
                <Upload className="h-5 w-5" />
                Bulk Update
              </Link>

              <button
                type="button"
                onClick={() => setShowBulkImages(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-6 py-3.5 text-sm font-bold text-purple-600 transition hover:-translate-y-0.5 hover:bg-purple-500 hover:text-white"
              >
                <Upload className="h-5 w-5" />
                Bulk Images
              </button>

              <Link
                href="/admin/products/export/new"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5"
              >
                <Plus className="h-5 w-5" />
                Add Export Product
              </Link>
            </div>

          </div>
        </header>

        {showBulkImages && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
            <div className="mx-auto flex min-h-full max-w-3xl items-center justify-center py-8">
              <BulkImageUpload
                type="EXPORT"
                onClose={() => setShowBulkImages(false)}
                onComplete={loadProducts}
              />
            </div>
          </div>
        )}

        {/* ALERTS */}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm font-semibold text-emerald-600">
            {success}
          </div>
        )}

        {/* SUMMARY */}

        <section className="mb-6 grid gap-4 sm:grid-cols-3">

          <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-lg shadow-blue-950/5">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/40">
              Total Results
            </p>

            <p className="mt-2 text-3xl font-black">
              {products.length}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-lg shadow-blue-950/5">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/40">
              Published
            </p>

            <p className="mt-2 text-3xl font-black text-emerald-600">
              {activeProducts}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-lg shadow-blue-950/5">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/40">
              Categories
            </p>

            <p className="mt-2 text-3xl font-black">
              {categories.length}
            </p>
          </div>

        </section>

        {/* FILTERS */}

        <section className="mb-6 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-lg shadow-blue-950/5">

          <div className="grid gap-4 md:grid-cols-[1fr_220px_180px]">

            <div className="relative">

              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--foreground)]/35" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search export products..."
                className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] pl-12 pr-4 text-sm text-[var(--foreground)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

            </div>

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value
                )
              }
              className="h-12 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-blue-500"
            >

              <option value="">
                All Categories
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}

            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | "ALL"
                    | ProductStatus
                )
              }
              className="h-12 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-blue-500"
            >

              <option value="ALL">
                All Status
              </option>

              <option value="PUBLISHED">
                Published
              </option>

              <option value="DRAFT">
                Draft
              </option>

              <option value="ARCHIVED">
                Archived
              </option>

            </select>

          </div>

        </section>

        {/* TABLE */}

        <section className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-xl shadow-blue-950/5">

          {loading ? (

            <div className="p-16 text-center">

              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-600" />

              <p className="mt-4 text-sm font-semibold text-[var(--foreground)]/50">
                Loading export products...
              </p>

            </div>

          ) : products.length === 0 ? (

            <div className="p-16 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
                <Package className="h-8 w-8" />
              </div>

              <h2 className="mt-5 text-xl font-black">
                No export products found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-[var(--foreground)]/50">
                {search ||
                categoryFilter ||
                statusFilter !== "ALL"
                  ? "Try changing your search or filters."
                  : "Start building your export catalogue by adding your first product."}
              </p>

              {!search &&
                !categoryFilter &&
                statusFilter === "ALL" && (
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <Link
                      href="/admin/products/export/bulk-update"
                      className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-6 py-3 text-sm font-bold text-emerald-500 transition hover:bg-emerald-500 hover:text-white"
                    >
                      <Upload className="h-4 w-4" />
                      Bulk Update
                    </Link>

                    <Link
                      href="/admin/products/export/new"
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-sm font-bold text-white"
                    >
                      <Plus className="h-4 w-4" />
                      Add Export Product
                    </Link>
                  </div>
                )}

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1000px]">

                <thead>

                  <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)]">

                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-[var(--foreground)]/40">
                      Product
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-[var(--foreground)]/40">
                      Category
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-[var(--foreground)]/40">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-[var(--foreground)]/40">
                      Featured
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wider text-[var(--foreground)]/40">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {products.map((product) => {

                    const image =
                      product.images[0];

                    return (
                      <tr
                        key={product.id}
                        className="border-b border-[var(--border)] last:border-0 transition hover:bg-[var(--surface-soft)]/60"
                      >

                        {/* PRODUCT */}

                        <td className="px-5 py-5">

                          <div className="flex items-center gap-4">

                            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-500/10 text-blue-600">

                              {image ? (
                                <img
                                  src={image.url}
                                  alt={
                                    image.alt ||
                                    product.name
                                  }
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Package className="h-6 w-6" />
                              )}

                            </div>

                            <div className="min-w-0">

                              <p className="truncate font-black">
                                {product.name}
                              </p>

                              <p className="mt-1 truncate text-xs text-[var(--foreground)]/40">
                                /{product.slug}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* CATEGORY */}

                        <td className="px-5 py-5">

                          {product.category ? (
                            <span className="rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-600">
                              {product.category.name}
                            </span>
                          ) : (
                            <span className="text-sm text-[var(--foreground)]/35">
                              No category
                            </span>
                          )}

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-5">

                          <select
                            value={product.status}
                            onChange={(event) =>
                              updateProduct(
                                product,
                                {
                                  status:
                                    event.target
                                      .value as ProductStatus,
                                }
                              )
                            }
                            className={`rounded-full border-0 px-3 py-1.5 text-xs font-bold outline-none ${statusClass(
                              product.status
                            )}`}
                          >

                            <option value="PUBLISHED">
                              Published
                            </option>

                            <option value="DRAFT">
                              Draft
                            </option>

                            <option value="ARCHIVED">
                              Archived
                            </option>

                          </select>

                        </td>

                        {/* FEATURED */}

                        <td className="px-5 py-5">

                          <button
                            type="button"
                            onClick={() =>
                              updateProduct(
                                product,
                                {
                                  featured:
                                    !product.featured,
                                }
                              )
                            }
                            className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                              product.featured
                                ? "bg-amber-500/10 text-amber-500"
                                : "bg-[var(--surface-soft)] text-[var(--foreground)]/30 hover:text-amber-500"
                            }`}
                            title={
                              product.featured
                                ? "Remove featured"
                                : "Make featured"
                            }
                          >
                            <Star
                              className="h-4 w-4"
                              fill={
                                product.featured
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          </button>

                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-5">

                          <div className="flex justify-end gap-2">

                            <Link
                              href={`/products/export/${product.slug}`}
                              target="_blank"
                              className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 transition hover:bg-blue-500 hover:text-white"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>

                            <Link
                              href={`/admin/products/export/${product.id}`}
                              className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 transition hover:bg-indigo-500 hover:text-white"
                              title="Edit"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Link>

                            <button
                              type="button"
                              onClick={() =>
                                deleteProduct(
                                  product
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-600 transition hover:bg-red-500 hover:text-white"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </div>
    </main>
  );
}