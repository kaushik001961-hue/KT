import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function optionalString(value: unknown): string | null {
  const cleaned = cleanString(value);
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
 * List blog categories
 * =========================================================
 */

export async function GET() {
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

    const categories = await prisma.blogCategory.findMany({
      orderBy: {
        name: "asc",
      },

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
      categories,
    });
  } catch (error) {
    console.error(
      "ADMIN_BLOG_CATEGORIES_LIST_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load blog categories.",
      },
      { status: 500 }
    );
  }
}

/**
 * =========================================================
 * POST
 * Create blog category
 * =========================================================
 */

export async function POST(request: Request) {
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

    const name = cleanString(body.name);

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Category name is required.",
        },
        { status: 400 }
      );
    }

    const slugSource =
      cleanString(body.slug) || name;

    const slug = slugify(slugSource);

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid category slug is required.",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.blogCategory.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "A category with this slug already exists.",
        },
        { status: 409 }
      );
    }

    const category = await prisma.blogCategory.create({
      data: {
        name,
        slug,
        description: optionalString(body.description),
        active:
          typeof body.active === "boolean"
            ? body.active
            : true,
      },

      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Blog category created successfully.",
        category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "ADMIN_BLOG_CATEGORY_CREATE_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create blog category.",
      },
      { status: 500 }
    );
  }
}