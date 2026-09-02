"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Download,
  FileJson,
  FileSpreadsheet,
  Package,
  RefreshCw,
  Save,
  Search,
  Upload,
  X,
} from "lucide-react";

type ProductStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "ARCHIVED";

type Category = {
  id: string;
  name: string;
  slug?: string;
  type: "IMPORT" | "EXPORT";
};

type Product = {
  id: string;
  name: string;
  slug: string;
  type: "IMPORT" | "EXPORT";
  status: ProductStatus;
  shortDescription: string | null;
  featured: boolean;
  categoryId: string | null;
  category: Category | null;
};

type EditableProduct = Product & {
  selected: boolean;
  dirty: boolean;
};

type UploadProduct = {
  id?: string;
  name: string;
  slug: string;
  type: "EXPORT";
  status?: ProductStatus;
  category?: string;
  categoryId?: string;
  shortDescription?: string;
  featured?: boolean;
};

type UpdateResult = {
  id?: string;
  name?: string;
  status: "updated" | "skipped" | "failed";
  message?: string;
};

const MAX_PRODUCTS = 500;

const CSV_HEADERS = [
  "id",
  "name",
  "slug",
  "type",
  "status",
  "category",
  "categoryId",
  "shortDescription",
  "featured",
];

function escapeCsv(value: unknown) {
  const text =
    value === null || value === undefined
      ? ""
      : String(value);

  if (
    text.includes(",") ||
    text.includes('"') ||
    text.includes("\n")
  ) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function downloadFile(
  filename: string,
  content: string,
  mimeType: string
) {
  const blob = new Blob([content], {
    type: mimeType,
  });

  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

function parseCsvLine(line: string) {
  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (
        insideQuotes &&
        line[i + 1] === '"'
      ) {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }

      continue;
    }

    if (char === "," && !insideQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);

  return result;
}

function parseCsv(text: string) {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim());

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0]).map((header) =>
    header.trim()
  );

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);

    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    return row;
  });
}

function booleanValue(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  return (
    normalized === "true" ||
    normalized === "1" ||
    normalized === "yes" ||
    normalized === "y"
  );
}

function normalizeStatus(
  value: unknown
): ProductStatus {
  const status = String(value ?? "")
    .trim()
    .toUpperCase();

  if (
    status === "PUBLISHED" ||
    status === "ARCHIVED"
  ) {
    return status;
  }

  return "DRAFT";
}

