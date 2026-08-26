import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        active: true,
      },

      orderBy: [
        {
          type: "asc",
        },
        {
          name: "asc",
        },
      ],

      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        description: true,
        imageUrl: true,

        products: {
          where: {
            status: "PUBLISHED",
          },

          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            status: true,
          },

          orderBy: [
            {
              featured: "desc",
            },
            {
              name: "asc",
            },
          ],
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        categories,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error(
      "PUBLIC_CATEGORY_LOAD_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load categories.",
        categories: [],
      },
      {
        status: 500,
      }
    );
  }
}