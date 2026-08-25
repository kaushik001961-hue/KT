import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
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

    const product = await prisma.product.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        { status: 404 }
      );
    }

    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Image file is required.",
        },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        {
          success: false,
          message: "Only image files are allowed.",
        },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Image size must be 10 MB or less.",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    const uploadResult =
      await new Promise<{
        secure_url: string;
        public_id: string;
      }>((resolve, reject) => {
        const uploadStream =
          cloudinary.uploader.upload_stream(
            {
              folder: "krupali-traders/products",
              resource_type: "image",
            },
            (error, result) => {
              if (error) {
                reject(error);
                return;
              }

              if (!result) {
                reject(
                  new Error(
                    "Cloudinary returned no result."
                  )
                );
                return;
              }

              resolve({
                secure_url: result.secure_url,
                public_id: result.public_id,
              });
            }
          );

        uploadStream.end(buffer);
      });

    const imageCount =
      await prisma.productImage.count({
        where: {
          productId: product.id,
        },
      });

    const image = await prisma.productImage.create({
      data: {
        productId: product.id,
        url: uploadResult.secure_url,
        alt: product.name,
        sortOrder: imageCount,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Image uploaded successfully.",
      image: {
        id: image.id,
        url: image.url,
        alt: image.alt,
        sortOrder: image.sortOrder,
        publicId: uploadResult.public_id,
      },
    });
  } catch (error) {
    console.error(
      "PRODUCT_IMAGE_UPLOAD_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to upload image.",
      },
      { status: 500 }
    );
  }
}