export default function ExportBulkUpdatePage() {
  const params = useParams();

  const locale =
    (params?.locale as string) || "en";

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [products, setProducts] =
    useState<EditableProduct[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<"ALL" | ProductStatus>("ALL");

  const [categoryFilter, setCategoryFilter] =
    useState("");

  const [selectedOnly, setSelectedOnly] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [results, setResults] =
    useState<UpdateResult[]>([]);

  const [showResults, setShowResults] =
    useState(false);

  /*
   * =========================================================
   * LOAD EXPORT PRODUCTS
   * =========================================================
   */

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const query = new URLSearchParams();

      query.set("type", "EXPORT");

      const response = await fetch(
        `/api/admin/products?${query.toString()}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load export products."
        );
      }

      const exportProducts =
        Array.isArray(data.products)
          ? data.products.filter(
              (product: Product) =>
                product.type === "EXPORT"
            )
          : [];

      setProducts(
        exportProducts.map(
          (product: Product) => ({
            ...product,
            selected: false,
            dirty: false,
          })
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load export products."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * =========================================================
   * LOAD EXPORT CATEGORIES
   * =========================================================
   */

  async function loadCategories() {
    try {
      const response = await fetch(
        "/api/admin/categories",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load categories."
        );
      }

      const exportCategories =
        Array.isArray(data.categories)
          ? data.categories.filter(
              (category: Category) =>
                category.type === "EXPORT"
            )
          : [];

      setCategories(exportCategories);
    } catch (err) {
      console.error(
        "EXPORT_CATEGORY_LOAD_ERROR",
        err
      );
    }
  }

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  /*
   * =========================================================
   * FILTERED PRODUCTS
   * =========================================================
   */

  const filteredProducts = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !searchValue ||
        product.name
          .toLowerCase()
          .includes(searchValue) ||
        product.slug
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" ||
        product.status === statusFilter;

      const matchesCategory =
        !categoryFilter ||
        product.categoryId ===
          categoryFilter;

      const matchesSelected =
        !selectedOnly ||
        product.selected;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory &&
        matchesSelected
      );
    });
  }, [
    products,
    search,
    statusFilter,
    categoryFilter,
    selectedOnly,
  ]);

  const selectedProducts = useMemo(
    () =>
      products.filter(
        (product) => product.selected
      ),
    [products]
  );

  const dirtyProducts = useMemo(
    () =>
      products.filter(
        (product) => product.dirty
      ),
    [products]
  );

  const publishedCount = useMemo(
    () =>
      products.filter(
        (product) =>
          product.status === "PUBLISHED"
      ).length,
    [products]
  );

  /*
   * =========================================================
   * UPDATE FIELD
   * =========================================================
   */

  function updateProduct(
    id: string,
    field: keyof EditableProduct,
    value: string | boolean | null
  ) {
    setProducts((current) =>
      current.map((product) =>
        product.id === id
          ? {
              ...product,
              [field]: value,
              dirty: true,
            }
          : product
      )
    );
  }

  /*
   * =========================================================
   * SELECT / DESELECT
   * =========================================================
   */

  function toggleProduct(id: string) {
    setProducts((current) =>
      current.map((product) =>
        product.id === id
          ? {
              ...product,
              selected: !product.selected,
            }
          : product
      )
    );
  }

  function selectVisible() {
    const visibleIds = new Set(
      filteredProducts.map(
        (product) => product.id
      )
    );

    setProducts((current) =>
      current.map((product) =>
        visibleIds.has(product.id)
          ? {
              ...product,
              selected: true,
            }
          : product
      )
    );
  }

  function deselectAll() {
    setProducts((current) =>
      current.map((product) => ({
        ...product,
        selected: false,
      }))
    );
  }

  /*
   * =========================================================
   * APPLY VALUE TO SELECTED PRODUCTS
   * =========================================================
   */

  function bulkSetStatus(
    status: ProductStatus
  ) {
    setProducts((current) =>
      current.map((product) =>
        product.selected
          ? {
              ...product,
              status,
              dirty: true,
            }
          : product
      )
    );
  }

  function bulkSetCategory(
    categoryId: string
  ) {
    const category =
      categories.find(
        (item) => item.id === categoryId
      ) || null;

    setProducts((current) =>
      current.map((product) =>
        product.selected
          ? {
              ...product,
              categoryId:
                categoryId || null,
              category,
              dirty: true,
            }
          : product
      )
    );
  }

  function bulkSetFeatured(
    featured: boolean
  ) {
    setProducts((current) =>
      current.map((product) =>
        product.selected
          ? {
              ...product,
              featured,
              dirty: true,
            }
          : product
      )
    );
  }

  /*
   * =========================================================
   * SAVE CHANGES
   * =========================================================
   */

  async function saveChanges() {
    const items = products.filter(
      (product) =>
        product.selected && product.dirty
    );

    if (items.length === 0) {
      setError(
        "Please select products with changes before saving."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");
      setResults([]);
      setShowResults(false);

      const updateResults: UpdateResult[] = [];

      for (const product of items) {
        try {
          const response = await fetch(
            `/api/admin/products/${product.id}`,
            {
              method: "PUT",
              credentials: "include",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                name: product.name,
                slug: product.slug,
                type: "EXPORT",
                status: product.status,
                categoryId:
                  product.categoryId,
                shortDescription:
                  product.shortDescription,
                featured:
                  product.featured,
              }),
            }
          );

          const data =
            await response.json();

          if (!response.ok) {
            updateResults.push({
              id: product.id,
              name: product.name,
              status: "failed",
              message:
                data.message ||
                "Unable to update product.",
            });

            continue;
          }

          updateResults.push({
            id: product.id,
            name: product.name,
            status: "updated",
            message:
              "Product updated successfully.",
          });
        } catch (err) {
          updateResults.push({
            id: product.id,
            name: product.name,
            status: "failed",
            message:
              err instanceof Error
                ? err.message
                : "Update failed.",
          });
        }
      }

      setResults(updateResults);
      setShowResults(true);

      const updated =
        updateResults.filter(
          (item) =>
            item.status === "updated"
        ).length;

      const failed =
        updateResults.filter(
          (item) =>
            item.status === "failed"
        ).length;

      if (failed === 0) {
        setSuccess(
          `${updated} export product${
            updated === 1 ? "" : "s"
          } updated successfully.`
        );
      } else {
        setSuccess(
          `${updated} updated, ${failed} failed.`
        );
      }

      await loadProducts();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Bulk update failed."
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * =========================================================
   * DOWNLOAD CSV
   * =========================================================
   */

  function downloadCsv() {
    const rows = products.map(
      (product) =>
        [
          product.id,
          product.name,
          product.slug,
          "EXPORT",
          product.status,
          product.category?.name || "",
          product.categoryId || "",
          product.shortDescription ||
            "",
          product.featured
            ? "true"
            : "false",
        ]
          .map(escapeCsv)
          .join(",")
    );

    const csv = [
      CSV_HEADERS.join(","),
      ...rows,
    ].join("\n");

    downloadFile(
      "krupali-export-products-update.csv",
      csv,
      "text/csv;charset=utf-8;"
    );
  }

  /*
   * =========================================================
   * DOWNLOAD JSON
   * =========================================================
   */

  function downloadJson() {
    const data = products.map(
      (product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        type: "EXPORT",
        status: product.status,
        category:
          product.category?.name || "",
        categoryId:
          product.categoryId || "",
        shortDescription:
          product.shortDescription || "",
        featured: product.featured,
      })
    );

    downloadFile(
      "krupali-export-products-update.json",
      JSON.stringify(
        {
          products: data,
        },
        null,
        2
      ),
      "application/json;charset=utf-8;"
    );
  }

  /*
   * =========================================================
   * UPLOAD FILE
   * =========================================================
   */

  async function handleFile(
    file: File
  ) {
    try {
      setUploading(true);
      setError("");
      setSuccess("");
      setResults([]);
      setShowResults(false);

      const text =
        await file.text();

      let rows: UploadProduct[] = [];

      if (
        file.name
          .toLowerCase()
          .endsWith(".json")
      ) {
        const parsed =
          JSON.parse(text);

        const source = Array.isArray(
          parsed
        )
          ? parsed
          : parsed.products;

        if (!Array.isArray(source)) {
          throw new Error(
            "JSON must contain a products array."
          );
        }

        rows = source.map(
          (item: Record<string, unknown>) => ({
            id: item.id
              ? String(item.id)
              : undefined,
            name: String(
              item.name || ""
            ),
            slug: String(
              item.slug || ""
            ),
            type: "EXPORT",
            status:
              normalizeStatus(
                item.status
              ),
            category:
              item.category
                ? String(
                    item.category
                  )
                : undefined,
            categoryId:
              item.categoryId
                ? String(
                    item.categoryId
                  )
                : undefined,
            shortDescription:
              item.shortDescription
                ? String(
                    item.shortDescription
                  )
                : "",
            featured:
              booleanValue(
                item.featured
              ),
          })
        );
      } else if (
        file.name
          .toLowerCase()
          .endsWith(".csv")
      ) {
        const parsed =
          parseCsv(text);

        rows = parsed.map(
          (item) => ({
            id:
              item.id?.trim() ||
              undefined,
            name:
              item.name?.trim() ||
              "",
            slug:
              item.slug?.trim() ||
              "",
            type: "EXPORT",
            status:
              normalizeStatus(
                item.status
              ),
            category:
              item.category?.trim() ||
              undefined,
            categoryId:
              item.categoryId?.trim() ||
              undefined,
            shortDescription:
              item.shortDescription ||
              "",
            featured:
              booleanValue(
                item.featured
              ),
          })
        );
      } else {
        throw new Error(
          "Please upload a CSV or JSON file."
        );
      }

      if (rows.length === 0) {
        throw new Error(
          "The uploaded file does not contain any products."
        );
      }

      if (
        rows.length >
        MAX_PRODUCTS
      ) {
        throw new Error(
          `Maximum ${MAX_PRODUCTS} products can be updated at once.`
        );
      }

      /*
       * Match uploaded rows against
       * existing EXPORT products only.
       */

      const existingById =
        new Map(
          products.map(
            (product) => [
              product.id,
              product,
            ]
          )
        );

      const existingBySlug =
        new Map(
          products.map(
            (product) => [
              `${product.slug}::EXPORT`,
              product,
            ]
          )
        );

      const unmatched: string[] = [];

      setProducts((current) => {
        const updated =
          [...current];

        for (const row of rows) {
          if (
            row.type !== "EXPORT"
          ) {
            unmatched.push(
              row.name ||
                row.slug ||
                "Unknown product"
            );

            continue;
          }

          let existing:
            | EditableProduct
            | undefined;

          if (row.id) {
            existing =
              existingById.get(
                row.id
              );
          }

          if (!existing && row.slug) {
            existing =
              existingBySlug.get(
                `${row.slug}::EXPORT`
              );
          }

          if (!existing) {
            unmatched.push(
              row.name ||
                row.slug ||
                "Unknown product"
            );

            continue;
          }

          const index =
            updated.findIndex(
              (item) =>
                item.id ===
                existing!.id
            );

          if (index === -1) {
            continue;
          }

          let categoryId =
            row.categoryId ||
            existing.categoryId;

          let category =
            existing.category;

          if (row.category) {
            const matchingCategory =
              categories.find(
                (item) =>
                  item.name
                    .toLowerCase() ===
                  row.category!
                    .toLowerCase()
              );

            if (
              matchingCategory
            ) {
              categoryId =
                matchingCategory.id;

              category =
                matchingCategory;
            }
          }

          if (
            row.categoryId
          ) {
            const matchingCategory =
              categories.find(
                (item) =>
                  item.id ===
                  row.categoryId
              );

            if (
              matchingCategory
            ) {
              category =
                matchingCategory;
            }
          }

          updated[index] = {
            ...updated[index],
            name:
              row.name ||
              updated[index].name,
            slug:
              row.slug ||
              updated[index].slug,
            status:
              row.status ||
              updated[index].status,
            categoryId,
            category,
            shortDescription:
              row.shortDescription ??
              updated[index]
                .shortDescription,
            featured:
              row.featured ??
              updated[index].featured,
            selected: true,
            dirty: true,
          };
        }

        return updated;
      });

      if (
        unmatched.length > 0
      ) {
        setError(
          `${unmatched.length} uploaded product${
            unmatched.length === 1
              ? ""
              : "s"
          } could not be matched to an existing EXPORT product.`
        );
      } else {
        setSuccess(
          `${rows.length} export product${
            rows.length === 1
              ? ""
              : "s"
          } loaded for bulk update.`
        );
      }
    } catch (err) {
      console.error(
        "EXPORT_BULK_UPLOAD_ERROR",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to process the file."
      );
    } finally {
      setUploading(false);

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }
    }
  }

  /*
   * =========================================================
   * STATUS HELPERS
   * =========================================================
   */

  function statusClass(
    status: ProductStatus
  ) {
    if (
      status === "PUBLISHED"
    ) {
      return "bg-emerald-500/10 text-emerald-600";
    }

    if (
      status === "ARCHIVED"
    ) {
      return "bg-gray-500/10 text-gray-500";
    }

    return "bg-amber-500/10 text-amber-600";
  }

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-6 text-[var(--foreground)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        {/* HEADER */}

        <header className="mb-8">
          <Link
            href={`/${locale}/admin/products`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]/50 transition hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>

          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                <Package className="h-7 w-7" />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">
                  EXPORT PRODUCTS
                </p>

                <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                  Bulk Update
                </h1>

                <p className="mt-1 text-sm text-[var(--foreground)]/55">
                  Update existing export products using CSV, JSON, or the table below.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={downloadCsv}
                disabled={
                  products.length === 0
                }
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-bold shadow-sm transition hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Download CSV
              </button>

              <button
                type="button"
                onClick={downloadJson}
                disabled={
                  products.length === 0
                }
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-bold shadow-sm transition hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FileJson className="h-4 w-4" />
                Download JSON
              </button>

              <button
                type="button"
                onClick={() => {
                  loadProducts();
                  loadCategories();
                }}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--surface-soft)] px-4 py-2.5 text-sm font-bold transition hover:bg-[var(--primary-light)]"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loading
                      ? "animate-spin"
                      : ""
                  }`}
                />
                Refresh
              </button>
            </div>
          </div>
        </header>

        {/* ALERTS */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-600">
            <X className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-600">
            <Check className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* STATS */}

        <section className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/45">
              Export Products
            </p>

            <p className="mt-2 text-3xl font-black">
              {products.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/45">
              Published
            </p>

            <p className="mt-2 text-3xl font-black text-emerald-600">
              {publishedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/45">
              Selected
            </p>

            <p className="mt-2 text-3xl font-black text-blue-600">
              {selectedProducts.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/45">
              Pending Changes
            </p>

            <p className="mt-2 text-3xl font-black text-amber-600">
              {dirtyProducts.length}
            </p>
          </div>
        </section>

        {/* IMPORT / UPLOAD */}

        <section className="mb-6 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl shadow-blue-950/5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-black">
                Update from CSV / JSON
              </h2>

              <p className="mt-1 text-sm text-[var(--foreground)]/55">
                Upload a file containing existing EXPORT product IDs or slugs.
                No new products will be created.
              </p>
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                className="hidden"
                onChange={(event) => {
                  const file =
                    event.target.files?.[0];

                  if (file) {
                    handleFile(file);
                  }
                }}
              />

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}

                {uploading
                  ? "Processing..."
                  : "Upload CSV / JSON"}
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 text-xs text-[var(--foreground)]/55 sm:grid-cols-3">
            <div className="rounded-xl bg-[var(--surface-soft)] p-3">
              <strong>1.</strong> Download current EXPORT products.
            </div>

            <div className="rounded-xl bg-[var(--surface-soft)] p-3">
              <strong>2.</strong> Edit the spreadsheet.
            </div>

            <div className="rounded-xl bg-[var(--surface-soft)] p-3">
              <strong>3.</strong> Upload and save changes.
            </div>
          </div>
        </section>

        {/* FILTERS */}

        <section className="mb-6 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl shadow-blue-950/5">
          <div className="grid gap-4 lg:grid-cols-[1fr_180px_220px_auto_auto]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground)]/35" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search export products..."
                className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] pl-11 pr-4 text-sm font-medium outline-none transition focus:border-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | "ALL"
                    | ProductStatus
                )
              }
              className="h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold outline-none focus:border-blue-500"
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

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value
                )
              }
              className="h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold outline-none focus:border-blue-500"
            >
              <option value="">
                All Export Categories
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                )
              )}
            </select>

            <button
              type="button"
              onClick={selectVisible}
              className="h-11 rounded-xl bg-blue-500/10 px-4 text-sm font-bold text-blue-600 transition hover:bg-blue-500 hover:text-white"
            >
              Select Visible
            </button>

            <button
              type="button"
              onClick={deselectAll}
              className="h-11 rounded-xl bg-[var(--surface-soft)] px-4 text-sm font-bold transition hover:bg-red-500/10 hover:text-red-600"
            >
              Clear Selection
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setSelectedOnly(
                  !selectedOnly
                )
              }
              className={`rounded-full px-4 py-2 text-xs font-black transition ${
                selectedOnly
                  ? "bg-blue-600 text-white"
                  : "bg-[var(--surface-soft)] text-[var(--foreground)]/60"
              }`}
            >
              {selectedOnly
                ? "Showing Selected"
                : "Show Selected Only"}
            </button>

            <span className="text-xs font-semibold text-[var(--foreground)]/45">
              Showing{" "}
              {filteredProducts.length}{" "}
              of {products.length} export products
            </span>
          </div>
        </section>

        {/* BULK ACTION BAR */}

        {selectedProducts.length >
          0 && (
          <section className="sticky top-4 z-20 mb-6 rounded-2xl border border-blue-500/20 bg-[var(--surface)] p-4 shadow-2xl shadow-blue-950/10 backdrop-blur">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm font-black">
                  {selectedProducts.length} selected
                </p>

                <p className="text-xs text-[var(--foreground)]/50">
                  Apply changes to selected EXPORT products.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <select
                  defaultValue=""
                  onChange={(event) => {
                    if (
                      event.target.value
                    ) {
                      bulkSetStatus(
                        event.target
                          .value as ProductStatus
                      );

                      event.target.value =
                        "";
                    }
                  }}
                  className="h-10 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-bold"
                >
                  <option value="">
                    Set Status
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

                <select
                  defaultValue=""
                  onChange={(event) => {
                    bulkSetCategory(
                      event.target.value
                    );

                    event.target.value =
                      "";
                  }}
                  className="h-10 max-w-[220px] rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-bold"
                >
                  <option value="">
                    Set Category
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    )
                  )}
                </select>

                <button
                  type="button"
                  onClick={() =>
                    bulkSetFeatured(
                      true
                    )
                  }
                  className="h-10 rounded-xl bg-amber-500/10 px-4 text-xs font-bold text-amber-600 hover:bg-amber-500 hover:text-white"
                >
                  Featured
                </button>

                <button
                  type="button"
                  onClick={() =>
                    bulkSetFeatured(
                      false
                    )
                  }
                  className="h-10 rounded-xl bg-[var(--surface-soft)] px-4 text-xs font-bold"
                >
                  Not Featured
                </button>

                <button
                  type="button"
                  onClick={saveChanges}
                  disabled={
                    saving ||
                    dirtyProducts.length ===
                      0
                  }
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-5 text-xs font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}

                  {saving
                    ? "Saving..."
                    : `Save ${dirtyProducts.length} Changes`}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* TABLE */}

        <section className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-xl shadow-blue-950/5">
          {loading ? (
            <div className="p-20 text-center">
              <RefreshCw className="mx-auto h-10 w-10 animate-spin text-blue-600" />

              <p className="mt-4 text-sm font-bold text-[var(--foreground)]/50">
                Loading export products...
              </p>
            </div>
          ) : filteredProducts.length ===
            0 ? (
            <div className="p-20 text-center">
              <Package className="mx-auto h-12 w-12 text-[var(--foreground)]/20" />

              <h2 className="mt-5 text-xl font-black">
                No export products found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-[var(--foreground)]/50">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1250px]">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-left">
                    <th className="w-14 px-4 py-4">
                      <input
                        type="checkbox"
                        checked={
                          filteredProducts.length >
                            0 &&
                          filteredProducts.every(
                            (product) =>
                              product.selected
                          )
                        }
                        onChange={(event) => {
                          if (
                            event.target
                              .checked
                          ) {
                            selectVisible();
                          } else {
                            const visibleIds =
                              new Set(
                                filteredProducts.map(
                                  (product) =>
                                    product.id
                                )
                              );

                            setProducts(
                              (
                                current
                              ) =>
                                current.map(
                                  (
                                    product
                                  ) =>
                                    visibleIds.has(
                                      product.id
                                    )
                                      ? {
                                          ...product,
                                          selected:
                                            false,
                                        }
                                      : product
                                )
                            );
                          }
                        }}
                      />
                    </th>

                    <th className="px-4 py-4 text-xs font-black uppercase tracking-wider">
                      Product
                    </th>

                    <th className="w-48 px-4 py-4 text-xs font-black uppercase tracking-wider">
                      Slug
                    </th>

                    <th className="w-40 px-4 py-4 text-xs font-black uppercase tracking-wider">
                      Category
                    </th>

                    <th className="w-36 px-4 py-4 text-xs font-black uppercase tracking-wider">
                      Status
                    </th>

                    <th className="w-36 px-4 py-4 text-xs font-black uppercase tracking-wider">
                      Featured
                    </th>

                    <th className="w-16 px-4 py-4 text-xs font-black uppercase tracking-wider">
                      State
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map(
                    (product) => (
                      <tr
                        key={product.id}
                        className={`border-b border-[var(--border)] transition hover:bg-[var(--surface-soft)] ${
                          product.dirty
                            ? "bg-amber-500/5"
                            : ""
                        }`}
                      >
                        {/* SELECT */}

                        <td className="px-4 py-4 align-top">
                          <input
                            type="checkbox"
                            checked={
                              product.selected
                            }
                            onChange={() =>
                              toggleProduct(
                                product.id
                              )
                            }
                          />
                        </td>

                        {/* PRODUCT */}

                        <td className="px-4 py-4 align-top">
                          <input
                            value={
                              product.name
                            }
                            onChange={(
                              event
                            ) =>
                              updateProduct(
                                product.id,
                                "name",
                                event.target
                                  .value
                              )
                            }
                            className="w-full rounded-xl border border-transparent bg-transparent px-3 py-2 text-sm font-black outline-none transition hover:border-[var(--border)] focus:border-blue-500 focus:bg-[var(--background)]"
                          />

                          <p className="mt-1 px-3 text-[10px] font-mono text-[var(--foreground)]/30">
                            {product.id}
                          </p>

                          <textarea
                            value={
                              product.shortDescription ||
                              ""
                            }
                            onChange={(
                              event
                            ) =>
                              updateProduct(
                                product.id,
                                "shortDescription",
                                event.target
                                  .value
                              )
                            }
                            rows={2}
                            placeholder="Short description..."
                            className="mt-2 w-full resize-none rounded-xl border border-transparent bg-transparent px-3 py-2 text-xs text-[var(--foreground)]/60 outline-none transition hover:border-[var(--border)] focus:border-blue-500 focus:bg-[var(--background)]"
                          />
                        </td>

                        {/* SLUG */}

                        <td className="px-4 py-4 align-top">
                          <input
                            value={
                              product.slug
                            }
                            onChange={(
                              event
                            ) =>
                              updateProduct(
                                product.id,
                                "slug",
                                event.target
                                  .value
                              )
                            }
                            className="w-full rounded-xl border border-transparent bg-transparent px-3 py-2 font-mono text-xs outline-none transition hover:border-[var(--border)] focus:border-blue-500 focus:bg-[var(--background)]"
                          />
                        </td>

                        {/* CATEGORY */}

                        <td className="px-4 py-4 align-top">
                          <select
                            value={
                              product.categoryId ||
                              ""
                            }
                            onChange={(
                              event
                            ) => {
                              const category =
                                categories.find(
                                  (
                                    item
                                  ) =>
                                    item.id ===
                                    event
                                      .target
                                      .value
                                ) ||
                                null;

                              setProducts(
                                (
                                  current
                                ) =>
                                  current.map(
                                    (
                                      item
                                    ) =>
                                      item.id ===
                                      product.id
                                        ? {
                                            ...item,
                                            categoryId:
                                              event
                                                .target
                                                .value ||
                                              null,
                                            category,
                                            dirty:
                                              true,
                                          }
                                        : item
                                  )
                              );
                            }}
                            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs font-bold outline-none focus:border-blue-500"
                          >
                            <option value="">
                              No Category
                            </option>

                            {categories.map(
                              (
                                category
                              ) => (
                                <option
                                  key={
                                    category.id
                                  }
                                  value={
                                    category.id
                                  }
                                >
                                  {
                                    category.name
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </td>

                        {/* STATUS */}

                        <td className="px-4 py-4 align-top">
                          <select
                            value={
                              product.status
                            }
                            onChange={(
                              event
                            ) =>
                              updateProduct(
                                product.id,
                                "status",
                                event.target
                                  .value as ProductStatus
                              )
                            }
                            className={`w-full rounded-xl border-0 px-3 py-2 text-xs font-black outline-none ${statusClass(
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

                        <td className="px-4 py-4 align-top">
                          <button
                            type="button"
                            onClick={() =>
                              updateProduct(
                                product.id,
                                "featured",
                                !product.featured
                              )
                            }
                            className={`rounded-xl px-4 py-2 text-xs font-black transition ${
                              product.featured
                                ? "bg-amber-500 text-white"
                                : "bg-[var(--surface-soft)] text-[var(--foreground)]/45 hover:text-amber-600"
                            }`}
                          >
                            {product.featured
                              ? "Featured"
                              : "No"}
                          </button>
                        </td>

                        {/* DIRTY */}

                        <td className="px-4 py-4 align-top">
                          {product.dirty ? (
                            <div
                              title="Unsaved changes"
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-600"
                            >
                              <Save className="h-4 w-4" />
                            </div>
                          ) : (
                            <div
                              title="Saved"
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600"
                            >
                              <Check className="h-4 w-4" />
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* RESULTS */}

        {showResults && (
          <section className="mt-6 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black">
                  Update Results
                </h2>

                <p className="mt-1 text-sm text-[var(--foreground)]/50">
                  Results from the latest bulk update.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowResults(false);
                  setResults([]);
                }}
                className="rounded-xl p-2 text-[var(--foreground)]/40 hover:bg-[var(--surface-soft)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
              <table className="w-full">
                <thead>
                  <tr className="bg-[var(--surface-soft)] text-left">
                    <th className="px-4 py-3 text-xs font-black uppercase">
                      Product
                    </th>

                    <th className="px-4 py-3 text-xs font-black uppercase">
                      Result
                    </th>

                    <th className="px-4 py-3 text-xs font-black uppercase">
                      Message
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {results.map(
                    (result, index) => (
                      <tr
                        key={`${result.id}-${index}`}
                        className="border-t border-[var(--border)]"
                      >
                        <td className="px-4 py-3 text-sm font-bold">
                          {result.name ||
                            result.id ||
                            "Unknown"}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                              result.status ===
                              "updated"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-red-500/10 text-red-600"
                            }`}
                          >
                            {result.status ===
                            "updated"
                              ? "Updated"
                              : "Failed"}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-xs text-[var(--foreground)]/55">
                          {result.message}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* FOOTER NOTE */}

        <div className="mt-6 rounded-2xl border border-blue-500/10 bg-blue-500/5 p-4 text-xs leading-6 text-[var(--foreground)]/55">
          <strong className="text-[var(--foreground)]">
            Important:
          </strong>{" "}
          This page updates{" "}
          <strong>existing EXPORT products only</strong>.
          Uploaded products are matched by product ID first,
          then by slug. It will not create new products.
        </div>
      </div>
    </main>
  );
}