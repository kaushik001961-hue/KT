import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const VALID_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "AED",
  "INR",
] as const;

type ValidCurrency =
  (typeof VALID_CURRENCIES)[number];

function isValidCurrency(
  value: unknown
): value is ValidCurrency {
  return (
    typeof value === "string" &&
    VALID_CURRENCIES.includes(
      value as ValidCurrency
    )
  );
}

/**
 * =========================================================
 * GET
 * List all quotations
 * =========================================================
 */

export async function GET() {
  try {
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

    const quotations =
      await prisma.quotation.findMany({
        orderBy: {
          createdAt: "desc",
        },

        include: {
          rfq: {
            select: {
              id: true,
              rfqNumber: true,
              productName: true,
              productType: true,
              name: true,
              company: true,
              email: true,
              status: true,
            },
          },
        },
      });

    return NextResponse.json({
      success: true,
      quotations,
    });
  } catch (error) {
    console.error(
      "ADMIN_QUOTATIONS_LIST_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load quotations.",
      },
      { status: 500 }
    );
  }
}

/**
 * =========================================================
 * POST
 * Create quotation from RFQ
 * =========================================================
 */

export async function POST(
  request: Request
) {
  try {
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

    const body =
      await request.json();

    const rfqId =
      typeof body?.rfqId === "string"
        ? body.rfqId.trim()
        : "";

    if (!rfqId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "RFQ ID is required.",
        },
        { status: 400 }
      );
    }

    /**
     * =====================================================
     * FIND RFQ
     * =====================================================
     */

    const rfq =
      await prisma.rFQ.findUnique({
        where: {
          id: rfqId,
        },

        include: {
          quotation: true,

          product: {
            select: {
              id: true,
              name: true,
              type: true,
              countryOfOrigin: true,
              packaging: true,
            },
          },
        },
      });

    if (!rfq) {
      return NextResponse.json(
        {
          success: false,
          message: "RFQ not found.",
        },
        { status: 404 }
      );
    }

    /**
     * =====================================================
     * PREVENT DUPLICATE QUOTATION
     * =====================================================
     */

    if (rfq.quotation) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A quotation already exists for this RFQ.",
          quotation: rfq.quotation,
        },
        { status: 409 }
      );
    }

    /**
     * =====================================================
     * GENERATE SAFE QUOTATION NUMBER
     *
     * Example:
     * QT-2026-000001
     * =====================================================
     */

    const year =
      new Date().getFullYear();

    let quotationNumber = "";

    for (
      let attempt = 0;
      attempt < 10;
      attempt++
    ) {
      const quotationCount =
        await prisma.quotation.count({
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

      const candidate =
        `QT-${year}-${String(
          quotationCount +
            attempt +
            1
        ).padStart(6, "0")}`;

      const existing =
        await prisma.quotation.findUnique({
          where: {
            quotationNumber:
              candidate,
          },

          select: {
            id: true,
          },
        });

      if (!existing) {
        quotationNumber =
          candidate;

        break;
      }
    }

    if (!quotationNumber) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to generate quotation number. Please try again.",
        },
        { status: 500 }
      );
    }

    /**
     * =====================================================
     * CURRENCY
     * =====================================================
     */

    const currency =
      isValidCurrency(
        body?.currency
      )
        ? body.currency
        : "USD";

    /**
     * =====================================================
     * OPTIONAL VALUES
     * =====================================================
     */

    const paymentTerms =
      typeof body?.paymentTerms ===
      "string"
        ? body.paymentTerms.trim() ||
          null
        : null;

    const deliveryTerms =
      typeof body?.deliveryTerms ===
      "string"
        ? body.deliveryTerms.trim() ||
          null
        : null;

    const deliveryTime =
      typeof body?.deliveryTime ===
      "string"
        ? body.deliveryTime.trim() ||
          null
        : null;

    const notes =
      typeof body?.notes ===
      "string"
        ? body.notes.trim() ||
          null
        : null;

    const validityDays =
      Number.isInteger(
        body?.validityDays
      ) &&
      body.validityDays > 0
        ? body.validityDays
        : 30;

    /**
     * =====================================================
     * CREATE QUOTATION
     * =====================================================
     */

    const quotation =
      await prisma.quotation.create({
        data: {
          quotationNumber,

          rfq: {
            connect: {
              id: rfq.id,
            },
          },

          productName:
            rfq.productName,

          productType:
            rfq.productType,

          buyerName:
            rfq.name,

          buyerCompany:
            rfq.company,

          buyerEmail:
            rfq.email,

          buyerPhone:
            rfq.phone,

          buyerCountry:
            rfq.country,

          quantity:
            rfq.quantity,

          unit:
            rfq.unit,

          currency,

          destinationPort:
            rfq.destinationPort,

          incoterm:
            rfq.incoterm,

          countryOfOrigin:
            rfq.product
              ?.countryOfOrigin ||
            null,

          packaging:
            rfq.packaging ||
            rfq.product?.packaging ||
            null,

          paymentTerms,

          deliveryTerms,

          deliveryTime,

          validityDays,

          notes,

          status: "DRAFT",
        },

        include: {
          rfq: {
            select: {
              id: true,
              rfqNumber: true,
              productName: true,
              productType: true,
              name: true,
              company: true,
              email: true,
            },
          },
        },
      });

    /**
     * =====================================================
     * RESPONSE
     * =====================================================
     */

    return NextResponse.json(
      {
        success: true,
        message:
          "Quotation created successfully.",
        quotation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "ADMIN_QUOTATION_CREATE_ERROR",
      error
    );

    /**
     * Prisma unique constraint
     * protection
     */
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Quotation number already exists. Please try again.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to create quotation.",
      },
      { status: 500 }
    );
  }
}