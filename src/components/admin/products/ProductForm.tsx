"use client";

import Link from "next/link";
import {
  ImagePlus,
  Loader2,
  Save,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useRef, useState } from "react";

type ProductType = "IMPORT" | "EXPORT";

type ProductStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "ARCHIVED";

type Category = {
  id: string;
  name: string;
  type: ProductType;
};

type ProductImage = {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
};

type ExistingProduct = {
  id: string;
  name: string;
  slug: string;
  type: ProductType;
  status: ProductStatus;
  shortDescription: string | null;
  description: string | null;
  specifications: string | null;
  countryOfOrigin: string | null;
  packaging: string | null;
  minimumOrderQuantity: string | null;
  featured: boolean;
  categoryId: string | null;
  images?: ProductImage[];
};

type ProductFormProps = {
  type: ProductType;
  categories: Category[];
  product?: ExistingProduct;
};

type UploadingImage = {
  id: string;
  name: string;
  preview: string;
  progress: number;
};

export default function ProductForm({
  type,
  categories,
  product,
}: ProductFormProps) {
  const isEditMode = Boolean(product);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [name, setName] = useState(
    product?.name ?? ""
  );

  const [slug, setSlug] = useState(
    product?.slug ?? ""
  );

  const [categoryId, setCategoryId] = useState(
    product?.categoryId ?? ""
  );

  const [status, setStatus] =
    useState<ProductStatus>(
      product?.status ?? "DRAFT"
    );

  const [shortDescription, setShortDescription] =
    useState(product?.shortDescription ?? "");

  const [description, setDescription] =
    useState(product?.description ?? "");

  const [specifications, setSpecifications] =
    useState(product?.specifications ?? "");

  const [countryOfOrigin, setCountryOfOrigin] =
    useState(product?.countryOfOrigin ?? "");

  const [packaging, setPackaging] =
    useState(product?.packaging ?? "");

  const [
    minimumOrderQuantity,
    setMinimumOrderQuantity,
  ] = useState(
    product?.minimumOrderQuantity ?? ""
  );

  const [featured, setFeatured] = useState(
    product?.featured ?? false
  );

  const [images, setImages] = useState<
    ProductImage[]
  >(product?.images ?? []);

  const [uploadingImages, setUploadingImages] =
    useState<UploadingImage[]>([]);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingImageId, setDeletingImageId] =
    useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function createSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function handleNameChange(value: string) {
    setName(value);

    if (!isEditMode) {
      setSlug(createSlug(value));
    }
  }

  async function saveProduct(): Promise<
    string | null
  > {
    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      type,
      status,
      categoryId: categoryId || null,
      shortDescription:
        shortDescription.trim() || null,
      description:
        description.trim() || null,
      specifications:
        specifications.trim() || null,
      countryOfOrigin:
        countryOfOrigin.trim() || null,
      packaging:
        packaging.trim() || null,
      minimumOrderQuantity:
        minimumOrderQuantity.trim() || null,
      featured,
      images: images.map((image) => ({
        id: image.id,
        url: image.url,
        alt: image.alt,
        sortOrder: image.sortOrder,
      })),
    };

    const url = isEditMode
      ? `/api/admin/products/${product!.id}`
      : "/api/admin/products";

    const response = await fetch(url, {
      method: isEditMode ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          (isEditMode
            ? "Unable to update product."
            : "Unable to create product.")
      );
    }

    return result.product?.id ?? product?.id ?? null;
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!slug.trim()) {
      setError("Product slug is required.");
      return;
    }

    setSaving(true);

    try {
      const productId = await saveProduct();

      if (!productId) {
        throw new Error(
          "Product was saved, but no product ID was returned."
        );
      }

      if (uploadingImages.length > 0) {
        setSuccess(
          "Product saved. Please wait for image uploads."
        );
      } else {
        window.location.href =
          type === "IMPORT"
            ? "/admin/products/import"
            : "/admin/products/export";
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEditMode
            ? "Unable to update product."
            : "Unable to create product."
      );
    } finally {
      setSaving(false);
    }
  }

  async function uploadImages(
    files: FileList | null
  ) {
    if (!files || files.length === 0) {
      return;
    }

    setError("");
    setSuccess("");
    setUploading(true);

    let productId = product?.id ?? null;

    try {
      /*
       * New products do not have an ID until they
       * have been saved once.
       */
      if (!productId) {
        if (!name.trim()) {
          throw new Error(
            "Enter the product name before uploading images."
          );
        }

        if (!slug.trim()) {
          throw new Error(
            "Enter the product information before uploading images."
          );
        }

        setSaving(true);

        productId = await saveProduct();

        setSaving(false);

        if (!productId) {
          throw new Error(
            "Unable to create the product before uploading images."
          );
        }
      }

      const selectedFiles = Array.from(files);

      for (const file of selectedFiles) {
        if (!file.type.startsWith("image/")) {
          setError(
            `${file.name}: Only image files are allowed.`
          );
          continue;
        }

        if (file.size > 10 * 1024 * 1024) {
          setError(
            `${file.name}: Maximum image size is 10 MB.`
          );
          continue;
        }

        const temporaryId =
          `${Date.now()}-${Math.random()}`;

        const preview =
          URL.createObjectURL(file);

        setUploadingImages((current) => [
          ...current,
          {
            id: temporaryId,
            name: file.name,
            preview,
            progress: 10,
          },
        ]);

        try {
          const formData = new FormData();

          formData.append("file", file);

          const response = await fetch(
            `/api/admin/products/${productId}/images`,
            {
              method: "POST",
              body: formData,
            }
          );

          const result = await response.json();

          if (!response.ok) {
            throw new Error(
              result.message ||
                "Unable to upload image."
            );
          }

          const uploadedImage =
            result.image as ProductImage;

          setImages((current) => [
            ...current,
            uploadedImage,
          ]);

          setUploadingImages((current) =>
            current.map((item) =>
              item.id === temporaryId
                ? {
                    ...item,
                    progress: 100,
                  }
                : item
            )
          );

          setTimeout(() => {
            setUploadingImages((current) =>
              current.filter(
                (item) =>
                  item.id !== temporaryId
              )
            );

            URL.revokeObjectURL(preview);
          }, 400);
        } catch (err) {
          setError(
            err instanceof Error
              ? `${file.name}: ${err.message}`
              : `${file.name}: Upload failed.`
          );

          setUploadingImages((current) =>
            current.filter(
              (item) =>
                item.id !== temporaryId
            )
          );

          URL.revokeObjectURL(preview);
        }
      }

      setSuccess(
        "Image upload completed."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to upload images."
      );
    } finally {
      setSaving(false);
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function deleteImage(
    image: ProductImage
  ) {
    if (!product?.id) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this product image?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");
    setDeletingImageId(image.id);

    try {
      const response = await fetch(
        `/api/admin/products/${product.id}/images/${image.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to delete image."
        );
      }

      setImages((current) =>
        current
          .filter(
            (item) => item.id !== image.id
          )
          .map((item, index) => ({
            ...item,
            sortOrder: index,
          }))
      );

      setSuccess(
        "Image deleted successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete image."
      );
    } finally {
      setDeletingImageId(null);
    }
  }

  const filteredCategories =
    categories.filter(
      (category) => category.type === type
    );

  const typeName =
    type === "IMPORT" ? "Import" : "Export";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href={`/admin/products/${type.toLowerCase()}`}
            className="text-sm font-semibold text-[var(--foreground)]/50 transition hover:text-blue-600"
          >
            ← Back to {typeName} Products
          </Link>

          <h1 className="mt-4 text-3xl font-black text-[var(--foreground)]">
            {isEditMode
              ? `Edit ${typeName} Product`
              : `Add ${typeName} Product`}
          </h1>

          <p className="mt-2 text-sm text-[var(--foreground)]/50">
            {isEditMode
              ? "Update the product information below."
              : "Add a new product to your catalogue."}
          </p>
        </div>

        <button
          type="submit"
          disabled={saving || uploading}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}

          {saving
            ? isEditMode
              ? "Updating..."
              : "Saving..."
            : isEditMode
              ? "Update Product"
              : "Save Product"}
        </button>
      </div>

      {/* ALERTS */}
      {error && (
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 font-semibold text-red-600">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="shrink-0"
            aria-label="Close error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 font-semibold text-emerald-600">
          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
            className="shrink-0"
            aria-label="Close success message"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* BASIC INFORMATION */}
      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-lg sm:p-8">
        <h2 className="text-xl font-black text-[var(--foreground)]">
          Basic Information
        </h2>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <label className="mb-2 block text-sm font-bold">
              Product Name *
            </label>

            <input
              value={name}
              onChange={(e) =>
                handleNameChange(e.target.value)
              }
              placeholder="Enter product name"
              className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-[var(--foreground)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">
              Slug *
            </label>

            <input
              value={slug}
              onChange={(e) =>
                setSlug(e.target.value)
              }
              placeholder="product-slug"
              className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-[var(--foreground)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />

            <p className="mt-2 text-xs text-[var(--foreground)]/40">
              Used in the product URL.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">
              Category
            </label>

            <select
              value={categoryId}
              onChange={(e) =>
                setCategoryId(e.target.value)
              }
              className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-[var(--foreground)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="">
                Select category
              </option>

              {filteredCategories.map(
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
          </div>
        </div>
      </section>

      {/* IMAGES */}
      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-lg sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-[var(--foreground)]">
              Product Images
            </h2>

            <p className="mt-1 text-sm text-[var(--foreground)]/45">
              Upload high-quality product photos.
              Maximum 10 MB per image.
            </p>
          </div>

          <button
            type="button"
            disabled={
              uploading || saving
            }
            onClick={() =>
              fileInputRef.current?.click()
            }
            className="inline-flex items-center justify-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-5 py-3 text-sm font-bold text-blue-600 transition hover:bg-blue-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}

            {uploading
              ? "Uploading..."
              : "Upload Images"}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          onChange={(event) =>
            uploadImages(event.target.files)
          }
        />

        {/* UPLOADING */}
        {uploadingImages.length > 0 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {uploadingImages.map((image) => (
              <div
                key={image.id}
                className="overflow-hidden rounded-2xl border border-blue-500/20 bg-blue-500/5"
              >
                <div className="relative aspect-square">
                  <img
                    src={image.preview}
                    alt={image.name}
                    className="h-full w-full object-cover opacity-70"
                  />

                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                </div>

                <div className="p-3">
                  <p className="truncate text-xs font-bold">
                    {image.name}
                  </p>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-blue-500/10">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{
                        width: `${image.progress}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EXISTING IMAGES */}
        {images.length > 0 ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)]"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={image.url}
                    alt={
                      image.alt ||
                      name ||
                      "Product image"
                    }
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />

                  {/* MAIN IMAGE */}
                  {index === 0 && (
                    <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-black text-white shadow-lg">
                      <Star
                        className="h-3 w-3"
                        fill="currentColor"
                      />
                      Main
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      deleteImage(image)
                    }
                    disabled={
                      deletingImageId ===
                      image.id
                    }
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white opacity-0 shadow-lg transition group-hover:opacity-100 disabled:opacity-60"
                    title="Delete image"
                  >
                    {deletingImageId ===
                    image.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold">
                      Image {index + 1}
                    </p>

                    <p className="truncate text-[11px] text-[var(--foreground)]/40">
                      {image.alt ||
                        "Product image"}
                    </p>
                  </div>

                  {index === 0 && (
                    <Star
                      className="h-4 w-4 shrink-0 text-amber-500"
                      fill="currentColor"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-soft)] p-10 text-center">
            <ImagePlus className="mx-auto h-10 w-10 text-[var(--foreground)]/25" />

            <p className="mt-4 font-bold text-[var(--foreground)]/60">
              No product images yet
            </p>

            <p className="mt-1 text-sm text-[var(--foreground)]/40">
              Click “Upload Images” to add product
              photos.
            </p>
          </div>
        )}
      </section>

      {/* DESCRIPTION */}
      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-lg sm:p-8">
        <h2 className="text-xl font-black text-[var(--foreground)]">
          Description
        </h2>

        <div className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-bold">
              Short Description
            </label>

            <textarea
              value={shortDescription}
              onChange={(e) =>
                setShortDescription(
                  e.target.value
                )
              }
              rows={3}
              placeholder="Brief description of the product"
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-[var(--foreground)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">
              Full Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              rows={7}
              placeholder="Detailed product description"
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-[var(--foreground)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">
              Specifications
            </label>

            <textarea
              value={specifications}
              onChange={(e) =>
                setSpecifications(
                  e.target.value
                )
              }
              rows={6}
              placeholder="Grade, material, size, quality, etc."
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-[var(--foreground)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>
      </section>

      {/* TRADING INFORMATION */}
      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-lg sm:p-8">
        <h2 className="text-xl font-black text-[var(--foreground)]">
          Trading Information
        </h2>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-bold">
              Country of Origin
            </label>

            <input
              value={countryOfOrigin}
              onChange={(e) =>
                setCountryOfOrigin(
                  e.target.value
                )
              }
              className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-[var(--foreground)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">
              Packaging
            </label>

            <input
              value={packaging}
              onChange={(e) =>
                setPackaging(e.target.value)
              }
              className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-[var(--foreground)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">
              Minimum Order Quantity
            </label>

            <input
              value={minimumOrderQuantity}
              onChange={(e) =>
                setMinimumOrderQuantity(
                  e.target.value
                )
              }
              placeholder="e.g. 100 MT"
              className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-[var(--foreground)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>
      </section>

      {/* PUBLISHING */}
      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-lg sm:p-8">
        <h2 className="text-xl font-black text-[var(--foreground)]">
          Publishing
        </h2>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold">
              Status
            </label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value as ProductStatus
                )
              }
              className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-[var(--foreground)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
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

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) =>
                setFeatured(
                  e.target.checked
                )
              }
              className="h-5 w-5 accent-blue-600"
            />

            <div>
              <span className="font-bold">
                Featured Product
              </span>

              <p className="mt-1 text-xs text-[var(--foreground)]/40">
                Highlight this product on the
                website.
              </p>
            </div>
          </label>
        </div>
      </section>

      {/* BOTTOM SAVE */}
      <div className="flex justify-end pb-8">
        <button
          type="submit"
          disabled={saving || uploading}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}

          {saving
            ? isEditMode
              ? "Updating..."
              : "Saving..."
            : isEditMode
              ? "Update Product"
              : "Save Product"}
        </button>
      </div>
    </form>
  );
}