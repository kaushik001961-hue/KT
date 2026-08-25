import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const typeParam = searchParams.get("type");

    if (
      typeParam !== "IMPORT" &&
      typeParam !== "EXPORT"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product type.",
        },
        { status: 400 }
      );
    }

    const search =
      searchParams.get("search")?.trim() || "";

    const categoryId =
      searchParams.get("categoryId")?.trim() || "";

    const featuredParam =
      searchParams.get("featured");

    const featured =
      featuredParam === "true"
        ? true
        : featuredParam === "false"
          ? false
          : undefined;

    const products =
      await prisma.product.findMany({
        where: {
          type: typeParam,

          // IMPORTANT:
          // Public website only shows published products.
          status: "PUBLISHED",

          ...(categoryId
            ? {
                categoryId,
              }
            : {}),

          ...(featured !== undefined
            ? {
                featured,
              }
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
                  {
                    shortDescription: {
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
        },

        orderBy: [
          {
            featured: "desc",
          },
          {
            updatedAt: "desc",
          },
        ],
      });

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error(
      "PUBLIC_PRODUCT_LIST_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load products.",
      },
      { status: 500 }
    );
  }
}