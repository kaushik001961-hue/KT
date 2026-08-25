"use client";

import Link from "next/link";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ProductType = "IMPORT" | "EXPORT";

type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

type Category = {
  id: string;
  name: string;
  type: ProductType;
};

type ProductImage = {
  id?: string;
  url: string;
  alt?: string | null;
  sortOrder?: number;
};

type ProductFormData = {
  id?: string;
  name: string;
  slug: string;
  type: ProductType;
  status: ProductStatus;
  shortDescription: string;
  description: string;
  specifications: string;
  countryOfOrigin: string;
  packaging: string;
  minimumOrderQuantity: string;
  featured: boolean;
  categoryId: string;
  images: ProductImage[];
};

type ProductFormProps = {
  type: ProductType;
  categories: Category[];
  initialData?: Partial<ProductFormData>;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ProductForm({
  type,
  categories,
  initialData,
}: ProductFormProps) {
  const isEdit = Boolean(initialData?.id);

  const [form, setForm] = useState<ProductFormData>({
    id: initialData?.id,
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    type,
    status: initialData?.status || "DRAFT",
    shortDescription: initialData?.shortDescription || "",
    description: initialData?.description || "",
    specifications: initialData?.specifications || "",
    countryOfOrigin: initialData?.countryOfOrigin || "",
    packaging: initialData?.packaging || "",
    minimumOrderQuantity:
      initialData?.minimumOrderQuantity || "",
    featured: initialData?.featured || false,
    categoryId: initialData?.categoryId || "",
    images: initialData?.images || [],
  });

  const [slugManuallyChanged, setSlugManuallyChanged] =
    useState(Boolean(initialData?.slug));

  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageAlt, setNewImageAlt] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const pageTitle =
    type === "IMPORT"
      ? "Add Import Product"
      : "Add Export Product";

  const typeLabel =
    type === "IMPORT" ? "Import" : "Export";

  const availableCategories = useMemo(
    () => categories.filter((category) => category.type === type),
    [categories, type]
  );

  useEffect(() => {
    if (!slugManuallyChanged && form.name) {
      setForm((current) => ({
        ...current,
        slug: slugify(current.name),
      }));
    }
  }, [form.name, slugManuallyChanged]);

  function updateField<K extends keyof ProductFormData>(
    field: K,
    value: ProductFormData[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function addImage() {
    const url = newImageUrl.trim();

    if (!url) {
      return;
    }

    setForm((current) => ({
      ...current,
      images: [
        ...current.images,
        {
          url,
          alt: newImageAlt.trim() || null,
          sortOrder: current.images.length,
        },
      ],
    }));

    setNewImageUrl("");
    setNewImageAlt("");
  }

  function removeImage(index: number) {
    setForm((current) => ({
      ...current,
      images: current.images
        .filter((_, imageIndex) => imageIndex !== index)
        .map((image, imageIndex) => ({
          ...image,
          sortOrder: imageIndex,
        })),
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!form.slug.trim()) {
      setError("Product slug is required.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        type: form.type,
        status: form.status,
        shortDescription:
          form.shortDescription.trim() || null,
        description: form.description.trim() || null,
        specifications:
          form.specifications.trim() || null,
        countryOfOrigin:
          form.countryOfOrigin.trim() || null,
        packaging: form.packaging.trim() || null,
        minimumOrderQuantity:
          form.minimumOrderQuantity.trim() || null,
        featured: form.featured,
        categoryId: form.categoryId || null,
        images: form.images.map((image, index) => ({
          url: image.url,
          alt: image.alt || null,
          sortOrder: index,
        })),
      };

      const response = await fetch(
        form.id
          ? `/api/admin/products/${form.id}`
          : "/api/admin/products",
        {
          method: form.id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to save product."
        );
      }

      setSuccess(
        form.id
          ? "Product updated successfully."
          : "Product created successfully."
      );

      if (!form.id && result.product?.id) {
        window.location.href =
          "/admin/products/import";
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Top heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href={
              type === "IMPORT"
                ? "/admin/products/import"
                : "/admin/products/export"
            }
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]/50 transition hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {typeLabel} Products
          </Link>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
              <Upload className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                {typeLabel} Product
              </p>

              <h1 className="mt-1 text-3xl font-black tracking-tight text-[var(--foreground)]">
                {isEdit ? "Edit Product" : pageTitle}
              </h1>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-4 w-4" />

          {saving
            ? "Saving..."
            : isEdit
              ? "Update Product"
              : "Save Product"}
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm font-semibold text-emerald-600">
          {success}
        </div>
      )}

      {/* Basic information */}
      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-lg shadow-blue-950/5 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-black text-[var(--foreground)]">
            Basic Information
          </h2>

          <p className="mt-1 text-sm text-[var(--foreground)]/50">
            Enter the main information about this product.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <label className="mb-2 block text-sm font-bold text-[var(--foreground)]">
              Product Name
              <span className="ml-1 text-red-500">*</span>
            </label>

            <input
              type="text"
              value={form.name}
              onChange={(event) =>
                updateField("name", event.target.value)
              }
              placeholder="Example: Premium Italian Marble"
              className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-[var(--foreground)]">
              Slug
              <span className="ml-1 text-red-500">*</span>
            </label>

            <input
              type="text"
              value={form.slug}
              onChange={(event) => {
                setSlugManuallyChanged(true);

                updateField(
                  "slug",
                  slugify(event.target.value)
                );
              }}
              placeholder="premium-italian-marble"
              className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />

            <p className="mt-2 text-xs text-[var(--foreground)]/40">
              Used in the product URL.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-[var(--foreground)]">
              Category
            </label>

            <select
              value={form.categoryId}
              onChange={(event) =>
                updateField(
                  "categoryId",
                  event.target.value
                )
              }
              className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="">
                Select category
              </option>

              {availableCategories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>

            {availableCategories.length === 0 && (
              <p className="mt-2 text-xs text-amber-600">
                No {typeLabel.toLowerCase()} categories
                are available yet.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Descriptions */}
      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-lg shadow-blue-950/5 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-black text-[var(--foreground)]">
            Product Description
          </h2>

          <p className="mt-1 text-sm text-[var(--foreground)]/50">
            Describe the product and its key specifications.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-bold text-[var(--foreground)]">
              Short Description
            </label>

            <textarea
              value={form.shortDescription}
              onChange={(event) =>
                updateField(
                  "shortDescription",
                  event.target.value
                )
              }
              rows={3}
              placeholder="Short summary displayed on product cards..."
              className="w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm leading-6 text-[var(--foreground)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-[var(--foreground)]">
              Full Description
            </label>

            <textarea
              value={form.description}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value
                )
              }
              rows={8}
              placeholder="Enter the complete product description..."
              className="w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm leading-6 text-[var(--foreground)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-[var(--foreground)]">
              Specifications
            </label>

            <textarea
              value={form.specifications}
              onChange={(event) =>
                updateField(
                  "specifications",
                  event.target.value
                )
              }
              rows={7}
              placeholder={`Example:
Grade: Premium
Finish: Polished
Thickness: 18-20 mm
Color: Natural
Origin: Italy`}
              className="w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 font-mono text-sm leading-6 text-[var(--foreground)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>
      </section>

      {/* Trading information */}
      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-lg shadow-blue-950/5 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-black text-[var(--foreground)]">
            Trading Information
          </h2>

          <p className="mt-1 text-sm text-[var(--foreground)]/50">
            Add sourcing, packaging and order information.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-bold text-[var(--foreground)]">
              Country of Origin
            </label>

            <input
              type="text"
              value={form.countryOfOrigin}
              onChange={(event) =>
                updateField(
                  "countryOfOrigin",
                  event.target.value
                )
              }
              placeholder="India"
              className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-[var(--foreground)]">
              Packaging
            </label>

            <input
              type="text"
              value={form.packaging}
              onChange={(event) =>
                updateField(
                  "packaging",
                  event.target.value
                )
              }
              placeholder="Export worthy packaging"
              className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-[var(--foreground)]">
              Minimum Order Quantity
            </label>

            <input
              type="text"
              value={form.minimumOrderQuantity}
              onChange={(event) =>
                updateField(
                  "minimumOrderQuantity",
                  event.target.value
                )
              }
              placeholder="100 units"
              className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>
      </section>

      {/* Images */}
      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-lg shadow-blue-950/5 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-black text-[var(--foreground)]">
            Product Images
          </h2>

          <p className="mt-1 text-sm text-[var(--foreground)]/50">
            Add image URLs now. Cloudinary upload can be
            connected next.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <input
            type="url"
            value={newImageUrl}
            onChange={(event) =>
              setNewImageUrl(event.target.value)
            }
            placeholder="https://example.com/product.jpg"
            className="h-12 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />

          <input
            type="text"
            value={newImageAlt}
            onChange={(event) =>
              setNewImageAlt(event.target.value)
            }
            placeholder="Image alt text"
            className="h-12 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />

          <button
            type="button"
            onClick={addImage}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            <Upload className="h-4 w-4" />
            Add Image
          </button>
        </div>

        {form.images.length > 0 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {form.images.map((image, index) => (
              <div
                key={`${image.url}-${index}`}
                className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)]"
              >
                <div className="relative aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={
                      image.alt ||
                      form.name ||
                      "Product image"
                    }
                    className="h-full w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-red-600"
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-3">
                  <p className="truncate text-xs font-semibold text-[var(--foreground)]/60">
                    {image.alt || "Product image"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Publishing */}
      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-lg shadow-blue-950/5 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-black text-[var(--foreground)]">
            Publishing
          </h2>

          <p className="mt-1 text-sm text-[var(--foreground)]/50">
            Control the visibility of this product.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-[var(--foreground)]">
              Status
            </label>

            <select
              value={form.status}
              onChange={(event) =>
                updateField(
                  "status",
                  event.target.value as ProductStatus
                )
              }
              className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-sm font-semibold text-[var(--foreground)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="DRAFT">
                Draft
              </option>

              <option value="PUBLISHED">
                Published
              </option>

              <option value="ARCHIVED">
                Archived
              </option>
            </select>
          </div>

          <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) =>
                updateField(
                  "featured",
                  event.target.checked
                )
              }
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />

            <div>
              <div className="font-bold text-[var(--foreground)]">
                Featured Product
              </div>

              <div className="mt-1 text-xs text-[var(--foreground)]/50">
                Highlight this product on the website.
              </div>
            </div>
          </label>
        </div>
      </section>

      {/* Bottom actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={
            type === "IMPORT"
              ? "/admin/products/import"
              : "/admin/products/export"
          }
          className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-bold text-[var(--foreground)] transition hover:border-blue-500 hover:text-blue-600"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-4 w-4" />

          {saving
            ? "Saving..."
            : isEdit
              ? "Update Product"
              : "Save Product"}
        </button>
      </div>
    </form>
  );
}