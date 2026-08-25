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

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function cleanString(
  value: unknown
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function optionalString(
  value: unknown
): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const cleaned = value.trim();

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
 * Get one blog article
 * =========================================================
 */

export async function GET(
  _request: Request,
  { params }: RouteContext
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

    const { id } =
      await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Blog article ID is required.",
        },
        { status: 400 }
      );
    }

    const post =
      await prisma.blogPost.findUnique(
        {
          where: {
            id,
          },

          include: {
            category: true,

            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                type: true,
                status: true,
              },
            },
          },
        }
      );

    if (!post) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Blog article not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error) {
    console.error(
      "ADMIN_BLOG_GET_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load blog article.",
      },
      { status: 500 }
    );
  }
}

/**
 * =========================================================
 * PATCH
 * Update blog article
 * =========================================================
 */

export async function PATCH(
  request: Request,
  { params }: RouteContext
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

    const { id } =
      await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Blog article ID is required.",
        },
        { status: 400 }
      );
    }

    const existing =
      await prisma.blogPost.findUnique(
        {
          where: {
            id,
          },
        }
      );

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Blog article not found.",
        },
        { status: 404 }
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

    const data: {
      title?: string;
      slug?: string;
      excerpt?: string | null;
      content?: string;
      featuredImage?: string | null;
      imageAlt?: string | null;
      authorName?: string;
      status?: BlogStatus;
      publishedAt?: Date | null;
      categoryId?: string | null;
      productId?: string | null;
      tags?: string | null;
      readingTime?: number | null;
      seoTitle?: string | null;
      seoDescription?: string | null;
    } = {};

    /**
     * -------------------------------------------------------
     * TITLE
     * -------------------------------------------------------
     */

    if (
      body.title !== undefined
    ) {
      const title =
        cleanString(
          body.title
        );

      if (!title) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Article title cannot be empty.",
          },
          { status: 400 }
        );
      }

      data.title = title;
    }

    /**
     * -------------------------------------------------------
     * SLUG
     * -------------------------------------------------------
     */

    if (
      body.slug !== undefined ||
      body.title !== undefined
    ) {
      const source =
        body.slug !== undefined
          ? cleanString(
              body.slug
            )
          : data.title ||
            existing.title;

      const slug =
        slugify(source);

      if (!slug) {
        return NextResponse.json(
          {
            success: false,
            message:
              "A valid article slug is required.",
          },
          { status: 400 }
        );
      }

      const duplicate =
        await prisma.blogPost.findFirst(
          {
            where: {
              slug,
              NOT: {
                id,
              },
            },

            select: {
              id: true,
            },
          }
        );

      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Another article already uses this slug.",
          },
          { status: 409 }
        );
      }

      data.slug = slug;
    }

    /**
     * -------------------------------------------------------
     * CONTENT
     * -------------------------------------------------------
     */

    if (
      body.content !== undefined
    ) {
      const content =
        cleanString(
          body.content
        );

      if (!content) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Article content cannot be empty.",
          },
          { status: 400 }
        );
      }

      data.content = content;
    }

    /**
     * -------------------------------------------------------
     * AUTHOR
     * -------------------------------------------------------
     */

    if (
      body.authorName !==
      undefined
    ) {
      const authorName =
        cleanString(
          body.authorName
        );

      if (!authorName) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Author name cannot be empty.",
          },
          { status: 400 }
        );
      }

      data.authorName =
        authorName;
    }

    /**
     * -------------------------------------------------------
     * SIMPLE OPTIONAL FIELDS
     * -------------------------------------------------------
     */

    if (
      body.excerpt !==
      undefined
    ) {
      data.excerpt =
        optionalString(
          body.excerpt
        ) ?? null;
    }

    if (
      body.featuredImage !==
      undefined
    ) {
      data.featuredImage =
        optionalString(
          body.featuredImage
        ) ?? null;
    }

    if (
      body.imageAlt !==
      undefined
    ) {
      data.imageAlt =
        optionalString(
          body.imageAlt
        ) ?? null;
    }

    if (
      body.tags !== undefined
    ) {
      data.tags =
        optionalString(
          body.tags
        ) ?? null;
    }

    if (
      body.seoTitle !==
      undefined
    ) {
      data.seoTitle =
        optionalString(
          body.seoTitle
        ) ?? null;
    }

    if (
      body.seoDescription !==
      undefined
    ) {
      data.seoDescription =
        optionalString(
          body.seoDescription
        ) ?? null;
    }

    /**
     * -------------------------------------------------------
     * CATEGORY
     * -------------------------------------------------------
     */

    if (
      body.categoryId !==
      undefined
    ) {
      const categoryId =
        optionalString(
          body.categoryId
        ) ?? null;

      if (categoryId) {
        const category =
          await prisma.blogCategory.findUnique(
            {
              where: {
                id: categoryId,
              },

              select: {
                id: true,
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

      data.categoryId =
        categoryId;
    }

    /**
     * -------------------------------------------------------
     * PRODUCT
     * -------------------------------------------------------
     */

    if (
      body.productId !==
      undefined
    ) {
      const productId =
        optionalString(
          body.productId
        ) ?? null;

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

      data.productId =
        productId;
    }

    /**
     * -------------------------------------------------------
     * STATUS
     * -------------------------------------------------------
     */

    if (
      body.status !==
      undefined
    ) {
      const statusValue =
        cleanString(
          body.status
        );

      if (
        !VALID_STATUSES.includes(
          statusValue as BlogStatus
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid blog article status.",
          },
          { status: 400 }
        );
      }

      data.status =
        statusValue as BlogStatus;

      if (
        data.status ===
        "PUBLISHED"
      ) {
        if (
          body.publishedAt !==
          undefined
        ) {
          const date =
            new Date(
              String(
                body.publishedAt
              )
            );

          data.publishedAt =
            Number.isNaN(
              date.getTime()
            )
              ? new Date()
              : date;
        } else if (
          !existing.publishedAt
        ) {
          data.publishedAt =
            new Date();
        }
      } else if (
        body.publishedAt ===
        undefined
      ) {
        data.publishedAt =
          existing.publishedAt;
      }
    }

    /**
     * -------------------------------------------------------
     * PUBLISHED DATE
     * -------------------------------------------------------
     */

    if (
      body.publishedAt !==
      undefined &&
      body.status ===
        undefined
    ) {
      if (
        body.publishedAt ===
          null ||
        body.publishedAt === ""
      ) {
        data.publishedAt =
          null;
      } else {
        const date =
          new Date(
            String(
              body.publishedAt
            )
          );

        if (
          Number.isNaN(
            date.getTime()
          )
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Invalid published date.",
            },
            { status: 400 }
          );
        }

        data.publishedAt =
          date;
      }
    }

    /**
     * -------------------------------------------------------
     * READING TIME
     * -------------------------------------------------------
     */

    if (
      body.readingTime !==
      undefined
    ) {
      if (
        body.readingTime ===
          null ||
        body.readingTime === ""
      ) {
        data.readingTime =
          null;
      } else {
        const readingTime =
          Number(
            body.readingTime
          );

        if (
          !Number.isInteger(
            readingTime
          ) ||
          readingTime < 0
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Reading time must be a non-negative whole number.",
            },
            { status: 400 }
          );
        }

        data.readingTime =
          readingTime;
      }
    }

    /**
     * -------------------------------------------------------
     * UPDATE
     * -------------------------------------------------------
     */

    const post =
      await prisma.blogPost.update(
        {
          where: {
            id,
          },

          data,

          include: {
            category: true,

            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                type: true,
                status: true,
              },
            },
          },
        }
      );

    return NextResponse.json({
      success: true,
      message:
        "Blog article updated successfully.",
      post,
    });
  } catch (error) {
    console.error(
      "ADMIN_BLOG_UPDATE_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update blog article.",
      },
      { status: 500 }
    );
  }
}

/**
 * =========================================================
 * DELETE
 * Delete blog article
 * =========================================================
 */

export async function DELETE(
  _request: Request,
  { params }: RouteContext
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

    const { id } =
      await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Blog article ID is required.",
        },
        { status: 400 }
      );
    }

    const existing =
      await prisma.blogPost.findUnique(
        {
          where: {
            id,
          },

          select: {
            id: true,
          },
        }
      );

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Blog article not found.",
        },
        { status: 404 }
      );
    }

    await prisma.blogPost.delete(
      {
        where: {
          id,
        },
      }
    );

    return NextResponse.json({
      success: true,
      message:
        "Blog article deleted successfully.",
    });
  } catch (error) {
    console.error(
      "ADMIN_BLOG_DELETE_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to delete blog article.",
      },
      { status: 500 }
    );
  }
}