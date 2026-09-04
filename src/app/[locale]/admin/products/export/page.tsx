"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Edit3,
  Eye,
  Download,
  FileJson,
  FileSpreadsheet,
  Loader2,
  Package,
  Plus,
  Search,
  Star,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import {
  ChangeEvent,
  DragEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import BulkImageUpload from "@/components/admin/BulkImageUpload";

type ProductStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "ARCHIVED";

type ProductType = "IMPORT" | "EXPORT";

type Product = {
  id: string;
  name: string;
  slug: string;
  type: ProductType;
  status: ProductStatus;
  shortDescription: string | null;
  description?: string | null;
  specifications?: string | null;
  countryOfOrigin?: string | null;
  packaging?: string | null;
  minimumOrderQuantity?: string | null;
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
    sortOrder?: number;
  }[];

  createdAt: string;
  updatedAt: string;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  type: ProductType;
  active: boolean;
};

type ProductImage = {
  url: string;
  alt?: string;
  sortOrder?: number;
};

type BulkProduct = {
  name: string;
  slug?: string;
  type: ProductType;
  status?: ProductStatus;

  shortDescription?: string;
  description?: string;
  specifications?: string;
  countryOfOrigin?: string;
  packaging?: string;
  minimumOrderQuantity?: string;

  featured?: boolean;

  category?: string;
  categoryId?: string;

  images?: ProductImage[];
};

type ImportResult = {
  index: number;
  name?: string;
  status:
    | "CREATED"
    | "UPDATED"
    | "SKIPPED"
    | "FAILED";
  message?: string;
};

type ImportSummary = {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
};

/* =========================================================
   HELPERS
========================================================= */

function parseBoolean(value: unknown) {
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* =========================================================
   CSV PARSER
========================================================= */

function parseCSV(
  text: string
): Record<string, string>[] {
  const rows: string[][] = [];

  let row: string[] = [];
  let cell = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (
      char === '"' &&
      insideQuotes &&
      next === '"'
    ) {
      cell += '"';
      i++;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (
      char === "," &&
      !insideQuotes
    ) {
      row.push(cell);
      cell = "";
      continue;
    }

    if (
      (char === "\n" ||
        char === "\r") &&
      !insideQuotes
    ) {
      if (
        char === "\r" &&
        next === "\n"
      ) {
        i++;
      }

      row.push(cell);
      cell = "";

      if (
        row.some(
          (value) =>
            value.trim() !== ""
        )
      ) {
        rows.push(row);
      }

      row = [];
      continue;
    }

    cell += char;
  }

  if (
    cell ||
    row.length > 0
  ) {
    row.push(cell);

    if (
      row.some(
        (value) =>
          value.trim() !== ""
      )
    ) {
      rows.push(row);
    }
  }

  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0].map(
    (header) =>
      header
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")
  );

  return rows
    .slice(1)
    .map((values) => {
      const result: Record<
        string,
        string
      > = {};

      headers.forEach(
        (header, index) => {
          result[header] =
            values[index]?.trim() ??
            "";
        }
      );

      return result;
    });
}

/* =========================================================
   CSV → PRODUCT
========================================================= */

function csvRowToProduct(
  row: Record<string, string>
): BulkProduct {
  let images: ProductImage[] = [];

  if (row.images) {
    try {
      const parsed =
        JSON.parse(row.images);

      if (
        Array.isArray(parsed)
      ) {
        images = parsed;
      }
    } catch {
      images = row.images
        .split("|")
        .map(
          (url, index) => ({
            url: url.trim(),
            alt:
              row.name ||
              "Product image",
            sortOrder: index,
          })
        )
        .filter(
          (image) =>
            image.url
        );
    }
  }


  const rawStatus =
    row.status
      ?.trim()
      .toUpperCase();

  return {
    name:
      row.name?.trim() || "",

    slug:
      row.slug?.trim() ||
      undefined,

    type:
      "EXPORT",

    status:
      rawStatus === "PUBLISHED"
        ? "PUBLISHED"
        : rawStatus === "ARCHIVED"
          ? "ARCHIVED"
          : "DRAFT",

    shortDescription:
      row.shortdescription ||
      row.short_description ||
      undefined,

    description:
      row.description ||
      undefined,

    specifications:
      row.specifications ||
      undefined,

    countryOfOrigin:
      row.countryoforigin ||
      row.country_of_origin ||
      undefined,

    packaging:
      row.packaging ||
      undefined,

    minimumOrderQuantity:
      row.minimumorderquantity ||
      row.minimum_order_quantity ||
      row.moq ||
      undefined,

    featured:
      parseBoolean(
        row.featured
      ),

    category:
      row.category ||
      undefined,

    categoryId:
      row.categoryid ||
      row.category_id ||
      undefined,

    images,
  };
}

