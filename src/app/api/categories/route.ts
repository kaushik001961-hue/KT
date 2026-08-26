import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        active: true,
        type: {
          in: ["IMPORT", "EXPORT"],
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
      },
      orderBy: [
        {
          type: "asc",
        },
        {
          name: "asc",
        },
      ],
    });

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("PUBLIC_CATEGORIES_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load categories.",
        categories: [],
      },
      { status: 500 }
    );
  }
}