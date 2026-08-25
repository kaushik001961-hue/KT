import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
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

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * =========================================================
 * GET
 * Get one blog category
 * =========================================================
 */

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const admin = await getAdminSession();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Category ID is required.",
        },
        { status: 400 }
      );
    }

    const category =
      await prisma.blogCategory.findUnique({
        where: {
          id,
        },
        include: {
          _count: {
            select: {
              posts: true,
            },
          },
        },
      });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Blog category not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error(
      "ADMIN_BLOG_CATEGORY_GET_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load blog category.",
      },
      { status: 500 }
    );
  }
}

/**
 * =========================================================
 * PATCH
 * Update blog category
 * =========================================================
 */

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    const admin = await getAdminSession();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Category ID is required.",
        },
        { status: 400 }
      );
    }

    const existing =
      await prisma.blogCategory.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Blog category not found.",
        },
        { status: 404 }
      );
    }

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request body.",
        },
        { status: 400 }
      );
    }

    const data: {
      name?: string;
      slug?: string;
      description?: string | null;
      active?: boolean;
    } = {};

    /**
     * -------------------------------------------------------
     * NAME
     * -------------------------------------------------------
     */

    if (body.name !== undefined) {
      const name = cleanString(body.name);

      if (!name) {
        return NextResponse.json(
          {
            success: false,
            message: "Category name cannot be empty.",
          },
          { status: 400 }
        );
      }

      data.name = name;
    }

    /**
     * -------------------------------------------------------
     * SLUG
     * -------------------------------------------------------
     */

    if (
      body.slug !== undefined ||
      body.name !== undefined
    ) {
      const source =
        body.slug !== undefined
          ? cleanString(body.slug)
          : data.name || existing.name;

      const slug = slugify(source);

      if (!slug) {
        return NextResponse.json(
          {
            success: false,
            message: "A valid category slug is required.",
          },
          { status: 400 }
        );
      }

      const duplicate =
        await prisma.blogCategory.findFirst({
          where: {
            slug,
            NOT: {
              id,
            },
          },
          select: {
            id: true,
          },
        });

      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Another category already uses this slug.",
          },
          { status: 409 }
        );
      }

      data.slug = slug;
    }

    /**
     * -------------------------------------------------------
     * DESCRIPTION
     * -------------------------------------------------------
     */

    if (body.description !== undefined) {
      data.description =
        optionalString(body.description) ?? null;
    }

    /**
     * -------------------------------------------------------
     * ACTIVE
     * -------------------------------------------------------
     */

    if (body.active !== undefined) {
      if (typeof body.active !== "boolean") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Category active value must be true or false.",
          },
          { status: 400 }
        );
      }

      data.active = body.active;
    }

    /**
     * -------------------------------------------------------
     * UPDATE
     * -------------------------------------------------------
     */

    const category =
      await prisma.blogCategory.update({
        where: {
          id,
        },

        data,

        include: {
          _count: {
            select: {
              posts: true,
            },
          },
        },
      });

    return NextResponse.json({
      success: true,
      message: "Blog category updated successfully.",
      category,
    });
  } catch (error) {
    console.error(
      "ADMIN_BLOG_CATEGORY_UPDATE_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update blog category.",
      },
      { status: 500 }
    );
  }
}

/**
 * =========================================================
 * DELETE
 * Delete blog category
 * =========================================================
 */

export async function DELETE(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const admin = await getAdminSession();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Category ID is required.",
        },
        { status: 400 }
      );
    }

    const existing =
      await prisma.blogCategory.findUnique({
        where: {
          id,
        },
        include: {
          _count: {
            select: {
              posts: true,
            },
          },
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Blog category not found.",
        },
        { status: 404 }
      );
    }

    /**
     * Prevent deletion when articles
     * are still assigned to the category.
     */

    if (existing._count.posts > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This category contains blog articles. Move or delete those articles before deleting the category.",
          postCount: existing._count.posts,
        },
        { status: 409 }
      );
    }

    await prisma.blogCategory.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Blog category deleted successfully.",
    });
  } catch (error) {
    console.error(
      "ADMIN_BLOG_CATEGORY_DELETE_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete blog category.",
      },
      { status: 500 }
    );
  }
}