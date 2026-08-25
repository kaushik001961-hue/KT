"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  FileText,
  Image as ImageIcon,
  Loader2,
  Upload,
  Trash2,
  Save,
  Send,
  Tag,
  XCircle,
} from "lucide-react";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

type BlogStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "ARCHIVED";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  active: boolean;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  type: "IMPORT" | "EXPORT";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

type CategoryResponse = {
  success: boolean;
  message?: string;
  categories?: Category[];
};

type ProductResponse = {
  success: boolean;
  message?: string;
  products?: Product[];
};

type CreateResponse = {
  success: boolean;
  message?: string;
  post?: {
    id: string;
  };
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function NewBlogArticlePage() {
  const router = useRouter();

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loadingOptions, setLoadingOptions] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [slugEdited, setSlugEdited] =
    useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featuredImage: "",
    imageAlt: "",
    authorName: "Krupali Traders",
    categoryId: "",
    productId: "",
    tags: "",
    readingTime: "5",
    seoTitle: "",
    seoDescription: "",
  });

  useEffect(() => {
    async function loadOptions() {
      try {
        setLoadingOptions(true);
        setError("");

        const [
          categoryResponse,
          importProductResponse,
          exportProductResponse,
        ] = await Promise.all([
          fetch(
            "/api/admin/blog/categories",
            {
              cache: "no-store",
            }
          ),

          fetch(
            "/api/products?type=IMPORT",
            {
              cache: "no-store",
            }
          ),

          fetch(
            "/api/products?type=EXPORT",
            {
              cache: "no-store",
            }
          ),
        ]);

        const categoryResult =
          (await categoryResponse.json()) as CategoryResponse;

        if (!categoryResponse.ok) {
          throw new Error(
            categoryResult.message ||
              "Unable to load blog categories."
          );
        }

        setCategories(
          categoryResult.categories ||
            []
        );

        if (
          !importProductResponse.ok ||
          !exportProductResponse.ok
        ) {
          const importResult =
            (await importProductResponse.json().catch(() => ({}))) as ProductResponse;

          const exportResult =
            (await exportProductResponse.json().catch(() => ({}))) as ProductResponse;

          throw new Error(
            importResult.message ||
              exportResult.message ||
              "Unable to load products."
          );
        }

        const importProductResult =
          (await importProductResponse.json()) as ProductResponse;

        const exportProductResult =
          (await exportProductResponse.json()) as ProductResponse;

        setProducts([
          ...(importProductResult.products || []),
          ...(exportProductResult.products || []),
        ]);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load article options."
        );
      } finally {
        setLoadingOptions(false);
      }
    }

    loadOptions();
  }, []);

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleTitleChange(
    value: string
  ) {
    setForm((current) => ({
      ...current,
      title: value,

      slug: slugEdited
        ? current.slug
        : slugify(value),

      seoTitle:
        current.seoTitle ||
        value,
    }));
  }

  const contentWordCount =
    useMemo(() => {
      return form.content
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .length;
    }, [form.content]);

  const estimatedReadingTime =
    useMemo(() => {
      if (!contentWordCount) {
        return 1;
      }

      return Math.max(
        1,
        Math.ceil(
          contentWordCount / 200
        )
      );
    }, [contentWordCount]);

  async function handleImageUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("Image size must be 10 MB or smaller.");
      event.target.value = "";
      return;
    }

    try {
      setUploadingImage(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "/api/admin/blog/upload-image",
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

      updateField(
        "featuredImage",
        result.url || ""
      );

      if (!form.imageAlt.trim()) {
        updateField(
          "imageAlt",
          file.name
            .replace(/\.[^/.]+$/, "")
            .replace(/[-_]+/g, " ")
        );
      }

      setSuccess(
        "Featured image uploaded successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to upload image."
      );
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  }

  async function saveArticle(
    status: BlogStatus
  ) {
    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError(
        "Article title is required."
      );
      return;
    }

    if (!form.content.trim()) {
      setError(
        "Article content is required."
      );
      return;
    }

    if (!form.authorName.trim()) {
      setError(
        "Author name is required."
      );
      return;
    }

    if (!form.featuredImage.trim()) {
      setError(
        "Featured image is required. Please upload an image from your PC or enter an image URL."
      );
      return;
    }

    const slug =
      slugify(form.slug) ||
      slugify(form.title);

    if (!slug) {
      setError(
        "A valid article slug is required."
      );
      return;
    }

    let readingTime =
      Number(form.readingTime);

    if (
      !Number.isInteger(
        readingTime
      ) ||
      readingTime < 0
    ) {
      readingTime =
        estimatedReadingTime;
    }

    try {
      setSaving(true);

      const response =
        await fetch(
          "/api/admin/blog",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              title:
                form.title.trim(),

              slug,

              excerpt:
                form.excerpt.trim() ||
                null,

              content:
                form.content.trim(),

              featuredImage:
                form.featuredImage.trim() ||
                null,

              imageAlt:
                form.imageAlt.trim() ||
                null,

              authorName:
                form.authorName.trim(),

              categoryId:
                form.categoryId ||
                null,

              productId:
                form.productId ||
                null,

              tags:
                form.tags.trim() ||
                null,

              readingTime,

              seoTitle:
                form.seoTitle.trim() ||
                null,

              seoDescription:
                form.seoDescription.trim() ||
                null,

              status,
            }),
          }
        );

      const result =
        (await response.json()) as CreateResponse;

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to create article."
        );
      }

      setSuccess(
        status === "PUBLISHED"
          ? "Article published successfully."
          : "Article saved as draft successfully."
      );

      if (result.post?.id) {
        router.push(
          `/admin/blog/${result.post.id}/edit`
        );

        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create article."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    void saveArticle(
      "DRAFT"
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-7 lg:px-8 lg:py-8">

      <div className="mx-auto max-w-7xl space-y-6">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)]/90 p-5 shadow-xl shadow-blue-950/5 backdrop-blur-xl sm:p-7">

          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <Link
                href="/admin/blog"
                className="mb-4 inline-flex items-center gap-2 text-xs font-black text-blue-600 dark:text-blue-400"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Link>

              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <FileText className="h-6 w-6" />
                </div>

                <div>

                  <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                    Create Article
                  </h1>

                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Create a professional trade insight or company article.
                  </p>

                </div>

              </div>

            </div>

            <div className="flex items-center gap-2">

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  void saveArticle(
                    "DRAFT"
                  )
                }
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2.5 text-sm font-black transition hover:bg-[var(--background)] disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}

                Save Draft
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  void saveArticle(
                    "PUBLISHED"
                  )
                }
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}

                Publish
              </button>

            </div>

          </div>

        </header>

        {/* =====================================================
            ALERTS
        ===================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">

            <XCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <span>{error}</span>

          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">

            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

            <span>{success}</span>

          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"
        >

          {/* ===================================================
              MAIN COLUMN
          =================================================== */}

          <div className="space-y-6">

            {/* ARTICLE */}

            <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-lg shadow-blue-950/5 sm:p-7">

              <div className="mb-6">

                <h2 className="text-lg font-black">
                  Article Content
                </h2>

                <p className="mt-1 text-xs text-[var(--muted)]">
                  Write the main article content and introduction.
                </p>

              </div>

              <div className="space-y-5">

                <Field
                  label="Title"
                  required
                  hint="A clear, search-friendly article title."
                >
                  <input
                    value={form.title}
                    onChange={(event) =>
                      handleTitleChange(
                        event.target.value
                      )
                    }
                    placeholder="e.g. How to Choose the Right Packaging for International Export"
                    className="input"
                  />
                </Field>

                <Field
                  label="Slug"
                  hint="Used in the public article URL."
                >
                  <input
                    value={form.slug}
                    onChange={(event) => {
                      setSlugEdited(
                        true
                      );

                      updateField(
                        "slug",
                        slugify(
                          event.target.value
                        )
                      );
                    }}
                    placeholder="article-slug"
                    className="input"
                  />
                </Field>

                <Field
                  label="Excerpt"
                  hint="A short summary displayed on Blog cards."
                >
                  <textarea
                    value={form.excerpt}
                    onChange={(event) =>
                      updateField(
                        "excerpt",
                        event.target.value
                      )
                    }
                    rows={4}
                    placeholder="Briefly explain what readers will learn from this article..."
                    className="textarea"
                  />
                </Field>

                <Field
                  label="Content"
                  required
                  hint={`${contentWordCount} words • Estimated ${estimatedReadingTime} min read`}
                >
                  <textarea
                    value={form.content}
                    onChange={(event) =>
                      updateField(
                        "content",
                        event.target.value
                      )
                    }
                    rows={20}
                    placeholder="Write your article content here..."
                    className="textarea min-h-[420px]"
                  />
                </Field>

              </div>

            </section>

            {/* FEATURED IMAGE */}

            <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-lg shadow-blue-950/5 sm:p-7">

              <div className="mb-6 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                  <ImageIcon className="h-5 w-5" />
                </div>

                <div>

                  <h2 className="text-lg font-black">
                    Featured Image
                  </h2>

                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Use a high-quality image for article cards and sharing.
                  </p>

                </div>

              </div>

              <div className="space-y-5">

                <div className="rounded-2xl border border-dashed border-blue-500/30 bg-blue-500/5 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-black text-[var(--foreground)]">
                        Upload from your PC
                        <span className="ml-1 text-red-500">*</span>
                      </p>

                      <p className="mt-1 text-xs text-[var(--muted)]">
                        JPG, PNG, WEBP or GIF • Maximum 10 MB
                      </p>
                    </div>

                    <label
                      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 ${
                        uploadingImage
                          ? "pointer-events-none opacity-60"
                          : ""
                      }`}
                    >
                      {uploadingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}

                      {uploadingImage
                        ? "Uploading..."
                        : "Choose Image"}

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                </div>

                <Field
                  label="Featured Image URL"
                  hint="Optional alternative: paste a publicly accessible image URL."
                >
                  <input
                    value={
                      form.featuredImage
                    }
                    onChange={(event) =>
                      updateField(
                        "featuredImage",
                        event.target.value
                      )
                    }
                    placeholder="https://..."
                    className="input"
                  />
                </Field>

                {form.featuredImage && (
                  <div className="overflow-hidden rounded-2xl border border-emerald-500/25 bg-[var(--background)]">
                    <div className="flex items-center justify-between border-b border-emerald-500/15 bg-emerald-500/5 px-4 py-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wider text-emerald-600">
                          Image Ready
                        </p>

                        <p className="mt-1 max-w-[420px] truncate text-[11px] text-[var(--muted)]">
                          {form.featuredImage}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          updateField(
                            "featuredImage",
                            ""
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>

                    <img
                      src={
                        form.featuredImage
                      }
                      alt={
                        form.imageAlt ||
                        form.title ||
                        "Article preview"
                      }
                      className="max-h-[360px] w-full object-cover"
                    />
                  </div>
                )}

                <Field
                  label="Image Alt Text"
                  hint="Describe the image for accessibility and SEO."
                >
                  <input
                    value={
                      form.imageAlt
                    }
                    onChange={(event) =>
                      updateField(
                        "imageAlt",
                        event.target.value
                      )
                    }
                    placeholder="International export packaging"
                    className="input"
                  />
                </Field>

              </div>

            </section>

            {/* TAGS & SEO */}

            <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-lg shadow-blue-950/5 sm:p-7">

              <div className="mb-6 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <Tag className="h-5 w-5" />
                </div>

                <div>

                  <h2 className="text-lg font-black">
                    Tags & SEO
                  </h2>

                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Improve article discovery and search visibility.
                  </p>

                </div>

              </div>

              <div className="space-y-5">

                <Field
                  label="Tags"
                  hint="Separate tags with commas."
                >
                  <input
                    value={form.tags}
                    onChange={(event) =>
                      updateField(
                        "tags",
                        event.target.value
                      )
                    }
                    placeholder="export, import, packaging, trade"
                    className="input"
                  />
                </Field>

                <Field
                  label="SEO Title"
                  hint={`${form.seoTitle.length}/60 characters recommended`}
                >
                  <input
                    value={
                      form.seoTitle
                    }
                    onChange={(event) =>
                      updateField(
                        "seoTitle",
                        event.target.value
                      )
                    }
                    maxLength={70}
                    placeholder="SEO-friendly article title"
                    className="input"
                  />
                </Field>

                <Field
                  label="SEO Description"
                  hint={`${form.seoDescription.length}/160 characters recommended`}
                >
                  <textarea
                    value={
                      form.seoDescription
                    }
                    onChange={(event) =>
                      updateField(
                        "seoDescription",
                        event.target.value
                      )
                    }
                    maxLength={180}
                    rows={4}
                    placeholder="A concise search-engine description for this article..."
                    className="textarea"
                  />
                </Field>

              </div>

            </section>

          </div>

          {/* ===================================================
              SIDEBAR
          =================================================== */}

          <aside className="space-y-6">

            {/* SETTINGS */}

            <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-lg shadow-blue-950/5">

              <h2 className="text-lg font-black">
                Article Settings
              </h2>

              <div className="mt-5 space-y-5">

                <Field
                  label="Author"
                  required
                >
                  <input
                    value={
                      form.authorName
                    }
                    onChange={(event) =>
                      updateField(
                        "authorName",
                        event.target.value
                      )
                    }
                    placeholder="Krupali Traders"
                    className="input"
                  />
                </Field>

                <Field
                  label="Category"
                  hint="Choose the main topic."
                >
                  <select
                    value={
                      form.categoryId
                    }
                    onChange={(event) =>
                      updateField(
                        "categoryId",
                        event.target.value
                      )
                    }
                    disabled={
                      loadingOptions
                    }
                    className="select"
                  >
                    {categories
                      .filter(
                        (category) =>
                          category.active
                      )
                      .map(
                        (category) => (
                          <option
                            key={
                              category.id
                            }
                            value={
                              category.id
                            }
                          >
                            {category.name}
                          </option>
                        )
                      )}
                  </select>
                </Field>

                <Field
                  label="Related Product"
                  hint="Optional product CTA on the article."
                >
                  <select
                    value={
                      form.productId
                    }
                    onChange={(event) =>
                      updateField(
                        "productId",
                        event.target.value
                      )
                    }
                    disabled={
                      loadingOptions
                    }
                    className="select"
                  >
                    <optgroup label="Import Products">
                      {products
                        .filter(
                          (product) =>
                            product.type === "IMPORT" &&
                            product.status === "PUBLISHED"
                        )
                        .map(
                          (product) => (
                            <option
                              key={product.id}
                              value={product.id}
                            >
                              {product.name}
                            </option>
                          )
                        )}
                    </optgroup>

                    <optgroup label="Export Products">
                      {products
                        .filter(
                          (product) =>
                            product.type === "EXPORT" &&
                            product.status === "PUBLISHED"
                        )
                        .map(
                          (product) => (
                            <option
                              key={product.id}
                              value={product.id}
                            >
                              {product.name}
                            </option>
                          )
                        )}
                    </optgroup>
                  </select>
                </Field>

                <Field
                  label="Reading Time"
                  hint="Minutes displayed on the article."
                >
                  <input
                    type="number"
                    min={0}
                    value={
                      form.readingTime
                    }
                    onChange={(event) =>
                      updateField(
                        "readingTime",
                        event.target.value
                      )
                    }
                    className="input"
                  />
                </Field>

              </div>

            </section>

            {/* PUBLISH */}

            <section className="rounded-[2rem] border border-blue-500/20 bg-gradient-to-br from-blue-600 to-cyan-500 p-5 text-white shadow-xl shadow-blue-600/15">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                <Eye className="h-5 w-5" />
              </div>

              <h2 className="mt-5 text-lg font-black">
                Ready to Publish?
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/75">
                Save this article as a draft or publish it immediately to the public Blog.
              </p>

              <div className="mt-5 grid gap-2">

                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    void saveArticle(
                      "DRAFT"
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-black text-blue-600 transition hover:bg-white/90 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  Save Draft
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    void saveArticle(
                      "PUBLISHED"
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm font-black text-white transition hover:bg-white/15 disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  Publish Article
                </button>

              </div>

            </section>

            {/* CHECKLIST */}

            <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-lg shadow-blue-950/5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>

                  <h3 className="text-sm font-black">
                    Publishing Checklist
                  </h3>

                  <p className="mt-1 text-[11px] text-[var(--muted)]">
                    Complete these before publishing.
                  </p>

                </div>

              </div>

              <div className="mt-5 space-y-3">

                <ChecklistItem
                  label="Article title"
                  complete={
                    Boolean(
                      form.title.trim()
                    )
                  }
                />

                <ChecklistItem
                  label="Article content"
                  complete={
                    Boolean(
                      form.content.trim()
                    )
                  }
                />

                <ChecklistItem
                  label="Author"
                  complete={
                    Boolean(
                      form.authorName.trim()
                    )
                  }
                />

                <ChecklistItem
                  label="Category"
                  complete={
                    Boolean(
                      form.categoryId
                    )
                  }
                />

                <ChecklistItem
                  label="Featured image (required)"
                  complete={
                    Boolean(
                      form.featuredImage.trim()
                    )
                  }
                />

                <ChecklistItem
                  label="SEO description"
                  complete={
                    Boolean(
                      form.seoDescription.trim()
                    )
                  }
                />

              </div>

            </section>

          </aside>

        </form>

      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          height: 46px;
          border-radius: 0.85rem;
          border: 1px solid var(--border);
          background: var(--background);
          padding: 0 0.9rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 150ms ease;
        }

        .input:focus,
        .textarea:focus,
        .select:focus {
          border-color: rgb(59 130 246);
        }

        .input:disabled,
        .textarea:disabled,
        .select:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .textarea {
          width: 100%;
          border-radius: 0.85rem;
          border: 1px solid var(--border);
          background: var(--background);
          padding: 0.85rem 0.9rem;
          font-size: 0.875rem;
          line-height: 1.6;
          outline: none;
          resize: vertical;
          transition: border-color 150ms ease;
        }

        .select {
          width: 100%;
          height: 46px;
          border-radius: 0.85rem;
          border: 1px solid var(--border);
          background: var(--background);
          padding: 0 0.9rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 150ms ease;
        }
      `}</style>
    </main>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label className="text-xs font-black">
          {label}

          {required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </label>

        {hint && (
          <span className="text-[10px] text-[var(--muted)]">
            {hint}
          </span>
        )}
      </div>

      {children}
    </div>
  );
}

function ChecklistItem({
  label,
  complete,
}: {
  label: string;
  complete: boolean;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">

      {complete ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      ) : (
        <div className="h-4 w-4 rounded-full border border-[var(--border)]" />
      )}

      <span
        className={
          complete
            ? "text-[var(--foreground)]"
            : "text-[var(--muted)]"
        }
      >
        {label}
      </span>

    </div>
  );
}