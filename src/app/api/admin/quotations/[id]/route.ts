import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const VALID_STATUSES = [
  "DRAFT",
  "SENT",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
  "CANCELLED",
] as const;

const VALID_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "AED",
  "INR",
] as const;

type ValidStatus =
  (typeof VALID_STATUSES)[number];

type ValidCurrency =
  (typeof VALID_CURRENCIES)[number];

function isValidStatus(
  value: unknown
): value is ValidStatus {
  return (
    typeof value === "string" &&
    VALID_STATUSES.includes(
      value as ValidStatus
    )
  );
}

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

function optionalString(
  value: unknown
): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  return value.trim() || null;
}

/**
 * =========================================================
 * GET
 * Get quotation by ID
 * =========================================================
 */

export async function GET(
  _request: Request,
  { params }: RouteContext
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Quotation ID is required.",
        },
        { status: 400 }
      );
    }

    const quotation =
      await prisma.quotation.findUnique({
        where: {
          id,
        },

        include: {
          rfq: {
            select: {
              id: true,
              rfqNumber: true,
              productId: true,
              productName: true,
              productType: true,
              name: true,
              company: true,
              email: true,
              phone: true,
              country: true,
              destinationPort: true,
              quantity: true,
              unit: true,
              packaging: true,
              incoterm: true,
              requiredDeliveryDate: true,
              requirements: true,
              status: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

    if (!quotation) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Quotation not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      quotation,
    });
  } catch (error) {
    console.error(
      "ADMIN_QUOTATION_GET_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load quotation.",
      },
      { status: 500 }
    );
  }
}

/**
 * =========================================================
 * PATCH
 * Update quotation
 * =========================================================
 */

