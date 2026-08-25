import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
] as const;

type BlogStatus =
  (typeof VALID_STATUSES)[number];

function cleanString(
  value: unknown
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function optionalString(
  value: unknown
): string | null {
  const cleaned =
    cleanString(value);

  return cleaned || null;
}

function slugify(
  value: string
): string {
  return value
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9\s-]/g,
      ""
    )
    .replace(
      /\s+/g,
      "-"
    )
    .replace(
      /-+/g,
      "-"
    )
    .replace(
      /^-|-$/g,
      ""
    );
}

/**
 * =========================================================
 * GET
 * List blog posts
 * =========================================================
 */

export async function GET(
  request: Request
) {
  try {
    const admin =
      await getAdminSession();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const { searchParams } =
      new URL(request.url);

    const search =
      cleanString(
        searchParams.get(
          "search"
        )
      );

    const statusParam =
      cleanString(
        searchParams.get(
          "status"
        )
      );

    const categoryId =
      cleanString(
        searchParams.get(
          "categoryId"
        )
      );

    const status =
      VALID_STATUSES.includes(
        statusParam as BlogStatus
      )
        ? (statusParam as BlogStatus)
        : undefined;

    const where = {
      ...(status
        ? { status }
        : {}),

      ...(categoryId
        ? { categoryId }
        : {}),

      ...(search
        ? {
            OR: [
              {
                title: {
                  contains:
                    search,
                  mode: "insensitive" as const,
                },
              },
              {
                slug: {
                  contains:
                    search,
                  mode: "insensitive" as const,
                },
              },
              {
                excerpt: {
                  contains:
                    search,
                  mode: "insensitive" as const,
                },
              },
              {
                authorName: {
                  contains:
                    search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    };

    const [
      posts,
      total,
      draft,
      published,
      archived,
      categories,
    ] = await Promise.all([
      prisma.blogPost.findMany({
        where,

        orderBy: [
          {
            publishedAt:
              "desc",
          },
          {
            createdAt:
              "desc",
          },
        ],

        include: {
          category: true,

          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
            },
          },
        },
      }),

      prisma.blogPost.count(),

      prisma.blogPost.count({
        where: {
          status: "DRAFT",
        },
      }),

      prisma.blogPost.count({
        where: {
          status: "PUBLISHED",
        },
      }),

      prisma.blogPost.count({
        where: {
          status: "ARCHIVED",
        },
      }),

      prisma.blogCategory.findMany({
        where: {
          active: true,
        },
        orderBy: {
          name: "asc",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,

      posts,

      counts: {
        total,
        draft,
        published,
        archived,
      },

      categories,
    });
  } catch (error) {
    console.error(
      "ADMIN_BLOG_LIST_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load blog posts.",
      },
      { status: 500 }
    );
  }
}

/**
 * =========================================================
 * POST
 * Create blog post
 * =========================================================
 */

export async function POST(
  request: Request
) {
  try {
    const admin =
      await getAdminSession();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    let body: Record<
      string,
      unknown
    >;

    try {
      body =
        await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid JSON request body.",
        },
        { status: 400 }
      );
    }

    const title =
      cleanString(
        body.title
      );

    const content =
      cleanString(
        body.content
      );

    const authorName =
      cleanString(
        body.authorName
      );

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Article title is required.",
        },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Article content is required.",
        },
        { status: 400 }
      );
    }

    if (!authorName) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Author name is required.",
        },
        { status: 400 }
      );
    }

    let slug =
      cleanString(
        body.slug
      );

    slug =
      slugify(
        slug || title
      );

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A valid article slug could not be generated.",
        },
        { status: 400 }
      );
    }

    const existingSlug =
      await prisma.blogPost.findUnique(
        {
          where: {
            slug,
          },
          select: {
            id: true,
          },
        }
      );

    if (existingSlug) {
      return NextResponse.json(
        {
          success: false,
          message:
            "An article with this slug already exists.",
        },
        { status: 409 }
      );
    }

    const categoryId =
      optionalString(
        body.categoryId
      );

    if (categoryId) {
      const category =
        await prisma.blogCategory.findUnique(
          {
            where: {
              id: categoryId,
            },
          }
        );

      if (!category) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Selected blog category was not found.",
          },
          { status: 400 }
        );
      }
    }

    const productId =
      optionalString(
        body.productId
      );

    if (productId) {
      const product =
        await prisma.product.findUnique(
          {
            where: {
              id: productId,
            },
            select: {
              id: true,
            },
          }
        );

      if (!product) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Selected product was not found.",
          },
          { status: 400 }
        );
      }
    }

    const statusValue =
      cleanString(
        body.status
      );

    const status =
      VALID_STATUSES.includes(
        statusValue as BlogStatus
      )
        ? (statusValue as BlogStatus)
        : "DRAFT";

    let publishedAt:
      | Date
      | null = null;

    if (status === "PUBLISHED") {
      publishedAt =
        body.publishedAt
          ? new Date(
              String(
                body.publishedAt
              )
            )
          : new Date();

      if (
        Number.isNaN(
          publishedAt.getTime()
        )
      ) {
        publishedAt =
          new Date();
      }
    }

    let readingTime:
      | number
      | null = null;

    if (
      body.readingTime !==
      undefined &&
      body.readingTime !==
        null &&
      body.readingTime !== ""
    ) {
      const parsed =
        Number(
          body.readingTime
        );

      if (
        Number.isInteger(
          parsed
        ) &&
        parsed >= 0
      ) {
        readingTime =
          parsed;
      }
    }

    const post =
      await prisma.blogPost.create(
        {
          data: {
            title,
            slug,
            excerpt:
              optionalString(
                body.excerpt
              ),

            content,

            featuredImage:
              optionalString(
                body.featuredImage
              ),

            imageAlt:
              optionalString(
                body.imageAlt
              ),

            authorName,

            status,

            publishedAt,

            categoryId,

            productId,

            tags:
              optionalString(
                body.tags
              ),

            readingTime,

            seoTitle:
              optionalString(
                body.seoTitle
              ),

            seoDescription:
              optionalString(
                body.seoDescription
              ),
          },

          include: {
            category: true,

            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                type: true,
              },
            },
          },
        }
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Blog article created successfully.",
        post,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "ADMIN_BLOG_CREATE_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to create blog article.",
      },
      { status: 500 }
    );
  }
}