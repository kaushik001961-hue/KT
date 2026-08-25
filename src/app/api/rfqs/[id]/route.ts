import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const VALID_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "QUOTE_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
] as const;

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

    const rfq =
      await prisma.rFQ.findUnique({
        where: {
          id,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
              status: true,
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

    return NextResponse.json({
      success: true,
      rfq,
    });
  } catch (error) {
    console.error(
      "ADMIN_RFQ_GET_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load RFQ.",
      },
      { status: 500 }
    );
  }
}

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

    const body =
      await request.json();

    const status = body?.status;

    if (
      typeof status !== "string" ||
      !VALID_STATUSES.includes(
        status as (typeof VALID_STATUSES)[number]
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid RFQ status.",
        },
        { status: 400 }
      );
    }

    const existingRFQ =
      await prisma.rFQ.findUnique({
        where: {
          id,
        },
      });

    if (!existingRFQ) {
      return NextResponse.json(
        {
          success: false,
          message: "RFQ not found.",
        },
        { status: 404 }
      );
    }

    const rfq =
      await prisma.rFQ.update({
        where: {
          id,
        },
        data: {
          status:
            status as
              | "NEW"
              | "CONTACTED"
              | "QUALIFIED"
              | "QUOTE_SENT"
              | "NEGOTIATION"
              | "WON"
              | "LOST",
        },
      });

    /**
     * =====================================================
     * RFQ -> QUOTATION STATUS SYNCHRONIZATION
     *
     * QUOTE_SENT -> SENT
     * WON        -> ACCEPTED
     * LOST       -> REJECTED
     *
     * We only update an existing quotation.
     * Changing an RFQ status never creates a quotation.
     * =====================================================
     */

    const quotationStatusMap = {
      QUOTE_SENT: "SENT",
      WON: "ACCEPTED",
      LOST: "REJECTED",
    } as const;

    const quotationStatus =
      quotationStatusMap[
        status as keyof typeof quotationStatusMap
      ];

    let quotationSynchronized = false;

    if (quotationStatus) {
      const existingQuotation =
        await prisma.quotation.findUnique({
          where: {
            rfqId: id,
          },
        });

      if (existingQuotation) {
        const quotationData: {
          status:
            | "SENT"
            | "ACCEPTED"
            | "REJECTED";
          sentAt?: Date;
          acceptedAt?: Date;
          rejectedAt?: Date;
        } = {
          status: quotationStatus,
        };

        if (
          quotationStatus ===
          "SENT"
        ) {
          quotationData.sentAt =
            existingQuotation.sentAt ??
            new Date();
        }

        if (
          quotationStatus ===
          "ACCEPTED"
        ) {
          quotationData.acceptedAt =
            existingQuotation.acceptedAt ??
            new Date();
        }

        if (
          quotationStatus ===
          "REJECTED"
        ) {
          quotationData.rejectedAt =
            existingQuotation.rejectedAt ??
            new Date();
        }

        await prisma.quotation.update({
          where: {
            id: existingQuotation.id,
          },
          data: quotationData,
        });

        quotationSynchronized = true;
      }
    }

    return NextResponse.json({
      success: true,
      message:
        "RFQ status updated successfully.",
      rfq,
      quotationSynchronized,
    });
  } catch (error) {
    console.error(
      "ADMIN_RFQ_UPDATE_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update RFQ.",
      },
      { status: 500 }
    );
  }
}

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

    const existingRFQ =
      await prisma.rFQ.findUnique({
        where: {
          id,
        },
      });

    if (!existingRFQ) {
      return NextResponse.json(
        {
          success: false,
          message: "RFQ not found.",
        },
        { status: 404 }
      );
    }

    await prisma.rFQ.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "RFQ deleted successfully.",
    });
  } catch (error) {
    console.error(
      "ADMIN_RFQ_DELETE_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete RFQ.",
      },
      { status: 500 }
    );
  }
}