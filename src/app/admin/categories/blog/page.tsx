"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Edit3,
  FolderTree,
  Loader2,
  Power,
  RefreshCw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type BlogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  active: boolean;
  _count?: {
    posts?: number;
    articles?: number;
  };
  postsCount?: number;
  articlesCount?: number;
};

type CategoriesResponse = {
  success?: boolean;
  message?: string;
  categories?: BlogCategory[];
};

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  active: true,
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

function getArticleCount(category: BlogCategory) {
  return (
    category._count?.posts ??
    category._count?.articles ??
    category.postsCount ??
    category.articlesCount ??
    0
  );
}

export default function BlogCategoriesPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function loadCategories() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/blog/categories", {
        cache: "no-store",
      });

      const result = (await response.json()) as CategoriesResponse;

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to load Blog categories."
        );
      }

      setCategories(result.categories || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load Blog categories."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function startEdit(category: BlogCategory) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      active: category.active,
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function saveCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    const slug = slugify(form.slug || form.name);

    if (!name) {
      setError("Category name is required.");
      return;
    }

    if (!slug) {
      setError("A valid category slug is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        editingId
          ? `/api/admin/blog/categories/${editingId}`
          : "/api/admin/blog/categories",
        {
          method: editingId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            slug,
            description: form.description.trim() || null,
            active: form.active,
          }),
        }
      );

      const result = (await response.json()) as CategoriesResponse;

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to save Blog category."
        );
      }

      setSuccess(
        editingId
          ? "Blog category updated successfully."
          : "Blog category created successfully."
      );

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save Blog category."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleCategory(category: BlogCategory) {
    try {
      setActionId(category.id);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/blog/categories/${category.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: category.name,
            slug: category.slug,
            description: category.description,
            active: !category.active,
          }),
        }
      );

      const result = (await response.json()) as CategoriesResponse;

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to update Blog category."
        );
      }

      setSuccess(
        category.active
          ? "Blog category deactivated."
          : "Blog category activated."
      );

      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update Blog category."
      );
    } finally {
      setActionId(null);
    }
  }

  async function deleteCategory(category: BlogCategory) {
    const articleCount = getArticleCount(category);

    const confirmed = window.confirm(
      articleCount > 0
        ? `"${category.name}" is assigned to ${articleCount} article(s). Delete this category?`
        : `Delete "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      setActionId(category.id);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/blog/categories/${category.id}`,
        {
          method: "DELETE",
        }
      );

      const result = (await response.json()) as CategoriesResponse;

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to delete Blog category."
        );
      }

      setSuccess(
        result.message || "Blog category deleted successfully."
      );

      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete Blog category."
      );
    } finally {
      setActionId(null);
    }
  }

  const activeCount = useMemo(
    () => categories.filter((category) => category.active).length,
    [categories]
  );

  const articleCount = useMemo(
    () =>
      categories.reduce(
        (total, category) => total + getArticleCount(category),
        0
      ),
    [categories]
  );

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-6 transition-colors duration-300 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <header className="relative mb-6 overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-lg shadow-blue-950/5 sm:p-7">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link
                href="/admin/categories"
                className="inline-flex items-center gap-2 text-xs font-black text-blue-600 transition hover:gap-3"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Categories
              </Link>

              <div className="mt-5 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
                  <FolderTree className="h-6 w-6" />
                </div>

                <div>
                  <h1 className="text-2xl font-black tracking-tight text-[var(--foreground)] sm:text-3xl">
                    Blog Categories
                  </h1>

                  <p className="mt-1 text-sm text-[var(--foreground)]/55">
                    Organize articles into clear topics for readers and search engines.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={loadCategories}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-bold text-[var(--foreground)] transition hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>

              <button
                type="button"
                onClick={startCreate}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <span className="text-lg leading-none">+</span>
                New Category
              </button>
            </div>
          </div>
        </header>

        {/* MESSAGES */}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-semibold text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            {success}
          </div>
        )}

        {/* STATS */}

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
            <p className="text-xs font-bold text-[var(--foreground)]/55">
              Total Categories
            </p>
            <p className="mt-2 text-3xl font-black text-[var(--foreground)]">
              {categories.length}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
            <p className="text-xs font-bold text-[var(--foreground)]/55">
              Active Categories
            </p>
            <p className="mt-2 text-3xl font-black text-emerald-600">
              {activeCount}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
            <p className="text-xs font-bold text-[var(--foreground)]/55">
              Articles Assigned
            </p>
            <p className="mt-2 text-3xl font-black text-blue-600">
              {articleCount}
            </p>
          </div>
        </div>

        {/* CATEGORY LIST */}

        <section className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-lg shadow-blue-950/5">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5 sm:px-7">
            <div>
              <h2 className="text-lg font-black text-[var(--foreground)]">
                All Categories
              </h2>
              <p className="mt-1 text-xs text-[var(--foreground)]/50">
                Manage Blog categories and article assignments.
              </p>
            </div>

            <span className="text-xs font-bold text-[var(--foreground)]/55">
              {categories.length} {categories.length === 1 ? "category" : "categories"}
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]/50">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading Blog categories...
              </div>
            </div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
                <FolderTree className="h-6 w-6" />
              </div>

              <h3 className="mt-4 text-lg font-black text-[var(--foreground)]">
                No Blog categories yet
              </h3>

              <p className="mt-1 text-sm text-[var(--foreground)]/50">
                Create your first Blog category to use it while creating articles.
              </p>

              <button
                type="button"
                onClick={startCreate}
                className="mt-5 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Create Category
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {categories.map((category) => {
                const count = getArticleCount(category);
                const busy = actionId === category.id;

                return (
                  <div
                    key={category.id}
                    className="flex flex-col gap-5 px-6 py-6 transition hover:bg-[var(--surface-soft)]/60 sm:flex-row sm:items-center sm:justify-between sm:px-7"
                  >
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
                        <FolderTree className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-black text-[var(--foreground)]">
                            {category.name}
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
                              category.active
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-gray-500/10 text-gray-500"
                            }`}
                          >
                            {category.active ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <p className="mt-1 text-xs font-medium text-blue-600">
                          /{category.slug}
                        </p>

                        {category.description && (
                          <p className="mt-2 max-w-2xl text-sm text-[var(--foreground)]/55">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <div className="mr-1 flex min-w-[78px] flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2">
                        <span className="text-lg font-black text-[var(--foreground)]">
                          {count}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-wide text-[var(--foreground)]/45">
                          Articles
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleCategory(category)}
                        disabled={busy}
                        className="rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-2.5 text-xs font-bold text-amber-600 transition hover:bg-amber-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {busy ? "Saving..." : category.active ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        type="button"
                        onClick={() => startEdit(category)}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-xs font-bold text-[var(--foreground)] transition hover:border-blue-500 hover:text-blue-600 disabled:opacity-50"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteCategory(category)}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 rounded-full border border-red-500/25 bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* CREATE / EDIT MODAL */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                  {editingId ? "Edit Category" : "New Category"}
                </p>

                <h2 className="mt-2 text-2xl font-black text-[var(--foreground)]">
                  {editingId ? "Update Blog Category" : "Create Blog Category"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[var(--foreground)]/60 transition hover:border-red-500 hover:text-red-600 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={saveCategory} className="mt-7 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-[var(--foreground)]">
                  Category Name *
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => {
                    const value = event.target.value;

                    setForm((current) => ({
                      ...current,
                      name: value,
                      slug: editingId ? current.slug : slugify(value),
                    }));
                  }}
                  placeholder="Example: International Trade"
                  className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[var(--foreground)]">
                  Slug *
                </label>

                <input
                  type="text"
                  value={form.slug}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      slug: slugify(event.target.value),
                    }))
                  }
                  placeholder="international-trade"
                  className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[var(--foreground)]">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Short description of this Blog category..."
                  className="w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <label className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                <div>
                  <p className="text-sm font-bold text-[var(--foreground)]">
                    Active Category
                  </p>
                  <p className="mt-1 text-xs text-[var(--foreground)]/50">
                    Active categories appear in the Blog creation dropdown.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      active: event.target.checked,
                    }))
                  }
                  className="h-5 w-5 accent-blue-600"
                />
              </label>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-bold text-[var(--foreground)] transition hover:border-red-500 hover:text-red-600 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}

                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Category"
                      : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
