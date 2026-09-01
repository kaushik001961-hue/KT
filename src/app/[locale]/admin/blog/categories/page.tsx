"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  FolderTree,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

type BlogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    posts?: number;
  };
};

type CategoriesResponse = {
  success: boolean;
  message?: string;
  categories?: BlogCategory[];
};

type CategoryResponse = {
  success: boolean;
  message?: string;
  category?: BlogCategory;
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

export default function BlogCategoriesPage() {
  const [categories, setCategories] =
    useState<BlogCategory[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [showForm, setShowForm] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    active: true,
  });

  useEffect(() => {
    void loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          "/api/admin/blog/categories",
          {
            cache: "no-store",
          }
        );

      const result =
        (await response.json()) as CategoriesResponse;

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to load categories."
        );
      }

      setCategories(
        result.categories || []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({
      name: "",
      slug: "",
      description: "",
      active: true,
    });

    setEditingId(null);
    setShowForm(false);
  }

  function startCreate() {
    setSuccess("");
    setError("");

    setForm({
      name: "",
      slug: "",
      description: "",
      active: true,
    });

    setEditingId(null);
    setShowForm(true);
  }

  function startEdit(
    category: BlogCategory
  ) {
    setSuccess("");
    setError("");

    setEditingId(category.id);

    setForm({
      name: category.name,
      slug: category.slug,
      description:
        category.description || "",
      active: category.active,
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleNameChange(
    value: string
  ) {
    setForm((current) => ({
      ...current,

      name: value,

      slug:
        editingId
          ? current.slug
          : slugify(value),
    }));
  }

  function updateField(
    field:
      | "slug"
      | "description",
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveCategory(
    event: FormEvent
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const name =
      form.name.trim();

    const slug =
      slugify(form.slug) ||
      slugify(form.name);

    if (!name) {
      setError(
        "Category name is required."
      );
      return;
    }

    if (!slug) {
      setError(
        "A valid category slug is required."
      );
      return;
    }

    try {
      setSaving(true);

      const url = editingId
        ? `/api/admin/blog/categories/${editingId}`
        : "/api/admin/blog/categories";

      const method = editingId
        ? "PATCH"
        : "POST";

      const response =
        await fetch(url, {
          method,

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name,
            slug,
            description:
              form.description.trim() ||
              null,
            active: form.active,
          }),
        });

      const result =
        (await response.json()) as CategoryResponse;

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to save category."
        );
      }

      setSuccess(
        editingId
          ? "Category updated successfully."
          : "Category created successfully."
      );

      resetForm();

      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save category."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleCategory(
    category: BlogCategory
  ) {
    setError("");
    setSuccess("");

    try {
      setSaving(true);

      const response =
        await fetch(
          `/api/admin/blog/categories/${category.id}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              active:
                !category.active,
            }),
          }
        );

      const result =
        (await response.json()) as CategoryResponse;

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to update category."
        );
      }

      setSuccess(
        !category.active
          ? "Category activated."
          : "Category deactivated."
      );

      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update category."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(
    category: BlogCategory
  ) {
    const postCount =
      category._count?.posts || 0;

    const message =
      postCount > 0
        ? `This category has ${postCount} article${
            postCount === 1
              ? ""
              : "s"
          }.\n\nDelete it anyway?`
        : `Delete "${category.name}"?`;

    const confirmed =
      window.confirm(message);

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        category.id
      );

      setError("");
      setSuccess("");

      const response =
        await fetch(
          `/api/admin/blog/categories/${category.id}`,
          {
            method: "DELETE",
          }
        );

      const result =
        (await response.json()) as CategoryResponse;

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to delete category."
        );
      }

      setSuccess(
        "Category deleted successfully."
      );

      if (
        editingId === category.id
      ) {
        resetForm();
      }

      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete category."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const activeCount =
    categories.filter(
      (category) =>
        category.active
    ).length;

  const totalPosts =
    categories.reduce(
      (total, category) =>
        total +
        (category._count?.posts ||
          0),
      0
    );

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-7 lg:px-8 lg:py-8">

      <div className="mx-auto max-w-7xl space-y-6">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)]/90 p-5 shadow-xl shadow-blue-950/5 backdrop-blur-xl sm:p-7">

          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

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
                  <FolderTree className="h-6 w-6" />
                </div>

                <div>

                  <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                    Blog Categories
                  </h1>

                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Organize articles into clear topics for readers and search engines.
                  </p>

                </div>

              </div>

            </div>

            <div className="flex flex-wrap items-center gap-2">

              <button
                type="button"
                onClick={() =>
                  void loadCategories()
                }
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2.5 text-sm font-black transition hover:bg-[var(--background)] disabled:opacity-50"
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

              <button
                type="button"
                onClick={
                  showForm
                    ? resetForm
                    : startCreate
                }
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
              >
                {showForm ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}

                {showForm
                  ? "Close"
                  : "New Category"}
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

        {/* =====================================================
            STATS
        ===================================================== */}

        <div className="grid gap-4 sm:grid-cols-3">

          <StatCard
            label="Total Categories"
            value={
              categories.length
            }
          />

          <StatCard
            label="Active Categories"
            value={activeCount}
          />

          <StatCard
            label="Articles Assigned"
            value={totalPosts}
          />

        </div>

        {/* =====================================================
            CREATE / EDIT FORM
        ===================================================== */}

        {showForm && (
          <section className="rounded-[2rem] border border-blue-500/20 bg-[var(--surface)] p-5 shadow-xl shadow-blue-950/5 sm:p-7">

            <div className="mb-6 flex items-center justify-between gap-4">

              <div>

                <h2 className="text-lg font-black">
                  {editingId
                    ? "Edit Category"
                    : "Create Category"}
                </h2>

                <p className="mt-1 text-xs text-[var(--muted)]">
                  {editingId
                    ? "Update the category details below."
                    : "Create a category for organizing your Blog articles."}
                </p>

              </div>

              <button
                type="button"
                onClick={
                  resetForm
                }
                className="rounded-full p-2 transition hover:bg-[var(--background)]"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <form
              onSubmit={
                saveCategory
              }
              className="grid gap-5 lg:grid-cols-2"
            >

              <div>

                <label className="mb-2 block text-xs font-black">
                  Category Name
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  value={form.name}
                  onChange={(event) =>
                    handleNameChange(
                      event.target.value
                    )
                  }
                  placeholder="e.g. International Trade"
                  className="input"
                />

              </div>

              <div>

                <label className="mb-2 block text-xs font-black">
                  Slug
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  value={form.slug}
                  onChange={(event) =>
                    updateField(
                      "slug",
                      slugify(
                        event.target.value
                      )
                    )
                  }
                  placeholder="international-trade"
                  className="input"
                />

              </div>

              <div className="lg:col-span-2">

                <label className="mb-2 block text-xs font-black">
                  Description
                </label>

                <textarea
                  value={
                    form.description
                  }
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value
                    )
                  }
                  rows={4}
                  placeholder="Briefly describe this category..."
                  className="textarea"
                />

              </div>

              <div className="lg:col-span-2">

                <label className="flex cursor-pointer items-center gap-3">

                  <input
                    type="checkbox"
                    checked={
                      form.active
                    }
                    onChange={(event) =>
                      setForm(
                        (current) => ({
                          ...current,
                          active:
                            event
                              .target
                              .checked,
                        })
                      )
                    }
                    className="h-4 w-4 rounded border-[var(--border)]"
                  />

                  <span>

                    <span className="block text-sm font-black">
                      Active Category
                    </span>

                    <span className="block text-xs text-[var(--muted)]">
                      Active categories can be selected when creating articles.
                    </span>

                  </span>

                </label>

              </div>

              <div className="flex flex-wrap gap-2 lg:col-span-2">

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}

                  {editingId
                    ? "Update Category"
                    : "Create Category"}
                </button>

                <button
                  type="button"
                  onClick={
                    resetForm
                  }
                  disabled={
                    saving
                  }
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-5 py-3 text-sm font-black transition hover:bg-[var(--background)] disabled:opacity-50"
                >
                  Cancel
                </button>

              </div>

            </form>

          </section>
        )}

        {/* =====================================================
            CATEGORY LIST
        ===================================================== */}

        <section className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-xl shadow-blue-950/5">

          <div className="flex flex-col gap-3 border-b border-[var(--border)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

            <div>

              <h2 className="text-lg font-black">
                All Categories
              </h2>

              <p className="mt-1 text-xs text-[var(--muted)]">
                Manage Blog categories and article assignments.
              </p>

            </div>

            <div className="text-xs font-bold text-[var(--muted)]">
              {categories.length}{" "}
              {categories.length ===
              1
                ? "category"
                : "categories"}
            </div>

          </div>

          {loading ? (
            <div className="flex min-h-[260px] items-center justify-center">

              <div className="flex items-center gap-3 text-sm font-semibold text-[var(--muted)]">

                <Loader2 className="h-5 w-5 animate-spin" />

                Loading categories...

              </div>

            </div>
          ) : categories.length ===
            0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <FolderTree className="h-8 w-8" />
              </div>

              <h3 className="mt-5 text-lg font-black">
                No categories yet
              </h3>

              <p className="mt-2 max-w-md text-sm text-[var(--muted)]">
                Create your first Blog category to organize articles by topic.
              </p>

              <button
                type="button"
                onClick={
                  startCreate
                }
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white"
              >
                <Plus className="h-4 w-4" />
                Create Category
              </button>

            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">

              {categories.map(
                (category) => {
                  const postCount =
                    category._count
                      ?.posts || 0;

                  return (
                    <div
                      key={
                        category.id
                      }
                      className="p-5 transition hover:bg-[var(--background)]/50 sm:p-6"
                    >

                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        <div className="flex min-w-0 items-start gap-4">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <FolderTree className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                              <h3 className="truncate text-sm font-black sm:text-base">
                                {category.name}
                              </h3>

                              <StatusBadge
                                active={
                                  category.active
                                }
                              />

                            </div>

                            <p className="mt-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                              /{category.slug}
                            </p>

                            {category.description && (
                              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                                {
                                  category.description
                                }
                              </p>
                            )}

                          </div>

                        </div>

                        <div className="flex flex-wrap items-center gap-2">

                          <div className="mr-2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-center">

                            <div className="text-lg font-black">
                              {
                                postCount
                              }
                            </div>

                            <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
                              {postCount ===
                              1
                                ? "Article"
                                : "Articles"}
                            </div>

                          </div>

                          <button
                            type="button"
                            disabled={
                              saving ||
                              deletingId !==
                                null
                            }
                            onClick={() =>
                              void toggleCategory(
                                category
                              )
                            }
                            className={`rounded-full border px-4 py-2 text-xs font-black transition disabled:opacity-50 ${
                              category.active
                                ? "border-amber-500/20 bg-amber-500/10 text-amber-600 hover:bg-amber-500/15 dark:text-amber-400"
                                : "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15 dark:text-emerald-400"
                            }`}
                          >
                            {category.active
                              ? "Deactivate"
                              : "Activate"}
                          </button>

                          <button
                            type="button"
                            disabled={
                              saving ||
                              deletingId !==
                                null
                            }
                            onClick={() =>
                              startEdit(
                                category
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-xs font-black transition hover:bg-[var(--background)] disabled:opacity-50"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            Edit
                          </button>

                          <button
                            type="button"
                            disabled={
                              deletingId !==
                              null
                            }
                            onClick={() =>
                              void deleteCategory(
                                category
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-black text-red-600 transition hover:bg-red-500/15 disabled:opacity-50 dark:text-red-400"
                          >
                            {deletingId ===
                            category.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}

                            Delete
                          </button>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>

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
        .textarea:focus {
          border-color: rgb(59 130 246);
        }

        .input:disabled,
        .textarea:disabled {
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
      `}</style>
    </main>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-lg shadow-blue-950/5">

      <p className="text-xs font-bold text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black tracking-tight">
        {value}
      </p>

    </div>
  );
}

function StatusBadge({
  active,
}: {
  active: boolean;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wide ${
        active
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "border-slate-500/20 bg-slate-500/10 text-slate-600 dark:text-slate-400"
      }`}
    >
      {active
        ? "Active"
        : "Inactive"}
    </span>
  );
}