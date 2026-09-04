"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Download,
  FileJson,
  FileSpreadsheet,
  PackagePlus,
  RefreshCw,
  Upload,
  X,
} from "lucide-react";

type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

type Category = {
  id: string;
  name: string;
  slug?: string;
  type: "IMPORT" | "EXPORT";
};

type ImportImage = {
  url: string;
  alt?: string;
  sortOrder?: number;
};

type ImportProduct = {
  name: string;
  slug: string;
  type: "EXPORT";
  status: ProductStatus;
  category?: string;
  categoryId?: string;
  shortDescription?: string;
  description?: string;
  specifications?: string;
  countryOfOrigin?: string;
  packaging?: string;
  minimumOrderQuantity?: string;
  featured: boolean;
  images?: ImportImage[];
};

type ImportResult = {
  name?: string;
  slug?: string;
  status: "created" | "updated" | "skipped" | "failed";
  message?: string;
};

const MAX_PRODUCTS = 500;

const CSV_HEADERS = [
  "name",
  "slug",
  "type",
  "status",
  "category",
  "categoryId",
  "shortDescription",
  "description",
  "specifications",
  "countryOfOrigin",
  "packaging",
  "minimumOrderQuantity",
  "featured",
  "images",
];

const SAMPLE_PRODUCT: ImportProduct = {
  name: "Premium Black Pepper",
  slug: "premium-black-pepper",
  type: "EXPORT",
  status: "PUBLISHED",
  category: "Indian Spices",
  shortDescription: "Premium Indian black pepper suitable for international wholesale and food processing requirements.",
  description:
    "Premium quality black pepper sourced from trusted suppliers and prepared for international export markets with consistent quality, packaging and documentation.",
  specifications: "Grade: Premium; Moisture: Max 12%; Foreign Matter: Max 1%",
  countryOfOrigin: "India",
  packaging: "25 kg / 50 kg PP bags",
  minimumOrderQuantity: "500 kg",
  featured: false,
  images: [
    {
      url: "https://placehold.co/1200x800/png?text=Premium+Black+Pepper",
      alt: "Premium Black Pepper",
      sortOrder: 0,
    },
  ],
};

