import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  FileText,
  Tag,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

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

/*
 * Basic content rendering.
 *
 * Blog content is stored as text in the database.
 * This keeps the output safe while preserving
 * paragraphs and line breaks.
 */
function BlogContent({
  content,
}: {
  content: string;
}) {
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((paragraph) =>
      paragraph.trim()
    )
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {paragraphs.map(
        (paragraph, index) => (
          <p
            key={index}
            className="whitespace-pre-line text-base leading-8 text-[var(--foreground)]/75 sm:text-lg"
          >
            {paragraph}
          </p>
        )
      )}
    </div>
  );
}

export async function generateMetadata({
  params,
}: PageProps) {
  const { slug } = await params;

  const post =
    await prisma.blogPost.findFirst({
      where: {
        slug,
        status: "PUBLISHED",
      },
      select: {
        title: true,
        excerpt: true,
        featuredImage: true,
        imageAlt: true,
        seoTitle: true,
        seoDescription: true,
      },
    });

  if (!post) {
    return {
      title: "Article Not Found | Krupali Traders",
    };
  }

  return {
    title:
      post.seoTitle ||
      `${post.title} | Krupali Traders`,
    description:
      post.seoDescription ||
      post.excerpt ||
      `Read ${post.title} on the Krupali Traders Blog.`,
    openGraph: {
      title:
        post.seoTitle ||
        post.title,
      description:
        post.seoDescription ||
        post.excerpt ||
        "",
      images: post.featuredImage
        ? [
            {
              url: post.featuredImage,
              alt:
                post.imageAlt ||
                post.title,
            },
          ]
        : undefined,
    },
  };
}

