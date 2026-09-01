"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Archive,
  ArrowLeft,
  CheckCircle2,
  Eye,
  FileText,
  Image as ImageIcon,
  Loader2,
  Save,
  Send,
  Tag,
  Trash2,
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

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  imageAlt: string | null;
  authorName: string;
  status: BlogStatus;
  publishedAt: string | null;
  categoryId: string | null;
  productId: string | null;
  tags: string | null;
  readingTime: number | null;
  seoTitle: string | null;
  seoDescription: string | null;
  category: Category | null;
  product: Product | null;
  createdAt: string;
  updatedAt: string;
};

type BlogResponse = {
  success: boolean;
  message?: string;
  post?: BlogPost;
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function EditBlogArticlePage() {
  const params = useParams();
  const router = useRouter();

  const id =
    typeof params.id === "string"
      ? params.id
      : "";

  const [post, setPost] =
    useState<BlogPost | null>(null);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [loadingOptions, setLoadingOptions] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [slugEdited, setSlugEdited] =
    useState(true);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featuredImage: "",
    imageAlt: "",
    authorName: "",
    categoryId: "",
    productId: "",
    tags: "",
    readingTime: "5",
    seoTitle: "",
    seoDescription: "",
  });

  useEffect(() => {
    if (!id) {
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        setLoadingOptions(true);
        setError("");

        const [
          postResponse,
          categoryResponse,
          productResponse,
        ] = await Promise.all([
          fetch(
            `/api/admin/blog/${id}`,
            {
              cache: "no-store",
            }
          ),

          fetch(
            "/api/admin/blog/categories",
            {
              cache: "no-store",
            }
          ),

          fetch(
            "/api/products",
            {
              cache: "no-store",
            }
          ),
        ]);

        const postResult =
          (await postResponse.json()) as BlogResponse;

        if (!postResponse.ok) {
          throw new Error(
            postResult.message ||
              "Unable to load article."
          );
        }

        if (!postResult.post) {
          throw new Error(
            "Article was not found."
          );
        }

        const loadedPost =
          postResult.post;

        setPost(loadedPost);

        setForm({
          title:
            loadedPost.title || "",

          slug:
            loadedPost.slug || "",

          excerpt:
            loadedPost.excerpt || "",

          content:
            loadedPost.content || "",

          featuredImage:
            loadedPost.featuredImage ||
            "",

          imageAlt:
            loadedPost.imageAlt || "",

          authorName:
            loadedPost.authorName ||
            "",

          categoryId:
            loadedPost.categoryId ||
            "",

          productId:
            loadedPost.productId ||
            "",

          tags:
            loadedPost.tags || "",

          readingTime:
            loadedPost.readingTime !==
              null &&
            loadedPost.readingTime !==
              undefined
              ? String(
                  loadedPost.readingTime
                )
              : "5",

          seoTitle:
            loadedPost.seoTitle ||
            "",

          seoDescription:
            loadedPost.seoDescription ||
            "",
        });

        const categoryResult =
          (await categoryResponse.json()) as CategoryResponse;

        if (categoryResponse.ok) {
          setCategories(
            categoryResult.categories ||
              []
          );
        }

        if (productResponse.ok) {
          const productResult =
            (await productResponse.json()) as ProductResponse;

          setProducts(
            productResult.products ||
              []
          );
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load article."
        );
      } finally {
        setLoading(false);
        setLoadingOptions(false);
      }
    }

    void loadData();
  }, [id]);

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

  async function saveArticle(
    status?: BlogStatus
  ) {
    if (!id) {
      return;
    }

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
          `/api/admin/blog/${id}`,
          {
            method: "PATCH",

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

              ...(status
                ? { status }
                : {}),
            }),
          }
        );

      const result =
        (await response.json()) as BlogResponse;

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to save article."
        );
      }

      if (result.post) {
        setPost(
          result.post
        );
      }

      setSuccess(
        status === "PUBLISHED"
          ? "Article published successfully."
          : status === "ARCHIVED"
            ? "Article archived successfully."
            : status === "DRAFT"
              ? "Article moved to draft successfully."
              : "Article saved successfully."
      );

      if (result.post) {
        setPost(
          result.post
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save article."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteArticle() {
    if (!id || !post) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${post.title}"?\n\nThis action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      const response =
        await fetch(
          `/api/admin/blog/${id}`,
          {
            method: "DELETE",
          }
        );

      const result =
        (await response.json()) as BlogResponse;

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to delete article."
        );
      }

      router.push(
        "/admin/blog"
      );

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete article."
      );
    } finally {
      setDeleting(false);
    }
  }

  function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    void saveArticle();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--background)] text-[var(--foreground)]">
        <div className="flex items-center gap-3 text-sm font-semibold text-[var(--muted)]">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading article...
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)]">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
          <XCircle className="mx-auto h-10 w-10 text-red-500" />

          <h1 className="mt-4 text-2xl font-black">
            Article Not Found
          </h1>

          <p className="mt-2 text-sm text-[var(--muted)]">
            {error ||
              "The requested article could not be found."}
          </p>

          <Link
            href="/admin/blog"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </div>
      </main>
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

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <Link
                href="/admin/blog"
                className="mb-4 inline-flex items-center gap-2 text-xs font-black text-blue-600 dark:text-blue-400"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Link>

              <div className="flex items-start gap-3">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <FileText className="h-6 w-6" />
                </div>

                <div className="min-w-0">

                  <div className="flex flex-wrap items-center gap-2">

                    <h1 className="max-w-2xl text-2xl font-black tracking-tight sm:text-3xl">
                      Edit Article
                    </h1>

                    <StatusBadge
                      status={
                        post.status
                      }
                    />

                  </div>

                  <p className="mt-1 max-w-2xl truncate text-sm text-[var(--muted)]">
                    {post.title}
                  </p>

                </div>

              </div>

            </div>

            <div className="flex flex-wrap items-center gap-2">

              {post.status ===
                "PUBLISHED" && (
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2.5 text-sm font-black transition hover:bg-[var(--background)]"
                >
                  <Eye className="h-4 w-4" />
                  View
                </Link>
              )}

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  void saveArticle()
                }
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2.5 text-sm font-black transition hover:bg-[var(--background)] disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}

                Save
              </button>

              {post.status !==
                "PUBLISHED" && (
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
              )}

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
              MAIN
          =================================================== */}

          <div className="space-y-6">

            <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-lg shadow-blue-950/5 sm:p-7">

              <div className="mb-6">

                <h2 className="text-lg font-black">
                  Article Content
                </h2>

                <p className="mt-1 text-xs text-[var(--muted)]">
                  Edit your article content and presentation.
                </p>

              </div>

              <div className="space-y-5">

                <Field
                  label="Title"
                  required
                >
                  <input
                    value={form.title}
                    onChange={(event) =>
                      handleTitleChange(
                        event.target.value
                      )
                    }
                    className="input"
                  />
                </Field>

                <Field
                  label="Slug"
                  hint="Public article URL slug."
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
                    className="input"
                  />
                </Field>

                <Field
                  label="Excerpt"
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
                    className="textarea min-h-[420px]"
                  />
                </Field>

              </div>

            </section>

            {/* IMAGE */}

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
                    Image used for cards, sharing and article header.
                  </p>
                </div>

              </div>

              <div className="space-y-5">

                <Field
                  label="Featured Image URL"
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
                  <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)]">
                    <img
                      src={
                        form.featuredImage
                      }
                      alt={
                        form.imageAlt ||
                        form.title
                      }
                      className="max-h-[380px] w-full object-cover"
                    />
                  </div>
                )}

                <Field
                  label="Image Alt Text"
                >
                  <input
                    value={form.imageAlt}
                    onChange={(event) =>
                      updateField(
                        "imageAlt",
                        event.target.value
                      )
                    }
                    className="input"
                  />
                </Field>

              </div>

            </section>

            {/* SEO */}

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
                    Optimize the article for search engines.
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
                    className="input"
                  />
                </Field>

                <Field
                  label="SEO Title"
                  hint={`${form.seoTitle.length}/60 recommended`}
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
                    className="input"
                  />
                </Field>

                <Field
                  label="SEO Description"
                  hint={`${form.seoDescription.length}/160 recommended`}
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
                    className="input"
                  />
                </Field>

                <Field
                  label="Category"
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
                    <option value="">
                      Uncategorized
                    </option>

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
                    <option value="">
                      No related product
                    </option>

                    {products.map(
                      (product) => (
                        <option
                          key={
                            product.id
                          }
                          value={
                            product.id
                          }
                        >
                          {product.name} •{" "}
                          {product.type}
                        </option>
                      )
                    )}
                  </select>
                </Field>

                <Field
                  label="Reading Time"
                  hint="Minutes"
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

            {/* STATUS */}

            <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-lg shadow-blue-950/5">

              <h2 className="text-lg font-black">
                Publishing
              </h2>

              <div className="mt-5 space-y-3">

                {post.status !==
                  "PUBLISHED" && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      void saveArticle(
                        "PUBLISHED"
                      )
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    Publish Article
                  </button>
                )}

                {post.status ===
                  "PUBLISHED" && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      void saveArticle(
                        "DRAFT"
                      )
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm font-black text-amber-600 dark:text-amber-400"
                  >
                    <FileText className="h-4 w-4" />
                    Move to Draft
                  </button>
                )}

                {post.status !==
                  "ARCHIVED" && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      void saveArticle(
                        "ARCHIVED"
                      )
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-500/20 bg-slate-500/10 px-4 py-3 text-sm font-black text-slate-600 dark:text-slate-400"
                  >
                    <Archive className="h-4 w-4" />
                    Archive Article
                  </button>
                )}

                {post.status ===
                  "ARCHIVED" && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      void saveArticle(
                        "DRAFT"
                      )
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm font-black text-amber-600 dark:text-amber-400"
                  >
                    <FileText className="h-4 w-4" />
                    Restore to Draft
                  </button>
                )}

                <button
                  type="button"
                  disabled={
                    deleting ||
                    saving
                  }
                  onClick={() =>
                    void deleteArticle()
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-600 transition hover:bg-red-500/15 disabled:opacity-50 dark:text-red-400"
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}

                  Delete Article
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
                    Article Checklist
                  </h3>

                  <p className="mt-1 text-[11px] text-[var(--muted)]">
                    Recommended before publishing.
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
                  label="Featured image"
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

function StatusBadge({
  status,
}: {
  status: BlogStatus;
}) {
  const styles: Record<
    BlogStatus,
    string
  > = {
    DRAFT:
      "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",

    PUBLISHED:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",

    ARCHIVED:
      "border-slate-500/20 bg-slate-500/10 text-slate-600 dark:text-slate-400",
  };

  const labels: Record<
    BlogStatus,
    string
  > = {
    DRAFT: "Draft",
    PUBLISHED: "Published",
    ARCHIVED: "Archived",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide ${styles[status]}`}
    >
      {labels[status]}
    </span>
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