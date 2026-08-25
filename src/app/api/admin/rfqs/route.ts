import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const VALID_PRODUCT_TYPES = [
  "IMPORT",
  "EXPORT",
] as const;

const VALID_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "QUOTE_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
] as const;

export async function GET(request: Request) {
  const admin = await getAdminSession();

  if (!admin) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  try {
    const { searchParams } =
      new URL(request.url);

    const statusParam =
      searchParams.get("status");

    const productTypeParam =
      searchParams.get("productType");

    const search =
      searchParams.get("search")?.trim() || "";

    const status =
      statusParam &&
      VALID_STATUSES.includes(
        statusParam as (typeof VALID_STATUSES)[number]
      )
        ? (statusParam as (typeof VALID_STATUSES)[number])
        : undefined;

    const productType =
      productTypeParam &&
      VALID_PRODUCT_TYPES.includes(
        productTypeParam as (typeof VALID_PRODUCT_TYPES)[number]
      )
        ? (productTypeParam as (typeof VALID_PRODUCT_TYPES)[number])
        : undefined;

    const where = {
      ...(status
        ? {
            status,
          }
        : {}),

      ...(productType
        ? {
            productType,
          }
        : {}),

      ...(search
        ? {
            OR: [
              {
                rfqNumber: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                name: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                company: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                email: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                productName: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                country: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    };

    const [
      rfqs,
      totalCount,
      newCount,
      contactedCount,
      qualifiedCount,
      quoteSentCount,
      negotiationCount,
      wonCount,
      lostCount,
    ] = await Promise.all([
      prisma.rFQ.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        include: {
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

      prisma.rFQ.count(),

      prisma.rFQ.count({
        where: {
          ...where,
          status: "NEW",
        },
      }),

      prisma.rFQ.count({
        where: {
          ...where,
          status: "CONTACTED",
        },
      }),

      prisma.rFQ.count({
        where: {
          ...where,
          status: "QUALIFIED",
        },
      }),

      prisma.rFQ.count({
        where: {
          ...where,
          status: "QUOTE_SENT",
        },
      }),

      prisma.rFQ.count({
        where: {
          ...where,
          status: "NEGOTIATION",
        },
      }),

      prisma.rFQ.count({
        where: {
          ...where,
          status: "WON",
        },
      }),

      prisma.rFQ.count({
        where: {
          ...where,
          status: "LOST",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,

      rfqs,

      counts: {
        TOTAL: totalCount,
        NEW: newCount,
        CONTACTED: contactedCount,
        QUALIFIED: qualifiedCount,
        QUOTE_SENT: quoteSentCount,
        NEGOTIATION: negotiationCount,
        WON: wonCount,
        LOST: lostCount,
      },
    });
  } catch (error) {
    console.error(
      "ADMIN_RFQS_LIST_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load RFQs.",
      },
      { status: 500 }
    );
  }
}