export default async function BlogArticlePage({
  params,
}: PageProps) {
  const { slug } = await params;

  /*
   * Only published articles are
   * publicly accessible.
   */
  const post =
    await prisma.blogPost.findFirst({
      where: {
        slug,
        status: "PUBLISHED",
      },
      include: {
        category: true,
        product: {
          include: {
            category: true,
          },
        },
      },
    });

  if (!post) {
    notFound();
  }

  /*
   * Related articles:
   *
   * Prefer the same blog category.
   */
  const relatedPosts =
    await prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        id: {
          not: post.id,
        },

        ...(post.categoryId
          ? {
              categoryId:
                post.categoryId,
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
      take: 3,
      include: {
        category: true,
      },
    });

  /*
   * If there are fewer than 3 articles
   * in the same category, fill remaining
   * slots with recent published articles.
   */
  let finalRelatedPosts =
    relatedPosts;

  if (
    finalRelatedPosts.length < 3
  ) {
    const existingIds =
      new Set([
        post.id,
        ...finalRelatedPosts.map(
          (item) => item.id
        ),
      ]);

    const additionalPosts =
      await prisma.blogPost.findMany({
        where: {
          status: "PUBLISHED",
          id: {
            notIn:
              Array.from(existingIds),
          },
        },
        orderBy: [
          {
            publishedAt: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
        take:
          3 -
          finalRelatedPosts.length,
        include: {
          category: true,
        },
      });

    finalRelatedPosts = [
      ...finalRelatedPosts,
      ...additionalPosts,
    ];
  }

  const articleDate =
    post.publishedAt ||
    post.createdAt;

  const readingTime =
    getReadingTime(
      post.content,
      post.readingTime
    );

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* =====================================================
          HERO / ARTICLE HEADER
      ===================================================== */}

      <section className="relative overflow-hidden px-4 pb-12 pt-32 sm:px-6 sm:pb-16 sm:pt-36 lg:px-8">
        <div className="pointer-events-none absolute -right-32 top-20 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl">
          {/* Back */}

          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-2 text-sm font-black text-[#1455a0] transition hover:gap-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          {/* Category */}

          {post.category && (
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#1455a0]">
              <Tag className="h-4 w-4" />

              {post.category.name}
            </div>
          )}

          {/* Title */}

          <h1 className="max-w-5xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {post.title}
          </h1>

          {/* Excerpt */}

          {post.excerpt && (
            <p className="mt-6 max-w-4xl text-lg leading-8 text-[var(--foreground)]/65 sm:text-xl">
              {post.excerpt}
            </p>
          )}

          {/* Meta */}

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[var(--muted)]">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />

              {formatDate(
                articleDate
              )}
            </span>

            <span className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4" />

              {readingTime} min read
            </span>

            {post.authorName && (
              <span>
                By{" "}
                <span className="font-bold text-[var(--foreground)]">
                  {post.authorName}
                </span>
              </span>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURED IMAGE
      ===================================================== */}

      {post.featuredImage && (
        <section className="px-4 pb-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-2xl shadow-blue-950/10">
            <div className="relative aspect-[16/8] min-h-[280px] bg-gradient-to-br from-blue-950 to-[#1455a0]">
              <img
                src={post.featuredImage}
                alt={
                  post.imageAlt ||
                  post.title
                }
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          ARTICLE CONTENT
      ===================================================== */}

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Main article */}

          <article className="min-w-0 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl shadow-blue-950/5 sm:p-9 lg:p-12">
            <BlogContent
              content={post.content}
            />

            {/* Tags */}

            {post.tags && (
              <div className="mt-10 border-t border-[var(--border)] pt-7">
                <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#1455a0]">
                  <Tag className="h-4 w-4" />
                  Tags
                </div>

                <div className="flex flex-wrap gap-2">
                  {post.tags
                    .split(",")
                    .map((tag) =>
                      tag.trim()
                    )
                    .filter(Boolean)
                    .map(
                      (
                        tag,
                        index
                      ) => (
                        <span
                          key={`${tag}-${index}`}
                          className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-bold text-[var(--muted)]"
                        >
                          #{tag}
                        </span>
                      )
                    )}
                </div>
              </div>
            )}

            {/* Related Product */}

            {post.product && (
              <div className="mt-10 rounded-2xl border border-blue-500/15 bg-blue-500/5 p-5">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1455a0]">
                  Related Product
                </p>

                <h3 className="mt-2 text-xl font-black">
                  {post.product.name}
                </h3>

                {post.product.category && (
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {post.product.category.name}
                  </p>
                )}

                <Link
                  href={`/products/${post.product.type.toLowerCase()}/${post.product.slug}`}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1455a0] px-5 py-3 text-sm font-black text-white transition hover:bg-[#104782]"
                >
                  View Product
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </article>

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="space-y-5">
            {/* About */}

            <div className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-lg shadow-blue-950/5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-[#1455a0]">
                <FileText className="h-5 w-5" />
              </div>

              <h2 className="text-lg font-black">
                Krupali Traders Blog
              </h2>

              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Practical insights about
                international trade,
                sourcing, import and
                export, logistics,
                packaging and global
                markets.
              </p>

              <Link
                href="/blog"
                className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#1455a0]"
              >
                Explore All Articles
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Product CTA */}

            <div className="rounded-[1.75rem] bg-gradient-to-br from-blue-950 to-[#1455a0] p-6 text-white shadow-xl">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-white/60">
                Krupali Traders
              </p>

              <h2 className="mt-2 text-xl font-black">
                Explore Our Products
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/70">
                Discover our import and
                export products and
                explore category-wise
                offerings.
              </p>

              <Link
                href="/products"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-[#1455a0] transition hover:bg-white/90"
              >
                View Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* =====================================================
          RELATED ARTICLES
      ===================================================== */}

      {finalRelatedPosts.length >
        0 && (
        <section className="px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-7">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1455a0]">
                Continue Reading
              </p>

              <h2 className="mt-1 text-3xl font-black">
                Related Articles
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {finalRelatedPosts.map(
                (related) => (
                  <Link
                    key={related.id}
                    href={`/blog/${related.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] shadow-lg shadow-blue-950/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-blue-950 to-[#1455a0]">
                      {related.featuredImage ? (
                        <img
                          src={
                            related.featuredImage
                          }
                          alt={
                            related.imageAlt ||
                            related.title
                          }
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-white/50">
                          <FileText className="h-14 w-14" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

                      {related.category && (
                        <div className="absolute bottom-4 left-4">
                          <span className="rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-[#1455a0] shadow-lg">
                            {
                              related
                                .category
                                .name
                            }
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="line-clamp-3 text-lg font-black leading-tight transition group-hover:text-[#1455a0]">
                        {related.title}
                      </h3>

                      <div className="mt-auto pt-5">
                        <span className="inline-flex items-center gap-2 text-sm font-black text-[#1455a0]">
                          Read Article
                          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}