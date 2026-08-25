import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  const admin = await getAdminSession();

  if (!admin) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json({
    success: true,
    categories,
  });
}

export async function POST(request: Request) {
  const admin = await getAdminSession();

  if (!admin) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const type = body.type;
    const description =
      String(body.description || "").trim() || null;

    if (!name) {
      return NextResponse.json(
        { message: "Category name is required." },
        { status: 400 }
      );
    }

    if (type !== "IMPORT" && type !== "EXPORT") {
      return NextResponse.json(
        { message: "Invalid category type." },
        { status: 400 }
      );
    }

    const slug = slugify(name);

    if (!slug) {
      return NextResponse.json(
        { message: "Invalid category name." },
        { status: 400 }
      );
    }

    const existing = await prisma.category.findUnique({
      where: {
        slug_type: {
          slug,
          type,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          message:
            "A category with this name already exists for this type.",
        },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        type,
        description,
        active: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CATEGORY_CREATE_ERROR", error);

    return NextResponse.json(
      { message: "Unable to create category." },
      { status: 500 }
    );
  }
}