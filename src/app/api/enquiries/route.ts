import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const productName =
      String(
        body.productName || ""
      ).trim();

    const productType =
      body.productType;

    const name =
      String(body.name || "").trim();

    const email =
      String(body.email || "").trim();

    const company =
      String(
        body.company || ""
      ).trim() || null;

    const phone =
      String(
        body.phone || ""
      ).trim() || null;

    const country =
      String(
        body.country || ""
      ).trim() || null;

    const quantity =
      String(
        body.quantity || ""
      ).trim() || null;

    const message =
      String(
        body.message || ""
      ).trim() || null;

    if (!productName) {
      return NextResponse.json(
        {
          message:
            "Product name is required.",
        },
        { status: 400 }
      );
    }

    if (
      productType !== "IMPORT" &&
      productType !== "EXPORT"
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid product type.",
        },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        {
          message:
            "Name is required.",
        },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          message:
            "Email is required.",
        },
        { status: 400 }
      );
    }

    const enquiry =
      await prisma.enquiry.create({
        data: {
          productName,
          productType,

          name,
          company,
          email,
          phone,
          country,

          quantity,
          message,

          status: "NEW",
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Enquiry submitted successfully.",
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
        message:
          "Unable to submit enquiry.",
      },
      { status: 500 }
    );
  }
}