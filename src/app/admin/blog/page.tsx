"use client";

import Link from "next/link";
import {
  Archive,
  CalendarDays,
  CheckCircle2,
  Edit3,
  FileText,
  Filter,
  Loader2,
  Newspaper,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type BlogStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "ARCHIVED";

type BlogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  active: boolean;
  _count?: {
    posts: number;
  };
};

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  authorName: string;
  status: BlogStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  category: BlogCategory | null;
  product: {
    id: string;
    name: string;
    slug: string;
    type: "IMPORT" | "EXPORT";
  } | null;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  posts?: BlogPost[];
  categories?: BlogCategory[];
  counts?: {
    total: number;
    draft: number;
    published: number;
    archived: number;
  };
};

const STATUS_OPTIONS: {
  value: "ALL" | BlogStatus;
  label: string;
}[] = [
  {
    value: "ALL",
    label: "All Articles",
  },
  {
    value: "PUBLISHED",
    label: "Published",
  },
  {
    value: "DRAFT",
    label: "Drafts",
  },
  {
    value: "ARCHIVED",
    label: "Archived",
  },
];

const STATUS_STYLES: Record<
  BlogStatus,
  string
> = {
  PUBLISHED:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",

  DRAFT:
    "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",

  ARCHIVED:
    "border-slate-500/20 bg-slate-500/10 text-slate-600 dark:text-slate-400",
};

