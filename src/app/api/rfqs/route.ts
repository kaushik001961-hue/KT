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

/* =========================================================
   GET — ADMIN RFQs
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

/* =========================================================
   POST — PUBLIC REQUEST FOR QUOTE
========================================================= */

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request.",
        },
        { status: 400 }
      );
    }

    const productName =
      typeof body.productName === "string"
        ? body.productName.trim()
        : "";

    const productType =
      typeof body.productType === "string"
        ? body.productType.trim().toUpperCase()
        : "";

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const company =
      typeof body.company === "string"
        ? body.company.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : "";

    const country =
      typeof body.country === "string"
        ? body.country.trim()
        : "";

    const destinationPort =
      typeof body.destinationPort === "string"
        ? body.destinationPort.trim()
        : "";

    const quantity =
      typeof body.quantity === "string"
        ? body.quantity.trim()
        : "";

    const unit =
      typeof body.unit === "string"
        ? body.unit.trim()
        : "";

    const packaging =
      typeof body.packaging === "string"
        ? body.packaging.trim()
        : "";

    const incoterm =
      typeof body.incoterm === "string"
        ? body.incoterm.trim()
        : "";

    const requirements =
      typeof body.requirements === "string"
        ? body.requirements.trim()
        : "";

    const requiredDeliveryDate =
      typeof body.requiredDeliveryDate === "string" &&
      body.requiredDeliveryDate.trim()
        ? body.requiredDeliveryDate.trim()
        : "";

    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!productName) {
      return NextResponse.json(
        {
          success: false,
          message: "Product name is required.",
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
          message: "Invalid product type.",
        },
        { status: 400 }
      );
    }

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

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       OPTIONAL PRODUCT LOOKUP
    ===================================================== */

    const product =
      await prisma.product.findFirst({
        where: {
          name: productName,
          type:
            productType as
              | "IMPORT"
              | "EXPORT",
        },

        select: {
          id: true,
        },
      });

    /* =====================================================
       GENERATE RFQ NUMBER
       
       Example:
       RFQ-2026-000003
    ===================================================== */

    const year =
      new Date().getFullYear();

    let rfqNumber = "";

    for (
      let attempt = 0;
      attempt < 10;
      attempt++
    ) {
      const count =
        await prisma.rFQ.count({
          where: {
            createdAt: {
              gte: new Date(
                `${year}-01-01T00:00:00.000Z`
              ),

              lt: new Date(
                `${year + 1}-01-01T00:00:00.000Z`
              ),
            },
          },
        });

      const sequence =
        String(count + attempt + 1)
          .padStart(6, "0");

      const candidate =
        `RFQ-${year}-${sequence}`;

      const existing =
        await prisma.rFQ.findUnique({
          where: {
            rfqNumber: candidate,
          },
          select: {
            id: true,
          },
        });

      if (!existing) {
        rfqNumber = candidate;
        break;
      }
    }

    if (!rfqNumber) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to generate RFQ number.",
        },
        { status: 500 }
      );
    }

    /* =====================================================
       REQUIRED DELIVERY DATE
    ===================================================== */

    let deliveryDate: Date | undefined;

    if (requiredDeliveryDate) {
      const parsedDate =
        new Date(requiredDeliveryDate);

      if (
        !Number.isNaN(
          parsedDate.getTime()
        )
      ) {
        deliveryDate = parsedDate;
      }
    }

    /* =====================================================
       CREATE RFQ
    ===================================================== */

    const rfq =
      await prisma.rFQ.create({
        data: {
          rfqNumber,

          productId:
            product?.id || null,

          productName,

          productType:
            productType as
              | "IMPORT"
              | "EXPORT",

          name,

          company:
            company || null,

          email,

          phone:
            phone || null,

          country:
            country || null,

          destinationPort:
            destinationPort || null,

          quantity:
            quantity || null,

          unit:
            unit || null,

          packaging:
            packaging || null,

          incoterm:
            incoterm || null,

          requiredDeliveryDate:
            deliveryDate || null,

          requirements:
            requirements || null,

          status: "NEW",
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
      });

    console.log(
      "PUBLIC_RFQ_CREATED",
      {
        rfqId: rfq.id,
        rfqNumber: rfq.rfqNumber,
      }
    );

    return NextResponse.json(
      {
        success: true,

        message:
          "Your request for quote has been submitted successfully.",

        rfq,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "PUBLIC_RFQ_CREATE_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to submit your request for quote. Please try again.",
      },
      { status: 500 }
    );
  }
}