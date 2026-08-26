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

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(
  request: Request,
  context: RouteContext
) {
  const admin = await getAdminSession();

  if (!admin) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await context.params;

    const body = await request.json();

    console.log("CATEGORY UPDATE BODY:", body);

    const name = String(body.name || "").trim();

    const type = body.type;

    const description =
      String(body.description || "").trim() || null;

    const imageUrl =
      String(body.imageUrl || "").trim() || null;

    const active =
      typeof body.active === "boolean"
        ? body.active
        : true;

    console.log("CATEGORY IMAGE URL:", imageUrl);

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

    const existing = await prisma.category.findFirst({
      where: {
        slug,
        type,
        NOT: {
          id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          message:
            "Another category with this name already exists.",
        },
        { status: 409 }
      );
    }

    const category = await prisma.category.update({
      where: {
        id,
      },
      data: {
        name,
        slug,
        type,
        description,
        imageUrl,
        active,
      },
    });

    console.log("CATEGORY UPDATED:", category);

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("CATEGORY_UPDATE_ERROR", error);

    return NextResponse.json(
      {
        message: "Unable to update category.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  const admin = await getAdminSession();

  if (!admin) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await context.params;

    const category = await prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found." },
        { status: 404 }
      );
    }

    if (category._count.products > 0) {
      const updated = await prisma.category.update({
        where: {
          id,
        },
        data: {
          active: false,
        },
      });

      return NextResponse.json({
        success: true,
        deactivated: true,
        message:
          "Category is being used by products, so it was deactivated instead of deleted.",
        category: updated,
      });
    }

    await prisma.category.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      deleted: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    console.error("CATEGORY_DELETE_ERROR", error);

    return NextResponse.json(
      {
        message: "Unable to delete category.",
      },
      { status: 500 }
    );
  }
}