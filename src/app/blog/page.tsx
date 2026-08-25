import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  FileText,
  Search,
  Tag,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

type SearchParams = Promise<{
  q?: string;
  category?: string;
}>;

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getReadingTime(
  content: string,
  readingTime: number | null
) {
  if (
    typeof readingTime === "number" &&
    readingTime > 0
  ) {
    return readingTime;
  }

  const words = content
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(
    1,
    Math.ceil(words / 200)
  );
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const query =
    typeof params.q === "string"
      ? params.q.trim()
      : "";

  const categorySlug =
    typeof params.category === "string"
      ? params.category.trim()
      : "";

  const categories =
    await prisma.blogCategory.findMany({
      where: {
        active: true,
      },
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            posts: {
              where: {
                status: "PUBLISHED",
              },
            },
          },
        },
      },
    });

  const selectedCategory =
    categorySlug
      ? categories.find(
          (category) =>
            category.slug ===
            categorySlug
        )
      : null;

  const posts =
    await prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",

        ...(query
          ? {
              OR: [
                {
                  title: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
                {
                  excerpt: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
                {
                  content: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),

        ...(selectedCategory
          ? {
              categoryId:
                selectedCategory.id,
            }
          : {}),
      },

      orderBy: [
        {
          publishedAt: "desc",
        },
        {
          createdAt: "desc",
        },
      ],

      include: {
        category: true,
        product: true,
      },
    });

  const featuredPost =
    !query && !selectedCategory
      ? posts[0] || null
      : null;

  const remainingPosts =
    featuredPost
      ? posts.slice(1)
      : posts;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden px-4 pb-12 pt-32 sm:px-6 sm:pb-16 sm:pt-36 lg:px-8">

        <div className="pointer-events-none absolute -right-32 top-20 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">

         <div className="mx-auto max-w-4xl text-center">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
              <FileText className="h-4 w-4" />
              Krupali Traders Blog
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Trade Insights,
              <span className="block text-[#1455a0]">
                Market Knowledge & Updates
              </span>
            </h1>

           <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-[var(--foreground)]/65 sm:text-lg">
              Explore practical insights about international
              trade, import and export, products, sourcing,
              packaging, logistics and global markets.
            </p>

          </div>

          {/* =================================================
              SEARCH
          ================================================= */}

         <form
  action="/blog"
  className="mx-auto mt-8 max-w-2xl"
>
            {categorySlug && (
              <input
                type="hidden"
                name="category"
                value={categorySlug}
              />
            )}

            <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-lg shadow-blue-950/5">

              <Search className="ml-3 h-5 w-5 shrink-0 text-[var(--muted)]" />

              <input
                name="q"
                defaultValue={query}
                placeholder="Search trade insights..."
                className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm outline-none placeholder:text-[var(--muted)]"
              />

              <button
                type="submit"
                className="rounded-xl bg-[#1455a0] px-5 py-3 text-sm font-black text-white transition hover:bg-[#104782]"
              >
                Search
              </button>

            </div>
          </form>

        </div>
      </section>

      {/* =====================================================
          CATEGORIES
      ===================================================== */}

      <section className="px-4 pb-8 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="flex flex-wrap items-center gap-2">

            <Link
              href="/blog"
              className={`rounded-full border px-4 py-2 text-xs font-black transition ${
                !categorySlug
                  ? "border-[#1455a0] bg-[#1455a0] text-white"
                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[#1455a0]/40 hover:text-[#1455a0]"
              }`}
            >
              All Articles
            </Link>

            {categories.map(
              (category) => (
                <Link
                  key={category.id}
                  href={`/blog?category=${encodeURIComponent(
                    category.slug
                  )}${
                    query
                      ? `&q=${encodeURIComponent(
                          query
                        )}`
                      : ""
                  }`}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black transition ${
                    categorySlug ===
                    category.slug
                      ? "border-[#1455a0] bg-[#1455a0] text-white"
                      : "border-[var(--border)] bg-[var(--surface)] hover:border-[#1455a0]/40 hover:text-[#1455a0]"
                  }`}
                >
                  {category.name}

                  <span className="opacity-60">
                    {category._count.posts}
                  </span>
                </Link>
              )
            )}

          </div>

        </div>
      </section>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="px-4 pb-20 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-7xl">

          {/* Search/category heading */}

          {(query ||
            categorySlug) && (
            <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1455a0]">
                  {categorySlug
                    ? selectedCategory?.name ||
                      "Category"
                    : "Search Results"}
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  {query
                    ? `Results for "${query}"`
                    : "Articles"}
                </h2>

              </div>

              <p className="text-sm text-[var(--muted)]">
                {posts.length}{" "}
                {posts.length === 1
                  ? "article"
                  : "articles"}
              </p>

            </div>
          )}

          {/* =================================================
              FEATURED ARTICLE
          ================================================= */}

          {featuredPost && (
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="group mb-10 block overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-xl shadow-blue-950/5 transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >

              <div className="grid lg:grid-cols-2">

                {/* Image */}

                <div className="relative min-h-[300px] overflow-hidden bg-gradient-to-br from-blue-950 to-[#1455a0] sm:min-h-[400px] lg:min-h-[480px]">

                  {featuredPost.featuredImage ? (
                    <img
                      src={
                        featuredPost.featuredImage
                      }
                      alt={
                        featuredPost.imageAlt ||
                        featuredPost.title
                      }
                      className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full min-h-[300px] items-center justify-center text-white/50">
                      <FileText className="h-20 w-20" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

                  <div className="absolute left-5 top-5">

                    <span className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-black text-[#1455a0] shadow-lg">
                      Featured Article
                    </span>

                  </div>

                </div>

                {/* Content */}

                <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-12">

                  {featuredPost.category && (
                    <div className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#1455a0]">
                      <Tag className="h-4 w-4" />
                      {featuredPost.category.name}
                    </div>
                  )}

                  <h2 className="text-2xl font-black leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                    {featuredPost.title}
                  </h2>

                  {featuredPost.excerpt && (
                    <p className="mt-5 line-clamp-4 text-sm leading-7 text-[var(--foreground)]/65 sm:text-base">
                      {
                        featuredPost.excerpt
                      }
                    </p>
                  )}

                  <ArticleMeta
                    date={
                      featuredPost.publishedAt ||
                      featuredPost.createdAt
                    }
                    content={
                      featuredPost.content
                    }
                    readingTime={
                      featuredPost.readingTime
                    }
                  />

                  <div className="mt-7 inline-flex items-center gap-2 text-sm font-black text-[#1455a0]">
                    Read Article
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </div>

                </div>

              </div>

            </Link>
          )}

          {/* =================================================
              ARTICLES GRID
          ================================================= */}

          {remainingPosts.length > 0 ? (
            <div>

              {!featuredPost && (
                <div className="mb-7 flex items-end justify-between">

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1455a0]">
                      Krupali Traders
                    </p>

                    <h2 className="mt-1 text-2xl font-black">
                      Latest Articles
                    </h2>
                  </div>

                  <p className="text-sm text-[var(--muted)]">
                    {remainingPosts.length}{" "}
                    {remainingPosts.length ===
                    1
                      ? "article"
                      : "articles"}
                  </p>

                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

                {remainingPosts.map(
                  (post) => (
                    <ArticleCard
                      key={post.id}
                      post={post}
                    />
                  )
                )}

              </div>

            </div>
          ) : (
            <EmptyState
              query={query}
              category={
                selectedCategory?.name
              }
            />
          )}

        </div>

      </section>

    </main>
  );
}

/* ============================================================
   ARTICLE CARD
============================================================ */

function ArticleCard({
  post,
}: {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    featuredImage: string | null;
    imageAlt: string | null;
    readingTime: number | null;
    publishedAt: Date | null;
    createdAt: Date;
    category: {
      name: string;
    } | null;
    product: {
      name: string;
    } | null;
  };
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] shadow-lg shadow-blue-950/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >

      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-blue-950 to-[#1455a0]">

        {post.featuredImage ? (
          <img
            src={post.featuredImage}
            alt={
              post.imageAlt ||
              post.title
            }
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-white/50">
            <FileText className="h-14 w-14" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

        {post.category && (
          <div className="absolute bottom-4 left-4">

            <span className="rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-[#1455a0] shadow-lg">
              {post.category.name}
            </span>

          </div>
        )}

      </div>

      <div className="flex flex-1 flex-col p-5">

        <h3 className="line-clamp-2 text-lg font-black leading-tight transition group-hover:text-[#1455a0]">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--foreground)]/60">
            {post.excerpt}
          </p>
        )}

        <div className="mt-auto pt-5">

          <ArticleMeta
            date={
              post.publishedAt ||
              post.createdAt
            }
            content={post.content}
            readingTime={
              post.readingTime
            }
          />

          <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4">

            <span className="text-xs font-black text-[#1455a0]">
              Read More
            </span>

            <ArrowRight className="h-4 w-4 text-[#1455a0] transition group-hover:translate-x-1" />

          </div>

        </div>

      </div>

    </Link>
  );
}

/* ============================================================
   ARTICLE META
============================================================ */

function ArticleMeta({
  date,
  content,
  readingTime,
}: {
  date: Date | string;
  content: string;
  readingTime: number | null;
}) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--muted)]">

      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className="h-3.5 w-3.5" />
        {formatDate(
          new Date(date)
        )}
      </span>

      <span className="inline-flex items-center gap-1.5">
        <Clock3 className="h-3.5 w-3.5" />
        {getReadingTime(
          content,
          readingTime
        )}{" "}
        min read
      </span>

    </div>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState({
  query,
  category,
}: {
  query: string;
  category?: string;
}) {
  return (
    <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center shadow-lg shadow-blue-950/5">

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
        <Search className="h-8 w-8" />
      </div>

      <h2 className="mt-5 text-2xl font-black">
        No Articles Found
      </h2>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[var(--muted)]">
        {query
          ? `We couldn't find any published articles matching "${query}".`
          : category
            ? `There are currently no published articles in ${category}.`
            : "There are currently no published articles available."}
      </p>

      <Link
        href="/blog"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1455a0] px-5 py-3 text-sm font-black text-white transition hover:bg-[#104782]"
      >
        View All Articles
        <ArrowRight className="h-4 w-4" />
      </Link>

    </div>
  );
}