/* =========================================================
   JSON → PRODUCT
========================================================= */

function normalizeJSONProduct(
  item: Record<string, unknown>
): BulkProduct {

  const rawStatus =
    String(item.status ?? "")
      .trim()
      .toUpperCase();

  return {
    name: String(
      item.name ?? ""
    ).trim(),

    slug: item.slug
      ? String(item.slug).trim()
      : undefined,

    type:
      "EXPORT",

    status:
      rawStatus === "PUBLISHED"
        ? "PUBLISHED"
        : rawStatus === "ARCHIVED"
          ? "ARCHIVED"
          : "DRAFT",

    shortDescription:
      item.shortDescription
        ? String(
            item.shortDescription
          )
        : undefined,

    description:
      item.description
        ? String(
            item.description
          )
        : undefined,

    specifications:
      item.specifications
        ? String(
            item.specifications
          )
        : undefined,

    countryOfOrigin:
      item.countryOfOrigin
        ? String(
            item.countryOfOrigin
          )
        : undefined,

    packaging:
      item.packaging
        ? String(
            item.packaging
          )
        : undefined,

    minimumOrderQuantity:
      item.minimumOrderQuantity
        ? String(
            item.minimumOrderQuantity
          )
        : undefined,

    featured:
      parseBoolean(
        item.featured
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

    images:
      Array.isArray(
        item.images
      )
        ? (item.images as ProductImage[])
        : [],
  };
}

/* =========================================================
   VALIDATION
========================================================= */

function validateProducts(
  products: BulkProduct[]
) {
  const errors: string[] = [];

  products.forEach(
    (product, index) => {
      const row =
        index + 1;

      if (
        !product.name.trim()
      ) {
        errors.push(
          `Row ${row}: Product name is required.`
        );
      }

      if (product.type !== "EXPORT") {
        errors.push(
          `Row ${row}: Product type must be EXPORT.`
        );
      }

      if (
        product.status &&
        ![
          "DRAFT",
          "PUBLISHED",
          "ARCHIVED",
        ].includes(
          product.status
        )
      ) {
        errors.push(
          `Row ${row}: Invalid product status.`
        );
      }

      if (
        !product.category &&
        !product.categoryId
      ) {
        errors.push(
          `Row ${row}: Category is required.`
        );
      }
    }
  );

  return errors;
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function ExportProductsPage() {
  const [
    products,
    setProducts,
  ] = useState<Product[]>(
    []
  );

  const [
    categories,
    setCategories,
  ] = useState<Category[]>(
    []
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [showBulkImages, setShowBulkImages] = useState(false);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
    "ALL" | ProductStatus
  >("ALL");

  /* =======================================================
     BULK IMPORT STATE
  ======================================================= */

  const [
    exportProductsList,
    setExportProductsList,
  ] = useState<
    BulkProduct[]
  >([]);

  const [
    exportFileName,
    setExportFileName,
  ] = useState("");

  const [
    exportFileType,
    setExportFileType,
  ] = useState<
    "CSV" | "JSON" | ""
  >("");

  const [
    importing,
    setImporting,
  ] = useState(false);

  const [
    dragActive,
    setDragActive,
  ] = useState(false);

  const [
    exportResults,
    setExportResults,
  ] = useState<
    ImportResult[]
  >([]);

  const [
    exportSummary,
    setExportSummary,
  ] = useState<
    ImportSummary | null
  >(null);

  const [
    showExportResults,
    setShowExportResults,
  ] = useState(false);

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  /* =======================================================
     VALIDATION
  ======================================================= */

  const exportValidationErrors =
    useMemo(
      () =>
        validateProducts(
          exportProductsList
        ),
      [exportProductsList]
    );

  /* =======================================================
     LOAD PRODUCTS
  ======================================================= */

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const params =
        new URLSearchParams();

      params.set(
        "type",
        "EXPORT"
      );

      if (
        search.trim()
      ) {
        params.set(
          "search",
          search.trim()
        );
      }

      if (
        categoryFilter
      ) {
        params.set(
          "categoryId",
          categoryFilter
        );
      }

      if (
        statusFilter !==
        "ALL"
      ) {
        params.set(
          "status",
          statusFilter
        );
      }

      const response =
        await fetch(
          `/api/admin/products?${params.toString()}`,
          {
            cache:
              "no-store",
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to load products."
        );
      }

      setProducts(
        result.products ||
          []
      );
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

  /* =======================================================
     LOAD CATEGORIES
  ======================================================= */

  async function loadCategories() {
    try {
      const response =
        await fetch(
          "/api/admin/categories",
          {
            cache:
              "no-store",
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to load categories."
        );
      }

      setCategories(
        (
          result.categories ||
          []
        ).filter(
          (
            category: Category
          ) =>
            category.type ===
            "EXPORT"
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
    const timer =
      setTimeout(() => {
        loadProducts();
      }, 250);

    return () =>
      clearTimeout(timer);
  }, [
    search,
    categoryFilter,
    statusFilter,
  ]);

  /* =======================================================
     DELETE PRODUCT
  ======================================================= */

  async function deleteProduct(
    product: Product
  ) {
    const confirmed =
      window.confirm(
        `Delete "${product.name}"?\n\nThis action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response =
        await fetch(
          `/api/admin/products/${product.id}`,
          {
            method:
              "DELETE",
          }
        );

      const result =
        await response.json();

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

  /* =======================================================
     UPDATE PRODUCT
  ======================================================= */

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

      const response =
        await fetch(
          `/api/admin/products/${product.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              name:
                product.name,
              slug:
                product.slug,
              type:
                product.type,
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

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to update product."
        );
      }

      setSuccess(
        changes.status
          ? changes.status ===
            "PUBLISHED"
            ? "Product published."
            : changes.status ===
                "DRAFT"
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

  /* =======================================================
     STATUS STYLES
  ======================================================= */

  function statusClass(
    status: ProductStatus
  ) {
    if (
      status ===
      "PUBLISHED"
    ) {
      return "bg-emerald-500/10 text-emerald-600";
    }

    if (
      status ===
      "ARCHIVED"
    ) {
      return "bg-gray-500/10 text-gray-500";
    }

    return "bg-amber-500/10 text-amber-600";
  }

  /* =======================================================
     BULK DOWNLOAD CURRENT IMPORT PRODUCTS
  ======================================================= */

  function escapeDownloadCSV(value: unknown) {
    const text = value === null || value === undefined ? "" : String(value);
    return text.includes(",") || text.includes('"') || text.includes("\n")
      ? `"${text.replace(/"/g, '""')}"`
      : text;
  }

  function downloadFile(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function getAllExportProductsForDownload() {
    const response = await fetch("/api/admin/products?type=EXPORT", {
      cache: "no-store",
      credentials: "include",
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Unable to download products.");
    }
    return Array.isArray(result.products) ? result.products : [];
  }

  async function downloadAllExportCSV() {
    try {
      setError("");
      const allProducts = await getAllExportProductsForDownload();
      const headers = [
        "id", "name", "slug", "type", "status", "category", "categoryId",
        "shortDescription", "description", "specifications", "countryOfOrigin",
        "packaging", "minimumOrderQuantity", "featured", "images"
      ];
      const rows = allProducts.map((product: Product) => [
        product.id, product.name, product.slug, "EXPORT", product.status,
        product.category?.name || "", product.categoryId || "", product.shortDescription || "",
        product.description || "", product.specifications || "", product.countryOfOrigin || "",
        product.packaging || "", product.minimumOrderQuantity || "",
        product.featured ? "true" : "false",
        (product.images || []).map((image) => image.url).join("|")
      ].map(escapeDownloadCSV).join(","));

      downloadFile([headers.join(","), ...rows].join("\n"),
        "krupali-export-products.csv", "text/csv;charset=utf-8;");
      setSuccess(`${allProducts.length} export products downloaded as CSV.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to download products.");
    }
  }

  async function downloadAllExportJSON() {
    try {
      setError("");
      const allProducts = await getAllExportProductsForDownload();
      const data = allProducts.map((product: Product) => ({
        id: product.id, name: product.name, slug: product.slug, type: "EXPORT",
        status: product.status, category: product.category?.name || "",
        categoryId: product.categoryId || "", shortDescription: product.shortDescription || "",
        description: product.description || "", specifications: product.specifications || "",
        countryOfOrigin: product.countryOfOrigin || "", packaging: product.packaging || "",
        minimumOrderQuantity: product.minimumOrderQuantity || "", featured: product.featured,
        images: (product.images || []).map((image) => ({ url: image.url, alt: image.alt || "", sortOrder: image.sortOrder ?? 0 }))
      }));
      downloadFile(JSON.stringify({ products: data }, null, 2),
        "krupali-export-products.json", "application/json;charset=utf-8;");
      setSuccess(`${allProducts.length} export products downloaded as JSON.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to download products.");
    }
  }

  /* =======================================================
     DOWNLOAD CSV TEMPLATE
  ======================================================= */

  function downloadCSVTemplate() {
    const headers = [
      "name",
      "slug",
      "type",
      "status",
      "category",
      "shortDescription",
      "description",
      "specifications",
      "countryOfOrigin",
      "packaging",
      "minimumOrderQuantity",
      "featured",
      "images",
    ];

    const example = [
      "Premium Black Pepper",
      "premium-black-pepper",
      "EXPORT",
      "PUBLISHED",
      "Whole Spices",
      "Premium quality Indian black pepper.",
      "Premium black pepper sourced from trusted suppliers.",
      "Form: Whole | Origin: India | Quality: Export Quality",
      "India",
      "25 kg / 50 kg bags",
      "500 kg",
      "true",
      "",
    ];

    const csv = [
      headers.join(","),
      example
        .map(
          (value) =>
            `"${value.replace(
              /"/g,
              '""'
            )}"`
        )
        .join(","),
    ].join("\n");

    const blob =
      new Blob(
        [csv],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;
    link.download =
      "krupali-products-template.csv";

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(
      url
    );
  }

  /* =======================================================
     DOWNLOAD JSON TEMPLATE
  ======================================================= */

  function downloadJSONTemplate() {
    const template =
      [
        {
          name:
            "Black Pepper",

          slug:
            "black-pepper",

          type:
            "EXPORT",

          status:
            "PUBLISHED",

          category:
            "Whole Spices",

          shortDescription:
            "Premium quality Indian black pepper.",

          description:
            "Premium black pepper sourced from trusted suppliers.",

          specifications:
            "Form: Whole | Origin: India | Quality: Export Quality",

          countryOfOrigin:
            "India",

          packaging:
            "25 kg / 50 kg bags",

          minimumOrderQuantity:
            "500 kg",

          featured:
            true,

          images:
            [
              {
                url:
                  "https://example.com/images/black-pepper.jpg",
                alt:
                  "Black Pepper",
                sortOrder:
                  0,
              },
            ],
        },
      ];

    const json =
      JSON.stringify(
        template,
        null,
        2
      );

    const blob =
      new Blob(
        [json],
        {
          type:
            "application/json;charset=utf-8;",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;
    link.download =
      "krupali-products-template.json";

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(
      url
    );
  }

  /* =======================================================
     PROCESS FILE
  ======================================================= */

  async function processImportFile(
    file: File
  ) {
    setError("");
    setSuccess("");
    setExportResults([]);
    setExportSummary(null);
    setShowExportResults(
      false
    );

    setExportFileName(
      file.name
    );

    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase();

    try {
      const text =
        await file.text();

      let parsedProducts: BulkProduct[] =
        [];

      if (
        extension ===
        "json"
      ) {
        setExportFileType(
          "JSON"
        );

        const parsed =
          JSON.parse(
            text
          );

        const rawProducts =
          Array.isArray(
            parsed
          )
            ? parsed
            : parsed.products;

        if (
          !Array.isArray(
            rawProducts
          )
        ) {
          throw new Error(
            "JSON must contain a products array."
          );
        }

        parsedProducts =
          rawProducts.map(
            (
              item: Record<
                string,
                unknown
              >
            ) =>
              normalizeJSONProduct(
                item
              )
          );
      } else if (
        extension ===
        "csv"
      ) {
        setExportFileType(
          "CSV"
        );

        const rows =
          parseCSV(text);

        parsedProducts =
          rows.map(
            csvRowToProduct
          );
      } else {
        throw new Error(
          "Please upload a CSV or JSON file."
        );
      }

      if (
        parsedProducts.length ===
        0
      ) {
        throw new Error(
          "No products were found in the uploaded file."
        );
      }

      if (
        parsedProducts.length >
        500
      ) {
        throw new Error(
          "Maximum 500 products can be imported at once."
        );
      }

      /*
       * Automatically generate missing slugs.
       */
      parsedProducts =
        parsedProducts.map(
          (product) => ({
            ...product,
            slug:
              product.slug ||
              slugify(
                product.name
              ),
          })
        );

      setExportProductsList(
        parsedProducts
      );

      await loadCategories();
    } catch (err) {
      console.error(
        "FILE_IMPORT_ERROR",
        err
      );

      setExportProductsList(
        []
      );

      setExportFileType(
        ""
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to read the uploaded file."
      );
    }
  }

  /* =======================================================
     FILE INPUT
  ======================================================= */

  async function handleFile(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    await processImportFile(
      file
    );

    event.target.value = "";
  }

  /* =======================================================
     DRAG & DROP
  ======================================================= */

  function handleDragOver(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(
      true
    );
  }

  function handleDragLeave(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(
      false
    );
  }

  async function handleDrop(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(
      false
    );

    const file =
      event.dataTransfer.files?.[0];

    if (!file) {
      return;
    }

    await processImportFile(
      file
    );
  }

  /* =======================================================
     CLEAR IMPORT
  ======================================================= */

  function clearExportFile() {
    setExportProductsList(
      []
    );

    setExportFileName(
      ""
    );

    setExportFileType(
      ""
    );

    setExportResults(
      []
    );

    setExportSummary(
      null
    );

    setShowExportResults(
      false
    );

    setError("");
    setSuccess("");

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  }

  /* =======================================================
     UPDATE IMPORT PRODUCT
  ======================================================= */

  function updateExportProduct(
    index: number,
    field: keyof BulkProduct,
    value:
      | string
      | boolean
  ) {
    setExportProductsList(
      (current) =>
        current.map(
          (
            product,
            productIndex
          ) =>
            productIndex ===
            index
              ? {
                  ...product,
                  [field]:
                    value,
                }
              : product
        )
    );
  }

  /* =======================================================
     IMPORT PRODUCTS
  ======================================================= */

  async function submitBulkExportImport() {
    if (
      exportProductsList.length ===
      0
    ) {
      setError(
        "Please upload a CSV or JSON file first."
      );

      return;
    }

    if (
      exportValidationErrors.length >
      0
    ) {
      setError(
        "Please fix the validation errors before importing."
      );

      return;
    }

    try {
      setImporting(
        true
      );

      setError("");
      setSuccess("");

      setExportResults(
        []
      );

      setExportSummary(
        null
      );

      setShowExportResults(
        false
      );

      const response =
        await fetch(
          "/api/admin/products/import",
          {
            method:
              "POST",

            credentials:
              "include",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                products:
                  exportProductsList.map((product) => ({
                    ...product,
                    type: "EXPORT",
                  })),
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Product import failed."
        );
      }

      const summary =
        data.summary ||
        null;

      setExportSummary(
        summary
      );

      setExportResults(
        Array.isArray(
          data.results
        )
          ? data.results
          : []
      );

      setShowExportResults(
        true
      );

      setSuccess(
        `Import completed. ${
          summary?.created ??
          0
        } created, ${
          summary?.updated ??
          0
        } updated, ${
          summary?.skipped ??
          0
        } skipped, ${
          summary?.failed ??
          0
        } failed.`
      );

      /*
       * Refresh the main product table
       * after successful import.
       */
      await loadProducts();
    } catch (err) {
      console.error(
        "BULK_IMPORT_ERROR",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Product import failed."
      );
    } finally {
      setImporting(
        false
      );
    }
  }

  /* =======================================================
     COUNTERS
  ======================================================= */

  const activeProducts =
    useMemo(
      () =>
        products.filter(
          (product) =>
            product.status ===
            "PUBLISHED"
        ).length,
      [products]
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-6 text-[var(--foreground)] sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
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
                Manage products that Krupali Traders exports to international markets.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:max-w-3xl lg:justify-end">
              <button
                type="button"
                onClick={downloadCSVTemplate}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-700 dark:border-white/20"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                CSV Template
              </button>

              <button
                type="button"
                onClick={downloadJSONTemplate}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-700 dark:border-white/20"
              >
                <FileJson className="h-3.5 w-3.5" />
                JSON Template
              </button>

              <button
                type="button"
                onClick={downloadAllExportCSV}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 text-xs font-bold text-emerald-600 transition hover:-translate-y-0.5 hover:bg-emerald-500 hover:text-white"
              >
                <Download className="h-3.5 w-3.5" />
                All CSV
              </button>

              <button
                type="button"
                onClick={downloadAllExportJSON}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-purple-500/20 bg-purple-500/5 px-3 text-xs font-bold text-purple-600 transition hover:-translate-y-0.5 hover:bg-purple-500 hover:text-white"
              >
                <Download className="h-3.5 w-3.5" />
                All JSON
              </button>

              <Link
                href="/admin/products/export/bulk-update"
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 text-xs font-bold text-emerald-600 transition hover:-translate-y-0.5 hover:bg-emerald-500 hover:text-white"
              >
                <Upload className="h-3.5 w-3.5" />
                Bulk Update
              </Link>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 text-xs font-bold text-blue-600 transition hover:-translate-y-0.5 hover:bg-blue-500 hover:text-white"
              >
                <Upload className="h-3.5 w-3.5" />
                Bulk Import
              </button>

              <button
                type="button"
                onClick={() => setShowBulkImages(true)}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-purple-500/20 bg-purple-500/5 px-3 text-xs font-bold text-purple-600 transition hover:-translate-y-0.5 hover:bg-purple-500 hover:text-white"
              >
                <Upload className="h-3.5 w-3.5" />
                Bulk Images
              </button>

              <Link
                href="/admin/products/export/new"
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-3 text-xs font-bold text-white shadow-md shadow-blue-600/15 transition hover:-translate-y-0.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Product
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

        {/* =================================================
            ALERTS
        ================================================= */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-semibold text-red-600">

            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <span>
              {error}
            </span>

          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm font-semibold text-emerald-600">

            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

            <span>
              {success}
            </span>

          </div>
        )}

        {/* =================================================
            BULK IMPORT
        ================================================= */}

        <section
          id="bulk-import"
          className="mb-6 overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-cyan-500/5"
        >
          <div className="px-5 py-4 sm:px-6">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json,text/csv,application/json"
              onChange={handleFile}
              className="hidden"
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                  <Upload className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-black">
                      Bulk Import Products
                    </h2>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-blue-500/25 bg-blue-500/10 px-2.5 text-xs font-bold text-blue-600 transition hover:-translate-y-0.5 hover:bg-blue-500 hover:text-white"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Upload Product File
                    </button>
                  </div>

                  <p className="mt-1 text-xs text-[var(--foreground)]/50">
                    Upload a CSV or JSON file containing multiple export products.
                  </p>
                </div>
              </div>

              <span className="shrink-0 self-start rounded-full bg-blue-500/10 px-3 py-1.5 text-[11px] font-bold text-blue-600 sm:self-center">
                Maximum 500 products
              </span>
            </div>
          </div>

          {/* PREVIEW — shown only after a file is selected */}

          {exportProductsList.length > 0 && (
            <div className="p-5 sm:p-6">

              {/* FILE INFORMATION */}

                <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex min-w-0 items-center gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">

                      {exportFileType ===
                      "JSON" ? (
                        <FileJson className="h-6 w-6" />
                      ) : (
                        <FileSpreadsheet className="h-6 w-6" />
                      )}

                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-black">
                        {exportFileName}
                      </p>

                      <p className="mt-1 text-xs text-[var(--foreground)]/45">
                        {
                          exportProductsList.length
                        }{" "}
                        products detected
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={
                      clearExportFile
                    }
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-500 hover:text-white"
                  >
                    <XCircle className="h-4 w-4" />

                    Remove File
                  </button>

                </div>

                {/* VALIDATION */}

                {exportValidationErrors.length >
                  0 && (
                  <div className="mb-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">

                    <div className="flex items-start gap-3">

                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                      <div>

                        <h3 className="font-black text-amber-700">
                          Please fix these issues
                        </h3>

                        <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto text-sm text-amber-700">

                          {exportValidationErrors.map(
                            (
                              validationError,
                              index
                            ) => (
                              <li
                                key={
                                  index
                                }
                              >
                                {validationError}
                              </li>
                            )
                          )}

                        </ul>

                      </div>

                    </div>

                  </div>
                )}

                {/* PREVIEW */}

                <div className="overflow-hidden rounded-2xl border border-[var(--border)]">

                  <div className="flex flex-col gap-3 border-b border-[var(--border)] bg-[var(--surface-soft)] p-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                      <h3 className="font-black">
                        Import Preview
                      </h3>

                      <p className="mt-1 text-xs text-[var(--foreground)]/45">
                        Review the imported
                        products before saving
                        them.
                      </p>

                    </div>

                    <span className="w-fit rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-600">
                      {
                        exportProductsList.length
                      }{" "}
                      Products
                    </span>

                  </div>

                  <div className="max-h-[520px] overflow-auto">

                    <table className="w-full min-w-[1050px] text-left">

                      <thead className="sticky top-0 z-10 bg-[var(--surface)]">

                        <tr className="border-b border-[var(--border)]">

                          <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-[var(--foreground)]/40">
                            #
                          </th>

                          <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-[var(--foreground)]/40">
                            Product
                          </th>

                          <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-[var(--foreground)]/40">
                            Type
                          </th>

                          <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-[var(--foreground)]/40">
                            Category
                          </th>

                          <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-[var(--foreground)]/40">
                            Status
                          </th>

                          <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-[var(--foreground)]/40">
                            Featured
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {exportProductsList.map(
                          (
                            product,
                            index
                          ) => (

                            <tr
                              key={`${product.name}-${index}`}
                              className="border-b border-[var(--border)] last:border-0"
                            >

                              <td className="px-4 py-4 text-sm font-bold text-[var(--foreground)]/40">
                                {index +
                                  1}
                              </td>

                              <td className="px-4 py-4">

                                <input
                                  value={
                                    product.name
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    updateExportProduct(
                                      index,
                                      "name",
                                      event
                                        .target
                                        .value
                                    )
                                  }
                                  className="w-64 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500"
                                />

                                <p className="mt-1 text-[11px] text-[var(--foreground)]/35">
                                  /{
                                    product.slug ||
                                    slugify(
                                      product.name
                                    )
                                  }
                                </p>

                              </td>

                              <td className="px-4 py-4">

                                <select
                                  value="EXPORT"
                                  disabled
                                  className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm font-bold outline-none opacity-80"
                                >
                                  <option value="EXPORT">
                                    EXPORT
                                  </option>
                                </select>

                              </td>

                              <td className="px-4 py-4">

                                <select
                                  value={
                                    product.category ||
                                    ""
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    updateExportProduct(
                                      index,
                                      "category",
                                      event
                                        .target
                                        .value
                                    )
                                  }
                                  className="w-56 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500"
                                >

                                  <option value="">
                                    Select Category
                                  </option>

                                  {categories
                                    .filter(
                                      (
                                        category
                                      ) =>
                                        category.type ===
                                          product.type &&
                                        category.active
                                    )
                                    .map(
                                      (
                                        category
                                      ) => (
                                        <option
                                          key={
                                            category.id
                                          }
                                          value={
                                            category.name
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

                              <td className="px-4 py-4">

                                <select
                                  value={
                                    product.status ||
                                    "DRAFT"
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    updateExportProduct(
                                      index,
                                      "status",
                                      event
                                        .target
                                        .value as ProductStatus
                                    )
                                  }
                                  className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm font-bold outline-none focus:border-blue-500"
                                >

                                  <option value="PUBLISHED">
                                    PUBLISHED
                                  </option>

                                  <option value="DRAFT">
                                    DRAFT
                                  </option>

                                  <option value="ARCHIVED">
                                    ARCHIVED
                                  </option>

                                </select>

                              </td>

                              <td className="px-4 py-4">

                                <label className="inline-flex cursor-pointer items-center gap-2">

                                  <input
                                    type="checkbox"
                                    checked={Boolean(
                                      product.featured
                                    )}
                                    onChange={(
                                      event
                                    ) =>
                                      updateExportProduct(
                                        index,
                                        "featured",
                                        event
                                          .target
                                          .checked
                                      )
                                    }
                                    className="h-4 w-4 rounded border-[var(--border)]"
                                  />

                                  <span className="text-xs font-semibold text-[var(--foreground)]/50">
                                    Featured
                                  </span>

                                </label>

                              </td>

                            </tr>

                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                </div>

                {/* IMPORT ACTION */}

                <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <p className="font-black">
                      Ready to import?
                    </p>

                    <p className="mt-1 text-xs text-[var(--foreground)]/50">
                      Products will be created or
                      updated using the bulk import
                      API.
                    </p>

                  </div>

                  <button
                    type="button"
                    disabled={
                      importing ||
                      exportProductsList.length ===
                        0 ||
                      exportValidationErrors.length >
                        0
                    }
                    onClick={
                      submitBulkExportImport
                    }
                    className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {importing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />

                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5" />

                        Import{" "}
                        {
                          exportProductsList.length
                        }{" "}
                        Products
                      </>
                    )}

                  </button>

                </div>


            </div>
          )}

        </section>

        {/* =================================================
            SUMMARY
        ================================================= */}

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

        {/* =================================================
            FILTERS
        ================================================= */}

        <section className="mb-6 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-lg shadow-blue-950/5">

          <div className="grid gap-4 md:grid-cols-[1fr_220px_180px]">

            <div className="relative">

              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--foreground)]/35" />

              <input
                value={
                  search
                }
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search import products..."
                className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] pl-12 pr-4 text-sm text-[var(--foreground)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

            </div>

            <select
              value={
                categoryFilter
              }
              onChange={(
                event
              ) =>
                setCategoryFilter(
                  event.target.value
                )
              }
              className="h-12 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-blue-500"
            >

              <option value="">
                All Categories
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

            <select
              value={
                statusFilter
              }
              onChange={(
                event
              ) =>
                setStatusFilter(
                  event.target
                    .value as
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

        {/* =================================================
            IMPORT RESULTS
        ================================================= */}

        {showExportResults &&
          exportResults.length >
            0 && (

            <section className="mb-6 overflow-hidden rounded-[2rem] border border-emerald-500/20 bg-[var(--surface)] shadow-lg">

              <button
                type="button"
                onClick={() =>
                  setShowExportResults(
                    !showExportResults
                  )
                }
                className="flex w-full items-center justify-between border-b border-[var(--border)] p-5 text-left"
              >

                <div>

                  <h2 className="font-black">
                    Import Results
                  </h2>

                  {exportSummary && (
                    <p className="mt-1 text-sm text-[var(--foreground)]/50">

                      {exportSummary.created}{" "}
                      created ·{" "}
                      {exportSummary.updated}{" "}
                      updated ·{" "}
                      {exportSummary.skipped}{" "}
                      skipped ·{" "}
                      {exportSummary.failed}{" "}
                      failed

                    </p>
                  )}

                </div>

                <span className="text-xs font-bold text-emerald-600">
                  {showExportResults
                    ? "Hide"
                    : "Show"}
                </span>

              </button>

              {showExportResults && (

                <div className="max-h-[420px] overflow-auto">

                  <table className="w-full min-w-[700px] text-left">

                    <thead>

                      <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)]">

                        <th className="px-5 py-3 text-xs font-black uppercase tracking-wider text-[var(--foreground)]/40">
                          Product
                        </th>

                        <th className="px-5 py-3 text-xs font-black uppercase tracking-wider text-[var(--foreground)]/40">
                          Result
                        </th>

                        <th className="px-5 py-3 text-xs font-black uppercase tracking-wider text-[var(--foreground)]/40">
                          Message
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {exportResults.map(
                        (
                          result
                        ) => (

                          <tr
                            key={`${result.index}-${result.name}`}
                            className="border-b border-[var(--border)] last:border-0"
                          >

                            <td className="px-5 py-4 text-sm font-bold">
                              {result.name ||
                                `Row ${
                                  result.index +
                                  1
                                }`}
                            </td>

                            <td className="px-5 py-4">

                              {result.status ===
                                "FAILED" ? (

                                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-600">

                                  <XCircle className="h-3.5 w-3.5" />

                                  Failed

                                </span>

                              ) : result.status ===
                                "SKIPPED" ? (

                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-600">

                                  Skipped

                                </span>

                              ) : (

                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600">

                                  <CheckCircle2 className="h-3.5 w-3.5" />

                                  {
                                    result.status
                                  }

                                </span>

                              )}

                            </td>

                            <td className="px-5 py-4 text-sm text-[var(--foreground)]/50">
                              {result.message ||
                                "—"}
                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </section>

          )}

        {/* =================================================
            EXISTING PRODUCT TABLE
        ================================================= */}

        <section className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-xl shadow-blue-950/5">

          {loading ? (

            <div className="p-16 text-center">

              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-600" />

              <p className="mt-4 text-sm font-semibold text-[var(--foreground)]/50">
                Loading export products...
              </p>

            </div>

          ) : products.length ===
            0 ? (

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
                statusFilter !==
                  "ALL"
                  ? "Try changing your search or filters."
                  : "Start building your export catalogue by adding your first product."}

              </p>

              {!search &&
                !categoryFilter &&
                statusFilter ===
                  "ALL" && (

                  <Link
                    href="/admin/products/export/new"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-sm font-bold text-white"
                  >

                    <Plus className="h-4 w-4" />

                    Add Export Product

                  </Link>

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

                  {products.map(
                    (
                      product
                    ) => {

                      const image =
                        product
                          .images[0];

                      return (

                        <tr
                          key={
                            product.id
                          }
                          className="border-b border-[var(--border)] last:border-0 transition hover:bg-[var(--surface-soft)]/60"
                        >

                          {/* PRODUCT */}

                          <td className="px-5 py-5">

                            <div className="flex items-center gap-4">

                              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-500/10 text-blue-600">

                                {image ? (

                                  <img
                                    src={
                                      image.url
                                    }
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
                                  {
                                    product.name
                                  }
                                </p>

                                <p className="mt-1 truncate text-xs text-[var(--foreground)]/40">
                                  /{
                                    product.slug
                                  }
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* CATEGORY */}

                          <td className="px-5 py-5">

                            {product.category ? (

                              <span className="rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-600">
                                {
                                  product
                                    .category
                                    .name
                                }
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
                              value={
                                product.status
                              }
                              onChange={(
                                event
                              ) =>
                                updateProduct(
                                  product,
                                  {
                                    status:
                                      event
                                        .target
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
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </div>

    </main>
  );
}