function formatDate(
  value: string | null
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

function getStatusLabel(
  status: BlogStatus
) {
  switch (status) {
    case "PUBLISHED":
      return "Published";

    case "ARCHIVED":
      return "Archived";

    case "DRAFT":
    default:
      return "Draft";
  }
}

export default function AdminBlogPage() {
  const [posts, setPosts] =
    useState<BlogPost[]>([]);

  const [categories, setCategories] =
    useState<BlogCategory[]>([]);

  const [counts, setCounts] =
    useState({
      total: 0,
      draft: 0,
      published: 0,
      archived: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [changingId, setChangingId] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState<"ALL" | BlogStatus>(
      "ALL"
    );

  const [categoryId, setCategoryId] =
    useState("ALL");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const loadPosts =
    useCallback(
      async (
        showRefresh = false
      ) => {
        try {
          if (showRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");

          const params =
            new URLSearchParams();

          if (search.trim()) {
            params.set(
              "search",
              search.trim()
            );
          }

          if (status !== "ALL") {
            params.set(
              "status",
              status
            );
          }

          if (
            categoryId !== "ALL"
          ) {
            params.set(
              "categoryId",
              categoryId
            );
          }

          const response =
            await fetch(
              `/api/admin/blog?${params.toString()}`,
              {
                cache: "no-store",
              }
            );

          const result =
            (await response.json()) as ApiResponse;

          if (!response.ok) {
            throw new Error(
              result.message ||
                "Unable to load blog articles."
            );
          }

          setPosts(
            result.posts || []
          );

          setCategories(
            result.categories || []
          );

          setCounts(
            result.counts || {
              total: 0,
              draft: 0,
              published: 0,
              archived: 0,
            }
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load blog articles."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        search,
        status,
        categoryId,
      ]
    );

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        loadPosts();
      }, 300);

    return () =>
      window.clearTimeout(
        timer
      );
  }, [loadPosts]);

  async function deletePost(
    post: BlogPost
  ) {
    const confirmed =
      window.confirm(
        `Delete "${post.title}"?\n\nThis action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(post.id);
      setError("");
      setSuccess("");

      const response =
        await fetch(
          `/api/admin/blog/${post.id}`,
          {
            method: "DELETE",
          }
        );

      const result =
        (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to delete article."
        );
      }

      setPosts(
        (current) =>
          current.filter(
            (item) =>
              item.id !== post.id
          )
      );

      setCounts(
        (current) => ({
          ...current,
          total: Math.max(
            0,
            current.total - 1
          ),

          ...(post.status ===
          "PUBLISHED"
            ? {
                published:
                  Math.max(
                    0,
                    current.published -
                      1
                  ),
              }
            : {}),

          ...(post.status ===
          "DRAFT"
            ? {
                draft:
                  Math.max(
                    0,
                    current.draft -
                      1
                  ),
              }
            : {}),

          ...(post.status ===
          "ARCHIVED"
            ? {
                archived:
                  Math.max(
                    0,
                    current.archived -
                      1
                  ),
              }
            : {}),
        })
      );

      setSuccess(
        "Blog article deleted successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete article."
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function changeStatus(
    post: BlogPost,
    nextStatus: BlogStatus
  ) {
    if (
      post.status ===
      nextStatus
    ) {
      return;
    }

    try {
      setChangingId(post.id);
      setError("");
      setSuccess("");

      const response =
        await fetch(
          `/api/admin/blog/${post.id}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              status: nextStatus,
            }),
          }
        );

      const result =
        (await response.json()) as ApiResponse & {
          post?: BlogPost;
        };

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to update article status."
        );
      }

      if (result.post) {
        setPosts(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                post.id
                  ? result.post!
                  : item
            )
        );
      }

      setSuccess(
        nextStatus ===
          "PUBLISHED"
          ? "Article published successfully."
          : nextStatus ===
              "ARCHIVED"
            ? "Article archived successfully."
            : "Article moved to draft."
      );

      await loadPosts(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update article status."
      );
    } finally {
      setChangingId(null);
    }
  }

  const visiblePosts =
    useMemo(
      () => posts,
      [posts]
    );

  function clearFilters() {
    setSearch("");
    setStatus("ALL");
    setCategoryId("ALL");
  }

  const hasFilters =
    Boolean(search.trim()) ||
    status !== "ALL" ||
    categoryId !== "ALL";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] transition-colors duration-300 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)]/90 p-5 shadow-xl shadow-blue-950/5 backdrop-blur-xl sm:p-7 lg:p-8">

          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
                <Newspaper className="h-3.5 w-3.5" />
                Content Management
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Blog
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
                Manage trade insights, market updates,
                export guides and company articles.
              </p>
            </div>

            <Link
              href="/admin/blog/new"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create Article
            </Link>

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
            STAT CARDS
        ===================================================== */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            title="Total Articles"
            value={counts.total}
            description="All blog articles"
            icon={FileText}
          />

          <StatCard
            title="Published"
            value={counts.published}
            description="Visible to website visitors"
            icon={CheckCircle2}
          />

          <StatCard
            title="Drafts"
            value={counts.draft}
            description="Articles still being prepared"
            icon={Edit3}
          />

          <StatCard
            title="Archived"
            value={counts.archived}
            description="Older articles"
            icon={Archive}
          />

        </section>

        {/* =====================================================
            FILTERS
        ===================================================== */}

        <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-lg shadow-blue-950/5 sm:p-5">

          <div className="flex flex-col gap-4 xl:flex-row xl:items-center">

            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search articles, authors or slugs..."
                className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] pl-11 pr-4 text-sm outline-none transition focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="hidden h-4 w-4 text-[var(--muted)] sm:block" />

              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as
                      | "ALL"
                      | BlogStatus
                  )
                }
                className="h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold outline-none focus:border-blue-500"
              >
                {STATUS_OPTIONS.map(
                  (option) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {option.label}
                    </option>
                  )
                )}
              </select>

              <select
                value={categoryId}
                onChange={(event) =>
                  setCategoryId(
                    event.target.value
                  )
                }
                className="h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold outline-none focus:border-blue-500"
              >
                <option value="ALL">
                  All Categories
                </option>

                {categories.map(
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

              {hasFilters && (
                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-sm font-bold transition hover:bg-[var(--background)]"
                >
                  <XCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    Clear
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  loadPosts(true)
                }
                disabled={refreshing}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-[var(--border)] px-3 transition hover:bg-[var(--background)] disabled:opacity-50"
                title="Refresh"
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </button>
            </div>

          </div>
        </section>

        {/* =====================================================
            TABLE
        ===================================================== */}

        <section className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-xl shadow-blue-950/5">

          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4 sm:px-6">

            <div>
              <h2 className="text-lg font-black">
                Articles
              </h2>

              <p className="mt-1 text-xs text-[var(--muted)]">
                {visiblePosts.length} article
                {visiblePosts.length === 1
                  ? ""
                  : "s"} shown
              </p>
            </div>

            <Link
              href="/admin/blog/categories"
              className="text-xs font-black text-blue-600 transition hover:text-blue-700 dark:text-blue-400"
            >
              Manage Categories →
            </Link>

          </div>

          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm font-semibold text-[var(--muted)]">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading articles...
              </div>
            </div>
          ) : visiblePosts.length === 0 ? (
            <EmptyState
              hasFilters={hasFilters}
              onClear={clearFilters}
            />
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px] text-left">

                <thead>
                  <tr className="border-b border-[var(--border)] text-[10px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">
                    <th className="px-6 py-4">
                      Article
                    </th>

                    <th className="px-4 py-4">
                      Category
                    </th>

                    <th className="px-4 py-4">
                      Author
                    </th>

                    <th className="px-4 py-4">
                      Status
                    </th>

                    <th className="px-4 py-4">
                      Published
                    </th>

                    <th className="px-6 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {visiblePosts.map(
                    (post) => (
                      <tr
                        key={post.id}
                        className="border-b border-[var(--border)] last:border-b-0 transition hover:bg-blue-500/[0.03]"
                      >

                        {/* ARTICLE */}

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">

                            <div className="h-14 w-20 shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)]">

                              {post.featuredImage ? (
                                <img
                                  src={
                                    post.featuredImage
                                  }
                                  alt={
                                    post.title
                                  }
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Newspaper className="h-5 w-5 text-[var(--muted)]" />
                                </div>
                              )}

                            </div>

                            <div className="min-w-0">

                              <p className="line-clamp-2 max-w-[360px] text-sm font-black">
                                {post.title}
                              </p>

                              <p className="mt-1 max-w-[360px] truncate text-xs text-[var(--muted)]">
                                /blog/
                                {post.slug}
                              </p>

                            </div>

                          </div>
                        </td>

                        {/* CATEGORY */}

                        <td className="px-4 py-5">
                          {post.category ? (
                            <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-black text-blue-600 dark:text-blue-400">
                              {
                                post
                                  .category
                                  .name
                              }
                            </span>
                          ) : (
                            <span className="text-xs text-[var(--muted)]">
                              Uncategorized
                            </span>
                          )}
                        </td>

                        {/* AUTHOR */}

                        <td className="px-4 py-5">
                          <div className="flex items-center gap-2 text-sm font-semibold">
                            {post.authorName}
                          </div>
                        </td>

                        {/* STATUS */}

                        <td className="px-4 py-5">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black ${STATUS_STYLES[post.status]}`}
                          >
                            {
                              getStatusLabel(
                                post.status
                              )
                            }
                          </span>
                        </td>

                        {/* DATE */}

                        <td className="px-4 py-5">
                          <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                            <CalendarDays className="h-3.5 w-3.5" />

                            {formatDate(
                              post.publishedAt ||
                                post.createdAt
                            )}
                          </div>
                        </td>

                        {/* ACTIONS */}

                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-2">

                            {post.status !==
                              "PUBLISHED" && (
                              <button
                                type="button"
                                disabled={
                                  changingId ===
                                  post.id
                                }
                                onClick={() =>
                                  changeStatus(
                                    post,
                                    "PUBLISHED"
                                  )
                                }
                                className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-[11px] font-black text-emerald-600 transition hover:bg-emerald-500/15 disabled:opacity-50 dark:text-emerald-400"
                              >
                                {changingId ===
                                post.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  "Publish"
                                )}
                              </button>
                            )}

                            {post.status ===
                              "PUBLISHED" && (
                              <button
                                type="button"
                                disabled={
                                  changingId ===
                                  post.id
                                }
                                onClick={() =>
                                  changeStatus(
                                    post,
                                    "ARCHIVED"
                                  )
                                }
                                className="rounded-lg border border-slate-500/20 bg-slate-500/10 px-3 py-2 text-[11px] font-black text-slate-600 transition hover:bg-slate-500/15 disabled:opacity-50 dark:text-slate-400"
                              >
                                Archive
                              </button>
                            )}

                            {post.status ===
                              "ARCHIVED" && (
                              <button
                                type="button"
                                disabled={
                                  changingId ===
                                  post.id
                                }
                                onClick={() =>
                                  changeStatus(
                                    post,
                                    "DRAFT"
                                  )
                                }
                                className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[11px] font-black text-amber-600 transition hover:bg-amber-500/15 disabled:opacity-50 dark:text-amber-400"
                              >
                                Draft
                              </button>
                            )}

                            <Link
                              href={`/admin/blog/${post.id}/edit`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-[11px] font-black transition hover:bg-[var(--background)]"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              Edit
                            </Link>

                            <button
                              type="button"
                              disabled={
                                deletingId ===
                                post.id
                              }
                              onClick={() =>
                                deletePost(
                                  post
                                )
                              }
                              className="inline-flex items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-600 transition hover:bg-red-500/15 disabled:opacity-50 dark:text-red-400"
                              title="Delete article"
                            >
                              {deletingId ===
                              post.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </button>

                          </div>
                        </td>

                      </tr>
                    )
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

/**
 * =========================================================
 * STAT CARD
 * =========================================================
 */

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
}) {
  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-lg shadow-blue-950/5">

      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl" />

      <div className="relative flex items-start justify-between gap-4">

        <div>
          <p className="text-xs font-bold text-[var(--muted)]">
            {title}
          </p>

          <p className="mt-2 text-3xl font-black tracking-tight">
            {value}
          </p>

          <p className="mt-1 text-[11px] leading-5 text-[var(--muted)]">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Icon className="h-5 w-5" />
        </div>

      </div>
    </div>
  );
}

/**
 * =========================================================
 * EMPTY STATE
 * =========================================================
 */

function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
        <Newspaper className="h-7 w-7" />
      </div>

      <h3 className="mt-5 text-lg font-black">
        {hasFilters
          ? "No matching articles"
          : "No blog articles yet"}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
        {hasFilters
          ? "Try changing your search or filters."
          : "Create your first article to start building your trade insights library."}
      </p>

      {hasFilters ? (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-black transition hover:bg-[var(--background)]"
        >
          <XCircle className="h-4 w-4" />
          Clear Filters
        </button>
      ) : (
        <Link
          href="/admin/blog/new"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create Article
        </Link>
      )}

    </div>
  );
}