import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

const VALID_PRODUCT_TYPES = [
  "IMPORT",
  "EXPORT",
] as const;

const VALID_STATUSES = [
  "NEW",
  "CONTACTED",
  "CLOSED",
] as const;

/* =========================================================
   GET — ADMIN ENQUIRIES
========================================================= */

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

    /* =====================================================
       VALIDATE STATUS FILTER
    ===================================================== */

    const status =
      statusParam &&
      VALID_STATUSES.includes(
        statusParam as (typeof VALID_STATUSES)[number]
      )
        ? (statusParam as
            | "NEW"
            | "CONTACTED"
            | "CLOSED")
        : undefined;

    /* =====================================================
       VALIDATE PRODUCT TYPE FILTER
    ===================================================== */

    const productType =
      productTypeParam &&
      VALID_PRODUCT_TYPES.includes(
        productTypeParam as (typeof VALID_PRODUCT_TYPES)[number]
      )
        ? (productTypeParam as
            | "IMPORT"
            | "EXPORT")
        : undefined;

    /* =====================================================
       BUILD FILTER
    ===================================================== */

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

    /* =====================================================
       LOAD ENQUIRIES + COUNTS
    ===================================================== */

    const [
      enquiries,
      newCount,
      contactedCount,
      closedCount,
    ] = await Promise.all([
      prisma.enquiry.findMany({
        where,

        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.enquiry.count({
        where: {
          ...where,
          status: "NEW",
        },
      }),

      prisma.enquiry.count({
        where: {
          ...where,
          status: "CONTACTED",
        },
      }),

      prisma.enquiry.count({
        where: {
          ...where,
          status: "CLOSED",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,

      enquiries,

      counts: {
        NEW: newCount,
        CONTACTED: contactedCount,
        CLOSED: closedCount,
      },
    });
  } catch (error) {
    console.error(
      "ADMIN_ENQUIRIES_LIST_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load enquiries.",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   POST — PUBLIC ENQUIRY
========================================================= */

export async function POST(request: Request) {
  try {
    const body =
      await request.json();

    const name =
      String(
        body.name || ""
      ).trim();

    const company =
      String(
        body.company || ""
      ).trim() || null;

    const email =
      String(
        body.email || ""
      ).trim();

    const phone =
      String(
        body.phone || ""
      ).trim() || null;

    const country =
      String(
        body.country || ""
      ).trim() || null;

    const productName =
      String(
        body.productName || ""
      ).trim();

    const quantity =
      String(
        body.quantity || ""
      ).trim() || null;

    const message =
      String(
        body.message || ""
      ).trim() || null;

    const productType =
      String(
        body.productType || ""
      ).trim();

    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Name is required.",
        },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required.",
        },
        { status: 400 }
      );
    }

    if (!productName) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Product name is required.",
        },
        { status: 400 }
      );
    }

    if (
      !VALID_PRODUCT_TYPES.includes(
        productType as (typeof VALID_PRODUCT_TYPES)[number]
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please select Import or Export.",
        },
        { status: 400 }
      );
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       CREATE ENQUIRY
    ===================================================== */

    const enquiry =
      await prisma.enquiry.create({
        data: {
          name,
          company,
          email,
          phone,
          country,
          productName,

          productType:
            productType as
              | "IMPORT"
              | "EXPORT",

          quantity,
          message,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Your enquiry has been submitted successfully.",

        enquiry: {
          id: enquiry.id,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "PUBLIC_ENQUIRY_CREATE_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to submit your enquiry. Please try again.",
      },
      { status: 500 }
    );
  }
}