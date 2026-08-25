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
  "CLOSED",
] as const;

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

    const body = await request.json();

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
          message:
            "Invalid enquiry status.",
        },
        { status: 400 }
      );
    }

    const existingEnquiry =
      await prisma.enquiry.findUnique({
        where: {
          id,
        },
      });

    if (!existingEnquiry) {
      return NextResponse.json(
        {
          success: false,
          message: "Enquiry not found.",
        },
        { status: 404 }
      );
    }

    const enquiry =
      await prisma.enquiry.update({
        where: {
          id,
        },
        data: {
          status:
            status as
              | "NEW"
              | "CONTACTED"
              | "CLOSED",
        },
      });

    return NextResponse.json({
      success: true,
      message:
        "Enquiry status updated successfully.",
      enquiry,
    });
  } catch (error) {
    console.error(
      "ADMIN_ENQUIRY_UPDATE_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update enquiry.",
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

    const existingEnquiry =
      await prisma.enquiry.findUnique({
        where: {
          id,
        },
      });

    if (!existingEnquiry) {
      return NextResponse.json(
        {
          success: false,
          message: "Enquiry not found.",
        },
        { status: 404 }
      );
    }

    await prisma.enquiry.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Enquiry deleted successfully.",
    });
  } catch (error) {
    console.error(
      "ADMIN_ENQUIRY_DELETE_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to delete enquiry.",
      },
      { status: 500 }
    );
  }
}