export async function PATCH(
  request: Request,
  { params }: RouteContext
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Quotation ID is required.",
        },
        { status: 400 }
      );
    }

    const existing =
      await prisma.quotation.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Quotation not found.",
        },
        { status: 404 }
      );
    }

    const body =
      await request.json();

    const data: {
      quantity?: string | null;
      unit?: string | null;
      unitPrice?: number | null;
      totalAmount?: number | null;
      currency?: ValidCurrency;
      destinationPort?: string | null;
      incoterm?: string | null;
      paymentTerms?: string | null;
      deliveryTerms?: string | null;
      deliveryTime?: string | null;
      validityDays?: number;
      countryOfOrigin?: string | null;
      packaging?: string | null;
      notes?: string | null;
      status?: ValidStatus;
      sentAt?: Date | null;
      acceptedAt?: Date | null;
      rejectedAt?: Date | null;
    } = {};

    /**
     * -------------------------------------------------------
     * Quantity
     * -------------------------------------------------------
     */

    if (
      body &&
      Object.prototype.hasOwnProperty.call(
        body,
        "quantity"
      )
    ) {
      data.quantity =
        optionalString(
          body.quantity
        );
    }

    /**
     * -------------------------------------------------------
     * Unit
     * -------------------------------------------------------
     */

    if (
      body &&
      Object.prototype.hasOwnProperty.call(
        body,
        "unit"
      )
    ) {
      data.unit =
        optionalString(body.unit);
    }

    /**
     * -------------------------------------------------------
     * Unit Price
     * -------------------------------------------------------
     */

    if (
      body &&
      Object.prototype.hasOwnProperty.call(
        body,
        "unitPrice"
      )
    ) {
      if (
        body.unitPrice ===
        null ||
        body.unitPrice === ""
      ) {
        data.unitPrice = null;
      } else {
        const unitPrice =
          Number(body.unitPrice);

        if (
          !Number.isFinite(
            unitPrice
          ) ||
          unitPrice < 0
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Invalid unit price.",
            },
            { status: 400 }
          );
        }

        data.unitPrice =
          unitPrice;
      }
    }

    /**
     * -------------------------------------------------------
     * Total Amount
     * -------------------------------------------------------
     */

    if (
      body &&
      Object.prototype.hasOwnProperty.call(
        body,
        "totalAmount"
      )
    ) {
      if (
        body.totalAmount ===
        null ||
        body.totalAmount === ""
      ) {
        data.totalAmount = null;
      } else {
        const totalAmount =
          Number(body.totalAmount);

        if (
          !Number.isFinite(
            totalAmount
          ) ||
          totalAmount < 0
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Invalid total amount.",
            },
            { status: 400 }
          );
        }

        data.totalAmount =
          totalAmount;
      }
    }

    /**
     * -------------------------------------------------------
     * Currency
     * -------------------------------------------------------
     */

    if (
      body &&
      Object.prototype.hasOwnProperty.call(
        body,
        "currency"
      )
    ) {
      if (
        !isValidCurrency(
          body.currency
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid currency.",
          },
          { status: 400 }
        );
      }

      data.currency =
        body.currency;
    }

    /**
     * -------------------------------------------------------
     * Text fields
     * -------------------------------------------------------
     */

    const textFields = [
      "destinationPort",
      "incoterm",
      "paymentTerms",
      "deliveryTerms",
      "deliveryTime",
      "countryOfOrigin",
      "packaging",
      "notes",
    ] as const;

    for (const field of textFields) {
      if (
        body &&
        Object.prototype.hasOwnProperty.call(
          body,
          field
        )
      ) {
        const value =
          optionalString(
            body[field]
          );

        data[field] = value;
      }
    }

    /**
     * -------------------------------------------------------
     * Validity
     * -------------------------------------------------------
     */

    if (
      body &&
      Object.prototype.hasOwnProperty.call(
        body,
        "validityDays"
      )
    ) {
      const validityDays =
        Number(
          body.validityDays
        );

      if (
        !Number.isInteger(
          validityDays
        ) ||
        validityDays <= 0 ||
        validityDays > 3650
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Validity must be a positive number of days.",
          },
          { status: 400 }
        );
      }

      data.validityDays =
        validityDays;
    }

    /**
     * -------------------------------------------------------
     * Status
     * -------------------------------------------------------
     */

    if (
      body &&
      Object.prototype.hasOwnProperty.call(
        body,
        "status"
      )
    ) {
      if (
        !isValidStatus(
          body.status
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid quotation status.",
          },
          { status: 400 }
        );
      }

      data.status =
        body.status;

      if (
        body.status ===
        "SENT"
      ) {
        data.sentAt =
          existing.sentAt ??
          new Date();
      }

      if (
        body.status ===
        "ACCEPTED"
      ) {
        data.acceptedAt =
          existing.acceptedAt ??
          new Date();
      }

      if (
        body.status ===
        "REJECTED"
      ) {
        data.rejectedAt =
          existing.rejectedAt ??
          new Date();
      }
    }

    /**
     * -------------------------------------------------------
     * Update quotation
     * -------------------------------------------------------
     */

    const quotation =
      await prisma.quotation.update({
        where: {
          id,
        },

        data,

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
              phone: true,
              country: true,
              status: true,
            },
          },
        },
      });

    /**
     * -------------------------------------------------------
     * Keep RFQ workflow synchronized
     * -------------------------------------------------------
     */

    if (
      data.status ===
      "SENT"
    ) {
      await prisma.rFQ.update({
        where: {
          id: existing.rfqId,
        },
        data: {
          status: "QUOTE_SENT",
        },
      });
    }

    if (
      data.status ===
      "ACCEPTED"
    ) {
      await prisma.rFQ.update({
        where: {
          id: existing.rfqId,
        },
        data: {
          status: "WON",
        },
      });
    }

    if (
      data.status ===
      "REJECTED" ||
      data.status ===
      "CANCELLED"
    ) {
      await prisma.rFQ.update({
        where: {
          id: existing.rfqId,
        },
        data: {
          status: "LOST",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message:
        "Quotation updated successfully.",
      quotation,
    });
  } catch (error) {
    console.error(
      "ADMIN_QUOTATION_UPDATE_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update quotation.",
      },
      { status: 500 }
    );
  }
}

/**
 * =========================================================
 * DELETE
 * Delete quotation
 * =========================================================
 */

export async function DELETE(
  _request: Request,
  { params }: RouteContext
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Quotation ID is required.",
        },
        { status: 400 }
      );
    }

    const existing =
      await prisma.quotation.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Quotation not found.",
        },
        { status: 404 }
      );
    }

    await prisma.quotation.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Quotation deleted successfully.",
    });
  } catch (error) {
    console.error(
      "ADMIN_QUOTATION_DELETE_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to delete quotation.",
      },
      { status: 500 }
    );
  }
}