function escapeCsv(value: unknown) {
  const text =
    value === null || value === undefined ? "" : String(value);

  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
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
      if (insideQuotes && line[i + 1] === '"') {
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

  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((header) => header.trim());

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
  if (typeof value === "boolean") return value;

  const normalized = String(value ?? "").trim().toLowerCase();
  return ["true", "1", "yes", "y"].includes(normalized);
}

function normalizeStatus(value: unknown): ProductStatus {
  const status = String(value ?? "").trim().toUpperCase();

  if (status === "PUBLISHED" || status === "ARCHIVED") return status;
  return "DRAFT";
}

function parseImages(value: unknown): ImportImage[] {
  if (Array.isArray(value)) {
    return value
      .map((image, index) => {
        if (typeof image === "string") {
          return { url: image.trim(), sortOrder: index };
        }

        if (image && typeof image === "object") {
          const item = image as Record<string, unknown>;
          return {
            url: String(item.url || "").trim(),
            alt: item.alt ? String(item.alt) : undefined,
            sortOrder:
              item.sortOrder !== undefined
                ? Number(item.sortOrder) || index
                : index,
          };
        }

        return { url: "", sortOrder: index };
      })
      .filter((image) => image.url);
  }

  const text = String(value ?? "").trim();
  if (!text) return [];

  return text
    .split("|")
    .map((url, index) => ({
      url: url.trim(),
      sortOrder: index,
    }))
    .filter((image) => image.url);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ExportBulkImportPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [rows, setRows] = useState<ImportProduct[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [results, setResults] = useState<ImportResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  async function loadCategories() {
    try {
      setLoadingCategories(true);
      const response = await fetch("/api/admin/categories", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load categories.");
      }

      setCategories(
        Array.isArray(data.categories)
          ? data.categories.filter(
              (category: Category) => category.type === "EXPORT"
            )
          : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load export categories."
      );
    } finally {
      setLoadingCategories(false);
    }
  }

  async function handleFile(file: File) {
    try {
      setProcessing(true);
      setError("");
      setSuccess("");
      setResults([]);
      setShowResults(false);

      const text = await file.text();
      let parsedRows: ImportProduct[] = [];

      if (file.name.toLowerCase().endsWith(".json")) {
        const parsed = JSON.parse(text);
        const source = Array.isArray(parsed) ? parsed : parsed.products;

        if (!Array.isArray(source)) {
          throw new Error("JSON must contain a products array.");
        }

        parsedRows = source.map((item: Record<string, unknown>) => ({
          name: String(item.name || "").trim(),
          slug: String(item.slug || "").trim(),
          type: "EXPORT",
          status: normalizeStatus(item.status),
          category: item.category ? String(item.category).trim() : undefined,
          categoryId: item.categoryId
            ? String(item.categoryId).trim()
            : undefined,
          shortDescription: item.shortDescription
            ? String(item.shortDescription)
            : "",
          description: item.description ? String(item.description) : "",
          specifications: item.specifications
            ? String(item.specifications)
            : "",
          countryOfOrigin: item.countryOfOrigin
            ? String(item.countryOfOrigin)
            : "",
          packaging: item.packaging ? String(item.packaging) : "",
          minimumOrderQuantity: item.minimumOrderQuantity
            ? String(item.minimumOrderQuantity)
            : "",
          featured: booleanValue(item.featured),
          images: parseImages(item.images),
        }));
      } else if (file.name.toLowerCase().endsWith(".csv")) {
        const parsed = parseCsv(text);

        parsedRows = parsed.map((item) => ({
          name: item.name?.trim() || "",
          slug: item.slug?.trim() || "",
          type: "EXPORT",
          status: normalizeStatus(item.status),
          category: item.category?.trim() || undefined,
          categoryId: item.categoryId?.trim() || undefined,
          shortDescription: item.shortDescription || "",
          description: item.description || "",
          specifications: item.specifications || "",
          countryOfOrigin: item.countryOfOrigin || "",
          packaging: item.packaging || "",
          minimumOrderQuantity: item.minimumOrderQuantity || "",
          featured: booleanValue(item.featured),
          images: parseImages(item.images),
        }));
      } else {
        throw new Error("Please upload a CSV or JSON file.");
      }

      if (parsedRows.length === 0) {
        throw new Error("The uploaded file does not contain any products.");
      }

      if (parsedRows.length > MAX_PRODUCTS) {
        throw new Error(
          `Maximum ${MAX_PRODUCTS} products can be imported at once.`
        );
      }

      const seenSlugs = new Set<string>();
      const validationErrors: string[] = [];

      parsedRows = parsedRows.map((row, index) => {
        const slug = row.slug || slugify(row.name);

        if (!row.name) {
          validationErrors.push(`Row ${index + 2}: product name is required.`);
        }

        if (!slug) {
          validationErrors.push(
            `Row ${index + 2}: slug is required or must be derivable from name.`
          );
        }

        const normalizedSlug = slug.toLowerCase();

        if (seenSlugs.has(normalizedSlug)) {
          validationErrors.push(
            `Row ${index + 2}: duplicate slug "${slug}" in uploaded file.`
          );
        }

        seenSlugs.add(normalizedSlug);

        let categoryId = row.categoryId;
        if (!categoryId && row.category) {
          const category = categories.find(
            (item) =>
              item.name.toLowerCase() === row.category!.toLowerCase()
          );
          if (category) categoryId = category.id;
        }

        return {
          ...row,
          slug,
          type: "EXPORT",
          categoryId,
        };
      });

      if (validationErrors.length > 0) {
        throw new Error(validationErrors.slice(0, 20).join("\n"));
      }

      setRows(parsedRows);
      setSuccess(
        `${parsedRows.length} EXPORT product${
          parsedRows.length === 1 ? "" : "s"
        } ready to import.`
      );
    } catch (err) {
      console.error("EXPORT_BULK_IMPORT_PARSE_ERROR", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to process the file."
      );
      setRows([]);
    } finally {
      setProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function downloadCsvTemplate() {
    const row = [
      SAMPLE_PRODUCT.name,
      SAMPLE_PRODUCT.slug,
      "EXPORT",
      SAMPLE_PRODUCT.status,
      SAMPLE_PRODUCT.category,
      SAMPLE_PRODUCT.categoryId || "",
      SAMPLE_PRODUCT.shortDescription || "",
      SAMPLE_PRODUCT.description || "",
      SAMPLE_PRODUCT.specifications || "",
      SAMPLE_PRODUCT.countryOfOrigin || "",
      SAMPLE_PRODUCT.packaging || "",
      SAMPLE_PRODUCT.minimumOrderQuantity || "",
      SAMPLE_PRODUCT.featured ? "true" : "false",
      SAMPLE_PRODUCT.images?.map((image) => image.url).join("|") || "",
    ]
      .map(escapeCsv)
      .join(",");

    downloadFile(
      "krupali-export-products-import-template.csv",
      [CSV_HEADERS.join(","), row].join("\n"),
      "text/csv;charset=utf-8;"
    );
  }

  function downloadJsonTemplate() {
    downloadFile(
      "krupali-export-products-import-template.json",
      JSON.stringify(
        {
          products: [SAMPLE_PRODUCT],
        },
        null,
        2
      ),
      "application/json;charset=utf-8;"
    );
  }

  function removeRow(index: number) {
    setRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
  }

  function updateRow(
    index: number,
    field: keyof ImportProduct,
    value: string | boolean
  ) {
    setRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      )
    );
  }

  async function submitImport() {
    if (rows.length === 0) {
      setError("Please upload a CSV or JSON file first.");
      return;
    }

    try {
      setImporting(true);
      setError("");
      setSuccess("");
      setResults([]);
      setShowResults(false);

      const response = await fetch("/api/admin/products/import", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          products: rows.map((row) => ({
            ...row,
            type: "EXPORT",
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Bulk import failed.");
      }

      const importedResults: ImportResult[] = Array.isArray(data.results)
        ? data.results
        : [];

      setResults(importedResults);
      setShowResults(true);

      const created =
        Number(data.created) ||
        importedResults.filter((item) => item.status === "created").length;

      const updated =
        Number(data.updated) ||
        importedResults.filter((item) => item.status === "updated").length;

      const failed =
        Number(data.failed) ||
        importedResults.filter((item) => item.status === "failed").length;

      const skipped =
        Number(data.skipped) ||
        importedResults.filter((item) => item.status === "skipped").length;

      setSuccess(
        `Import completed: ${created} created, ${updated} updated, ${skipped} skipped, ${failed} failed.`
      );
    } catch (err) {
      console.error("EXPORT_BULK_IMPORT_ERROR", err);
      setError(
        err instanceof Error ? err.message : "Bulk import failed."
      );
    } finally {
      setImporting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-6 text-[var(--foreground)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <header className="mb-8">
          <Link
            href={`/${locale}/admin/products/export`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]/50 transition hover:text-emerald-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Export Products
          </Link>

          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                <PackagePlus className="h-7 w-7" />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">
                  EXPORT PRODUCTS
                </p>
                <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                  Bulk Import
                </h1>
                <p className="mt-1 text-sm text-[var(--foreground)]/55">
                  Add export products in bulk using CSV or JSON.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={downloadCsvTemplate}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-bold shadow-sm transition hover:bg-[var(--surface-soft)]"
              >
                <FileSpreadsheet className="h-4 w-4" />
                CSV Template
              </button>

              <button
                type="button"
                onClick={downloadJsonTemplate}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-bold shadow-sm transition hover:bg-[var(--surface-soft)]"
              >
                <FileJson className="h-4 w-4" />
                JSON Template
              </button>

              <button
                type="button"
                onClick={loadCategories}
                disabled={loadingCategories}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--surface-soft)] px-4 py-2.5 text-sm font-bold transition hover:bg-[var(--primary-light)]"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loadingCategories ? "animate-spin" : ""
                  }`}
                />
                Refresh Categories
              </button>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 whitespace-pre-line flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-600">
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

        <section className="mb-6 rounded-[2rem] border border-emerald-500/20 bg-[var(--surface)] p-6 shadow-xl shadow-emerald-950/5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-black">Upload Export Products</h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--foreground)]/55">
                Upload up to {MAX_PRODUCTS} products. The import always sends
                <strong> EXPORT </strong>
                as the product type, so an IMPORT product cannot accidentally
                be created from this page.
              </p>
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={processing}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {processing ? "Processing..." : "Upload CSV / JSON"}
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 text-xs text-[var(--foreground)]/55 sm:grid-cols-4">
            <div className="rounded-xl bg-[var(--surface-soft)] p-3">
              <strong>1.</strong> Download the template.
            </div>
            <div className="rounded-xl bg-[var(--surface-soft)] p-3">
              <strong>2.</strong> Add your export products.
            </div>
            <div className="rounded-xl bg-[var(--surface-soft)] p-3">
              <strong>3.</strong> Upload and preview.
            </div>
            <div className="rounded-xl bg-[var(--surface-soft)] p-3">
              <strong>4.</strong> Click Import Products.
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl shadow-blue-950/5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black">Import Preview</h2>
              <p className="mt-1 text-sm text-[var(--foreground)]/50">
                Review the products before sending them to the server.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-full bg-emerald-500/10 px-4 py-2 text-xs font-black text-emerald-600">
                {rows.length} products
              </span>

              <button
                type="button"
                onClick={submitImport}
                disabled={importing || rows.length === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {importing && (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                )}
                {importing ? "Importing..." : "Import Products"}
              </button>
            </div>
          </div>

          {rows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border)] p-12 text-center">
              <Upload className="mx-auto h-10 w-10 text-[var(--foreground)]/20" />
              <h3 className="mt-4 text-lg font-black">
                No products loaded
              </h3>
              <p className="mt-2 text-sm text-[var(--foreground)]/50">
                Upload a CSV or JSON file to see the import preview.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
              <table className="w-full min-w-[1500px]">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-left">
                    <th className="w-14 px-4 py-4 text-xs font-black uppercase">
                      #
                    </th>
                    <th className="w-64 px-4 py-4 text-xs font-black uppercase">
                      Product
                    </th>
                    <th className="w-52 px-4 py-4 text-xs font-black uppercase">
                      Slug
                    </th>
                    <th className="w-44 px-4 py-4 text-xs font-black uppercase">
                      Category
                    </th>
                    <th className="w-36 px-4 py-4 text-xs font-black uppercase">
                      Status
                    </th>
                    <th className="w-96 px-4 py-4 text-xs font-black uppercase">
                      Short Description
                    </th>
                    <th className="w-32 px-4 py-4 text-xs font-black uppercase">
                      Featured
                    </th>
                    <th className="w-20 px-4 py-4 text-xs font-black uppercase">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row, index) => (
                    <tr
                      key={`${row.slug}-${index}`}
                      className="border-b border-[var(--border)] transition hover:bg-[var(--surface-soft)]"
                    >
                      <td className="px-4 py-4 align-top text-xs font-black text-[var(--foreground)]/40">
                        {index + 1}
                      </td>

                      <td className="px-4 py-4 align-top">
                        <input
                          value={row.name}
                          onChange={(event) =>
                            updateRow(index, "name", event.target.value)
                          }
                          className="w-full rounded-xl border border-transparent bg-transparent px-3 py-2 text-sm font-black outline-none transition hover:border-[var(--border)] focus:border-blue-500 focus:bg-[var(--background)]"
                        />
                      </td>

                      <td className="px-4 py-4 align-top">
                        <input
                          value={row.slug}
                          onChange={(event) =>
                            updateRow(index, "slug", event.target.value)
                          }
                          className="w-full rounded-xl border border-transparent bg-transparent px-3 py-2 font-mono text-xs outline-none transition hover:border-[var(--border)] focus:border-blue-500 focus:bg-[var(--background)]"
                        />
                      </td>

                      <td className="px-4 py-4 align-top">
                        <select
                          value={row.categoryId || ""}
                          onChange={(event) => {
                            const categoryId = event.target.value;
                            const category = categories.find(
                              (item) => item.id === categoryId
                            );

                            setRows((current) =>
                              current.map((item, rowIndex) =>
                                rowIndex === index
                                  ? {
                                      ...item,
                                      categoryId: categoryId || undefined,
                                      category: category?.name,
                                    }
                                  : item
                              )
                            );
                          }}
                          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs font-bold outline-none focus:border-blue-500"
                        >
                          <option value="">
                            {row.category || "No Category"}
                          </option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <select
                          value={row.status}
                          onChange={(event) =>
                            updateRow(
                              index,
                              "status",
                              event.target.value as ProductStatus
                            )
                          }
                          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs font-black outline-none focus:border-blue-500"
                        >
                          <option value="PUBLISHED">Published</option>
                          <option value="DRAFT">Draft</option>
                          <option value="ARCHIVED">Archived</option>
                        </select>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <textarea
                          value={row.shortDescription || ""}
                          onChange={(event) =>
                            updateRow(
                              index,
                              "shortDescription",
                              event.target.value
                            )
                          }
                          rows={3}
                          className="w-full resize-none rounded-xl border border-transparent bg-transparent px-3 py-2 text-xs text-[var(--foreground)]/70 outline-none transition hover:border-[var(--border)] focus:border-blue-500 focus:bg-[var(--background)]"
                        />
                      </td>

                      <td className="px-4 py-4 align-top">
                        <button
                          type="button"
                          onClick={() =>
                            updateRow(index, "featured", !row.featured)
                          }
                          className={`rounded-xl px-4 py-2 text-xs font-black transition ${
                            row.featured
                              ? "bg-amber-500 text-white"
                              : "bg-[var(--surface-soft)] text-[var(--foreground)]/45 hover:text-amber-600"
                          }`}
                        >
                          {row.featured ? "Featured" : "No"}
                        </button>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <button
                          type="button"
                          onClick={() => removeRow(index)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-600 transition hover:bg-red-500 hover:text-white"
                          title="Remove product"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {showResults && (
          <section className="mb-6 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black">Import Results</h2>
                <p className="mt-1 text-sm text-[var(--foreground)]/50">
                  Results returned by the bulk import API.
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
                  {results.map((result, index) => (
                    <tr
                      key={`${result.slug || result.name || "result"}-${index}`}
                      className="border-t border-[var(--border)]"
                    >
                      <td className="px-4 py-3 text-sm font-bold">
                        {result.name || result.slug || "Unknown"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                            result.status === "created"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : result.status === "updated"
                                ? "bg-blue-500/10 text-blue-600"
                                : result.status === "skipped"
                                  ? "bg-amber-500/10 text-amber-600"
                                  : "bg-red-500/10 text-red-600"
                          }`}
                        >
                          {result.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--foreground)]/55">
                        {result.message || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs leading-6 text-[var(--foreground)]/60">
          <strong className="text-[var(--foreground)]">Important:</strong>{" "}
          This page is for EXPORT products. It sends <strong>EXPORT</strong>{" "}
          as the product type regardless of the uploaded file&apos;s type
          column. The server endpoint may update an existing product if the
          same slug/type already exists; therefore use unique slugs when you
          intend to add only new products.
        </div>
      </div>
    </main>
  );
}