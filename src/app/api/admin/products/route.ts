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

export async function GET(request: Request) {
  const admin = await getAdminSession();

  if (!admin) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);

    const typeParam = searchParams.get("type");
    const statusParam = searchParams.get("status");
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search")?.trim();

    const type =
      typeParam === "IMPORT" || typeParam === "EXPORT"
        ? typeParam
        : undefined;

    const status =
      statusParam === "DRAFT" ||
      statusParam === "PUBLISHED" ||
      statusParam === "ARCHIVED"
        ? statusParam
        : undefined;

    const products = await prisma.product.findMany({
      where: {
        ...(type ? { type } : {}),
        ...(status ? { status } : {}),
        ...(categoryId
          ? { categoryId }
          : {}),
        ...(search
          ? {
              OR: [
                {
                  name: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  slug: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
      },

      include: {
        category: true,
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
        _count: {
          select: {
            images: true,
          },
        },
      },

      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("PRODUCT_LIST_ERROR", error);

    return NextResponse.json(
      {
        message: "Unable to load products.",
      },
      { status: 500 }
    );
  }
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
    const slugInput = String(body.slug || "").trim();

    const type = body.type;
    const status = body.status || "DRAFT";

    const shortDescription =
      String(body.shortDescription || "").trim() || null;

    const description =
      String(body.description || "").trim() || null;

    const specifications =
      String(body.specifications || "").trim() || null;

    const countryOfOrigin =
      String(body.countryOfOrigin || "").trim() || null;

    const packaging =
      String(body.packaging || "").trim() || null;

    const minimumOrderQuantity =
      String(body.minimumOrderQuantity || "").trim() || null;

    const categoryId =
      body.categoryId
        ? String(body.categoryId)
        : null;

    const featured =
      Boolean(body.featured);

    if (!name) {
      return NextResponse.json(
        {
          message:
            "Product name is required.",
        },
        { status: 400 }
      );
    }

    if (
      type !== "IMPORT" &&
      type !== "EXPORT"
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid product type.",
        },
        { status: 400 }
      );
    }

    if (
      status !== "DRAFT" &&
      status !== "PUBLISHED" &&
      status !== "ARCHIVED"
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid product status.",
        },
        { status: 400 }
      );
    }

    const slug = slugify(
      slugInput || name
    );

    if (!slug) {
      return NextResponse.json(
        {
          message:
            "Unable to create a valid product slug.",
        },
        { status: 400 }
      );
    }

    const existing =
      await prisma.product.findUnique({
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
            "A product with this slug already exists for this product type.",
        },
        { status: 409 }
      );
    }

    if (categoryId) {
      const category =
        await prisma.category.findUnique({
          where: {
            id: categoryId,
          },
        });

      if (!category) {
        return NextResponse.json(
          {
            message:
              "Selected category was not found.",
          },
          { status: 400 }
        );
      }

      if (category.type !== type) {
        return NextResponse.json(
          {
            message:
              "Selected category does not belong to this product type.",
          },
          { status: 400 }
        );
      }

      if (!category.active) {
        return NextResponse.json(
          {
            message:
              "Selected category is inactive.",
          },
          { status: 400 }
        );
      }
    }

    const rawImages = Array.isArray(body.images)
      ? body.images
      : [];

    const images = rawImages
      .map(
        (
          image: {
            url?: unknown;
            alt?: unknown;
            sortOrder?: unknown;
          },
          index: number
        ) => ({
          url: String(image.url || "").trim(),
          alt:
            String(image.alt || "").trim() ||
            null,
          sortOrder:
            Number.isFinite(
              Number(image.sortOrder)
            )
              ? Number(image.sortOrder)
              : index,
        })
      )
      .filter(
        (image: { url: string }) =>
          Boolean(image.url)
      );

    const product =
      await prisma.product.create({
        data: {
          name,
          slug,
          type,
          status,

          shortDescription,
          description,
          specifications,
          countryOfOrigin,
          packaging,
          minimumOrderQuantity,

          featured,
          categoryId,

          images: {
            create: images,
          },
        },

        include: {
          category: true,
          images: {
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Product created successfully.",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "PRODUCT_CREATE_ERROR",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to create product.",
      },
      { status: 500 }
    );
  }
}