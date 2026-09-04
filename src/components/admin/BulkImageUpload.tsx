"use client";

import {
  CheckCircle2,
  FileArchive,
  Image as ImageIcon,
  Loader2,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";

type ProductType = "IMPORT" | "EXPORT";

type Product = {
  id: string;
  name: string;
  slug: string;
  type: ProductType;
  images?: { id: string; url: string; alt?: string | null; sortOrder?: number }[];
};

type Match = {
  file: File;
  product: Product;
  sortOrder: number;
};

type Result = {
  file: string;
  product: string;
  status: "uploaded" | "skipped" | "failed";
  message: string;
  url?: string;
};

const MAX_FILES = 500;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function normalize(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\.[^/.]+$/, "")
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getSlugAndSort(fileName: string) {
  const base = normalize(fileName);
  const suffix = base.match(/-(\d+)$/);
  return {
    slug: suffix ? base.slice(0, -suffix[0].length) : base,
    sortOrder: suffix ? Math.max(0, Number(suffix[1]) - 1) : 0,
  };
}

function isImage(file: File) {
  return ALLOWED_TYPES.has(file.type) || /\.(jpe?g|png|webp|gif)$/i.test(file.name);
}

export default function BulkImageUpload({
  type,
  onClose,
  onComplete,
}: {
  type: ProductType;
  onClose?: () => void;
  onComplete?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoadingProducts(true);
        const response = await fetch(
          `/api/admin/products?type=${type}`,
          { cache: "no-store", credentials: "include" }
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load products.");
        if (active) setProducts(Array.isArray(data.products) ? data.products : []);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load products.");
      } finally {
        if (active) setLoadingProducts(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [type]);

  const productMap = useMemo(() => {
    const map = new Map<string, Product>();
    for (const product of products) map.set(normalize(product.slug), product);
    return map;
  }, [products]);

  const matches = useMemo<Match[]>(() => {
    const output: Match[] = [];
    for (const file of files) {
      const { slug, sortOrder } = getSlugAndSort(file.name);
      const product = productMap.get(slug);
      if (product) output.push({ file, product, sortOrder });
    }
    return output;
  }, [files, productMap]);

  const unmatched = useMemo(() => {
    return files.filter((file) => {
      const { slug } = getSlugAndSort(file.name);
      return !productMap.has(slug);
    });
  }, [files, productMap]);

  async function addFiles(incoming: File[]) {
    setError("");
    setSuccess("");
    setResults([]);

    const imageFiles = incoming.filter(isImage);
    if (imageFiles.length !== incoming.length) {
      setError("Only JPG, PNG, WEBP and GIF images are supported.");
    }

    const oversized = imageFiles.find((file) => file.size > MAX_FILE_SIZE);
    if (oversized) {
      setError(`"${oversized.name}" is larger than 10 MB.`);
      return;
    }

    const combined = [...files, ...imageFiles];
    const unique = Array.from(
      new Map(combined.map((file) => [`${file.name}-${file.size}-${file.lastModified}`, file])).values()
    );

    if (unique.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} images can be uploaded at once.`);
      setFiles(unique.slice(0, MAX_FILES));
      return;
    }

    setFiles(unique);
  }

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    await addFiles(Array.from(event.target.files || []));
    event.target.value = "";
  }

  async function handleZip(file: File) {
    setError("");
    setSuccess("");
    setResults([]);

    if (file.size > 100 * 1024 * 1024) {
      setError("ZIP file must be 100 MB or smaller.");
      return;
    }

    try {
      const zip = await JSZip.loadAsync(file);
      const extracted: File[] = [];

      for (const [name, entry] of Object.entries(zip.files)) {
        if (entry.dir) continue;
        const cleanName = name.split("/").pop() || name;
        if (!/\.(jpe?g|png|webp|gif)$/i.test(cleanName)) continue;

        const blob = await entry.async("blob");
        const type = blob.type || (
          /\.png$/i.test(cleanName) ? "image/png" :
          /\.webp$/i.test(cleanName) ? "image/webp" :
          /\.gif$/i.test(cleanName) ? "image/gif" :
          "image/jpeg"
        );

        extracted.push(new File([blob], cleanName, { type }));
        if (extracted.length >= MAX_FILES) break;
      }

      if (!extracted.length) {
        throw new Error("No supported images were found inside the ZIP.");
      }

      await addFiles(extracted);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to read ZIP file.");
    }
  }

  async function uploadOne(match: Match) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error(
        "Cloudinary is not configured. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET."
      );
    }

    const body = new FormData();
    body.append("file", match.file);
    body.append("upload_preset", uploadPreset);
    body.append("folder", `krupali-traders/products/${type.toLowerCase()}`);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body }
    );

    const data = await response.json();
    if (!response.ok || !data.secure_url) {
      throw new Error(data.error?.message || "Cloudinary upload failed.");
    }

    return String(data.secure_url);
  }

  async function startUpload() {
    if (!matches.length) {
      setError("No images matched a product slug. Rename files to match product slugs.");
      return;
    }

    if (loadingProducts) {
      setError("Products are still loading.");
      return;
    }

    setUploading(true);
    setProgress(0);
    setError("");
    setSuccess("");
    setResults([]);

    const uploaded: Array<{
      productId: string;
      url: string;
      alt: string;
      sortOrder: number;
    }> = [];
    const output: Result[] = [];

    try {
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        try {
          const url = await uploadOne(match);
          uploaded.push({
            productId: match.product.id,
            url,
            alt: match.product.name,
            sortOrder: match.sortOrder,
          });
          output.push({
            file: match.file.name,
            product: match.product.name,
            status: "uploaded",
            message: "Uploaded successfully.",
            url,
          });
        } catch (err) {
          output.push({
            file: match.file.name,
            product: match.product.name,
            status: "failed",
            message: err instanceof Error ? err.message : "Upload failed.",
          });
        }
        setProgress(Math.round(((i + 1) / matches.length) * 100));
      }

      if (!uploaded.length) {
        throw new Error("No images were uploaded.");
      }

      const saveResponse = await fetch("/api/admin/products/images/bulk", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          replaceExisting,
          images: uploaded,
        }),
      });

      const saveData = await saveResponse.json();
      if (!saveResponse.ok) {
        throw new Error(saveData.message || "Images uploaded but could not be saved to products.");
      }

      const failedCloudinary = output.filter((item) => item.status === "failed").length;
      const saved = Number(saveData.saved || uploaded.length);
      const skipped = unmatched.length;

      setResults([
        ...output,
        ...unmatched.map((file) => ({
          file: file.name,
          product: "—",
          status: "skipped" as const,
          message: "No product matched this filename.",
        })),
      ]);

      setSuccess(
        `${saved} image${saved === 1 ? "" : "s"} saved to ${type} products${
          failedCloudinary ? `, ${failedCloudinary} failed` : ""
        }${skipped ? `, ${skipped} unmatched` : ""}.`
      );

      onComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-blue-500/20 bg-[var(--surface)] p-5 shadow-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-black">Bulk Image Upload</h2>
          </div>
          <p className="mt-1 text-xs text-[var(--foreground)]/50">
            {type} products · Match image filenames to product slugs.
          </p>
        </div>

        {onClose && (
          <button type="button" onClick={onClose} className="self-end rounded-lg p-2 hover:bg-[var(--surface-soft)]">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.webp,.gif"
        onChange={handleFiles}
        className="hidden"
      />

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-blue-500/25 bg-blue-500/10 px-4 text-sm font-bold text-blue-600 transition hover:bg-blue-500 hover:text-white disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          Select Images
        </button>

        <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-purple-500/25 bg-purple-500/10 px-4 text-sm font-bold text-purple-600 transition hover:bg-purple-500 hover:text-white">
          <FileArchive className="h-4 w-4" />
          Upload ZIP
          <input
            type="file"
            accept=".zip,application/zip"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleZip(file);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-xs">
        <p className="font-bold">Filename matching</p>
        <p className="mt-1 text-[var(--foreground)]/55">
          <code>cinnamon.jpg</code> → <code>cinnamon</code>
          {" · "}
          <code>cinnamon-2.jpg</code> → second image for <code>cinnamon</code>
        </p>
      </div>

      <label className="mt-4 flex cursor-pointer items-center gap-2 text-xs font-semibold">
        <input
          type="checkbox"
          checked={replaceExisting}
          onChange={(e) => setReplaceExisting(e.target.checked)}
          disabled={uploading}
          className="h-4 w-4 rounded"
        />
        Replace existing product images
      </label>

      {files.length > 0 && (
        <div className="mt-5 rounded-xl border border-[var(--border)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="font-black">{files.length} images selected</span>
            <span className="text-xs text-[var(--foreground)]/50">
              {matches.length} matched · {unmatched.length} unmatched
            </span>
          </div>

          <div className="mt-3 max-h-52 overflow-auto space-y-1">
            {files.slice(0, 50).map((file) => {
              const { slug } = getSlugAndSort(file.name);
              const product = productMap.get(slug);
              return (
                <div key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs hover:bg-[var(--surface-soft)]">
                  <span className="truncate">{file.name}</span>
                  <span className={product ? "shrink-0 text-emerald-600" : "shrink-0 text-red-500"}>
                    {product ? product.name : "No match"}
                  </span>
                </div>
              );
            })}
            {files.length > 50 && (
              <p className="px-3 pt-2 text-[11px] text-[var(--foreground)]/40">
                Showing first 50 files.
              </p>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 flex gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-semibold text-red-600">
          <XCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mt-4 flex gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-600">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {uploading && (
        <div className="mt-4">
          <div className="mb-2 flex justify-between text-xs font-bold">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-soft)]">
            <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={startUpload}
        disabled={uploading || loadingProducts || matches.length === 0}
        className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/15 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {uploading ? `Uploading ${progress}%` : `Upload ${matches.length} Matched Images`}
      </button>

      {results.length > 0 && (
        <div className="mt-5 overflow-hidden rounded-xl border border-[var(--border)]">
          <div className="border-b border-[var(--border)] px-4 py-3 text-sm font-black">
            Upload Results
          </div>
          <div className="max-h-64 overflow-auto">
            {results.map((item, index) => (
              <div key={`${item.file}-${index}`} className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-2.5 text-xs last:border-0">
                <div className="min-w-0">
                  <p className="truncate font-bold">{item.file}</p>
                  <p className="truncate text-[var(--foreground)]/45">{item.product}</p>
                </div>
                <span className={
                  item.status === "uploaded"
                    ? "shrink-0 text-emerald-600"
                    : item.status === "skipped"
                      ? "shrink-0 text-amber-600"
                      : "shrink-0 text-red-600"
                }>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
