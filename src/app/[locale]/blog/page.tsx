import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  FileText,
  Search,
  Tag,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const POSTS_PER_PAGE = 7;

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getReadingTime(content: string, readingTime: number | null) {
  if (typeof readingTime === "number" && readingTime > 0) {
    return readingTime;
  }
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const categorySlug = typeof params.category === "string" ? params.category.trim() : "";
  const pageParam = typeof params.page === "string" ? parseInt(params.page, 10) : 1;
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  let categories: any[] = [];
  let posts: any[] = [];
  let totalPostsCount = 0;

  try {
    categories = await prisma.blogCategory.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            posts: {
              where: { status: "PUBLISHED" },
            },
          },
        },
      },
    });

    const selectedCategory = categorySlug
      ? categories.find((cat) => cat.slug === categorySlug)
      : null;

    const whereClause = {
      status: "PUBLISHED" as const,
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" as const } },
              { excerpt: { contains: query, mode: "insensitive" as const } },
              { content: { contains: query, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(selectedCategory ? { categoryId: selectedCategory.id } : {}),
    };

    totalPostsCount = await prisma.blogPost.count({
      where: whereClause,
    });

    const skip = (currentPage - 1) * POSTS_PER_PAGE;

    posts = await prisma.blogPost.findMany({
      where: whereClause,
      orderBy: [
        { publishedAt: "desc" },
        { createdAt: "desc" },
      ],
      skip,
      take: POSTS_PER_PAGE,
      include: {
        category: true,
        product: true,
      },
    });
  } catch (dbError) {
    console.error("BLOG_DATABASE_FETCH_ERROR:", dbError);
  }

  const selectedCategory = categorySlug
    ? categories.find((cat) => cat.slug === categorySlug)
    : null;

  const showFeatured = currentPage === 1 && !query && !categorySlug;
  const featuredPost = showFeatured ? posts[0] || null : null;
  const remainingPosts = featuredPost ? posts.slice(1) : posts;
  const totalPages = Math.ceil(totalPostsCount / POSTS_PER_PAGE);

  const createPaginationUrl = (targetPage: number) => {
    const searchParamsObj = new URLSearchParams();
    if (query) searchParamsObj.set("q", query);
    if (categorySlug) searchParamsObj.set("category", categorySlug);
    if (targetPage > 1) searchParamsObj.set("page", targetPage.toString());
    const queryString = searchParamsObj.toString();
    return `/blog${queryString ? `?${queryString}` : ""}`;
  };

  return (
    <main className="relative min-h-screen bg-transparent text-white overflow-hidden flex flex-col">
      {/* FULL-SCREEN BACKGROUND VIDEO (Fully Fixed Layer) */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-100"
        >
          <source src="/videos/blog-bg.mp4" type="video/mp4" />
        </video>
        {/* Soft subtle tint so text stays crisp */}
        <div className="absolute inset-0" />
      </div>

      {/* This wrapper uses `min-h-[calc(100vh-80px)]` and `justify-end` to completely 
        push the entire blog banner/hero block to the bottom of the first full screen viewport, 
        creating a full-page video gap beneath the navbar.
      */}
      <div className="flex-1 flex flex-col justify-end min-h-[calc(100vh-80px)]">
        
        {/* HERO */}
        <section className="relative z-10 overflow-hidden px-4 pb-12 pt-20 sm:px-6 lg:px-8">
          <div className="relative mx-auto max-w-7xl">
            <div className="mx-auto max-w-4xl text-center">
              {/* Golden color badge styling applied matching your About Us page design */}
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-black/40 px-7 py-2 text-xs font-black uppercase tracking-[0.16em] text-amber-400 shadow-xl backdrop-blur-md">
                <FileText className="h-4 w-4 text-amber-400" />
                Krupali Traders Blog
              </div>

              <p className="mx-auto mt-3 max-w-3xl text-base leading-7 text-white/85 sm:text-lg">
                Explore practical insights about international trade, import and export, products, sourcing, packaging, logistics and global markets.
              </p>
            </div>

            {/* SEARCH */}
            <form action="/blog" className="mx-auto mt-8 max-w-2xl">
              {categorySlug && (
                <input type="hidden" name="category" value={categorySlug} />
              )}

              <div className="flex items-center gap-3 rounded-2xl border border-white/25 bg-transparent p-2 shadow-2xl backdrop-blur-xl">
                <Search className="ml-3 h-5 w-5 shrink-0 text-white/60" />
                <input
                  name="q"
                  defaultValue={query}
                  placeholder="Search trade insights..."
                  className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm text-white outline-none placeholder:text-white/50"
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

        {/* CATEGORIES */}
        <section className="relative z-10 px-4 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/blog"
                className={`rounded-full border px-4 py-2 text-xs font-black transition backdrop-blur-xl ${
                  !categorySlug
                    ? "border-[#1455a0] bg-[#1455a0] text-white shadow-lg"
                    : "border-white/20 bg-transparent text-white/80 hover:border-white/40 hover:text-white"
                }`}
              >
                All Articles
              </Link>

              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/blog?category=${encodeURIComponent(category.slug)}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black transition backdrop-blur-xl ${
                    categorySlug === category.slug
                      ? "border-[#1455a0] bg-[#1455a0] text-white shadow-lg"
                      : "border-white/20 bg-transparent text-white/80 hover:border-white/40 hover:text-white"
                  }`}
                >
                  {category.name}
                  <span className="opacity-60">{category._count?.posts || 0}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* CONTENT SECTION (FLOWS NATURALLY DOWNWARD BEYOND THE FIRST VIEWPORT PAGE) */}
      <section className="relative z-10 px-4 pb-20 pt-12 sm:px-6 lg:px-8 bg-transparent">
        <div className="mx-auto max-w-7xl">
          {(query || categorySlug) && (
            <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-400">
                  {categorySlug ? selectedCategory?.name || "Category" : "Search Results"}
                </p>
                <h2 className="mt-1 text-2xl font-black text-white">
                  {query ? `Results for "${query}"` : "Articles"}
                </h2>
              </div>
              <p className="text-sm text-white/70">
                {totalPostsCount} {totalPostsCount === 1 ? "article" : "articles"}
              </p>
            </div>
          )}

          {/* FEATURED ARTICLE */}
          {featuredPost && (
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="group mb-10 block overflow-hidden rounded-[2rem] border border-white/20 bg-transparent shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/40"
            >
              <div className="grid lg:grid-cols-2">
                <div className="relative min-h-[300px] overflow-hidden bg-gradient-to-br from-blue-950 to-[#1455a0] sm:min-h-[400px] lg:min-h-[480px]">
                  {featuredPost.featuredImage ? (
                    <img
                      src={featuredPost.featuredImage}
                      alt={featuredPost.imageAlt || featuredPost.title}
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

                <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-12 text-white">
                  {featuredPost.category && (
                    <div className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-amber-400">
                      <Tag className="h-4 w-4" />
                      {featuredPost.category.name}
                    </div>
                  )}
                  <h2 className="text-2xl font-black leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                    {featuredPost.title}
                  </h2>
                  {featuredPost.excerpt && (
                    <p className="mt-5 line-clamp-4 text-sm leading-7 text-white/80 sm:text-base">
                      {featuredPost.excerpt}
                    </p>
                  )}
                  <ArticleMeta
                    date={featuredPost.publishedAt || featuredPost.createdAt}
                    content={featuredPost.content}
                    readingTime={featuredPost.readingTime}
                  />
                  <div className="mt-7 inline-flex items-center gap-2 text-sm font-black text-amber-400">
                    Read Article
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* ARTICLES GRID */}
          {posts.length > 0 ? (
            <div>
              {!featuredPost && !query && !categorySlug && (
                <div className="mb-7 flex items-end justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-400">
                      Krupali Traders
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-white">
                      Latest Articles
                    </h2>
                  </div>
                  <p className="text-sm text-white/70">
                    {totalPostsCount} {totalPostsCount === 1 ? "article" : "articles"}
                  </p>
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {remainingPosts.map((post) => (
                  <ArticleCard key={post.id} post={post} />
                ))}
              </div>

              {/* PAGINATION CONTROLS */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-3">
                  {currentPage > 1 ? (
                    <Link
                      href={createPaginationUrl(currentPage - 1)}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-xs font-black text-white backdrop-blur-xl transition hover:border-white/40 hover:text-amber-400"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Previous
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-transparent px-4 py-2.5 text-xs font-black text-white/30 cursor-not-allowed backdrop-blur-xl">
                      <ArrowLeft className="h-4 w-4" />
                      Previous
                    </span>
                  )}

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => {
                      const isCurrent = pageNumber === currentPage;
                      return (
                        <Link
                          key={pageNumber}
                          href={createPaginationUrl(pageNumber)}
                          className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-black backdrop-blur-xl transition ${
                            isCurrent
                              ? "bg-amber-500 text-black shadow-lg shadow-amber-950/40"
                              : "border border-white/20 bg-transparent text-white hover:border-white/40 hover:text-amber-400"
                          }`}
                        >
                          {pageNumber}
                        </Link>
                      );
                    })}
                  </div>

                  {currentPage < totalPages ? (
                    <Link
                      href={createPaginationUrl(currentPage + 1)}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-xs font-black text-white backdrop-blur-xl transition hover:border-white/40 hover:text-amber-400"
                    >
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-transparent px-4 py-2.5 text-xs font-black text-white/30 cursor-not-allowed backdrop-blur-xl">
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <EmptyState query={query} category={selectedCategory?.name} />
          )}
        </div>
      </section>
    </main>
  );
}

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
    category: { name: string } | null;
    product: { name: string } | null;
  };
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/20 bg-transparent shadow-xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/40 hover:shadow-2xl"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-blue-950 to-[#1455a0]">
        {post.featuredImage ? (
          <img
            src={post.featuredImage}
            alt={post.imageAlt || post.title}
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

      <div className="flex flex-1 flex-col p-5 justify-between">
        <div>
          <h3 className="line-clamp-2 text-lg font-black leading-tight text-white transition group-hover:text-amber-400">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/75">
              {post.excerpt}
            </p>
          )}
        </div>

        <div className="mt-auto pt-5">
          <ArticleMeta
            date={post.publishedAt || post.createdAt}
            content={post.content}
            readingTime={post.readingTime}
          />
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-xs font-black text-amber-400">Read More</span>
            <ArrowRight className="h-4 w-4 text-amber-400 transition group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}

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
    <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/60">
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className="h-3.5 w-3.5" />
        {formatDate(new Date(date))}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Clock3 className="h-3.5 w-3.5" />
        {getReadingTime(content, readingTime)} min read
      </span>
    </div>
  );
}

function EmptyState({
  query,
  category,
}: {
  query: string;
  category?: string;
}) {
  return (
    <div className="rounded-[2rem] border border-white/20 bg-transparent px-6 py-16 text-center shadow-xl backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
        <Search className="h-8 w-8" />
      </div>
      <h2 className="mt-5 text-2xl font-black text-white">No Articles Found</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/70">
        {query
          ? `We couldn't find any published articles matching "${query}".`
          : category
            ? `There are currently no published articles in ${category}.`
            : "There are currently no published articles available."}
      </p>
      <Link
        href="/blog"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-sm font-black text-black transition hover:bg-amber-400"
      >
        View All Articles
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}