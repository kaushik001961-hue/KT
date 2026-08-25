import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
    imageId: string;
  }>;
};

function getCloudinaryPublicId(url: string) {
  try {
    const parsed = new URL(url);

    const parts = parsed.pathname
      .split("/")
      .filter(Boolean);

    const uploadIndex = parts.indexOf("upload");

    if (uploadIndex === -1) {
      return null;
    }

    let publicIdParts = parts.slice(
      uploadIndex + 1
    );

    if (
      publicIdParts[0]?.startsWith("v") &&
      /^v\d+$/.test(publicIdParts[0])
    ) {
      publicIdParts = publicIdParts.slice(1);
    }

    if (publicIdParts.length === 0) {
      return null;
    }

    const lastIndex =
      publicIdParts.length - 1;

    publicIdParts[lastIndex] =
      publicIdParts[lastIndex].replace(
        /\.[^/.]+$/,
        ""
      );

    return publicIdParts.join("/");
  } catch {
    return null;
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

    const { id, imageId } = await params;

    const image =
      await prisma.productImage.findFirst({
        where: {
          id: imageId,
          productId: id,
        },
      });

    if (!image) {
      return NextResponse.json(
        {
          success: false,
          message: "Product image not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Delete the Cloudinary asset first.
     * If the URL belongs to another storage provider,
     * this simply skips the Cloudinary deletion.
     */
    const publicId = getCloudinaryPublicId(
      image.url
    );

    if (publicId) {
      try {
        await cloudinary.uploader.destroy(
          publicId,
          {
            resource_type: "image",
          }
        );
      } catch (cloudinaryError) {
        console.error(
          "CLOUDINARY_IMAGE_DELETE_ERROR",
          cloudinaryError
        );
      }
    }

    await prisma.productImage.delete({
      where: {
        id: image.id,
      },
    });

    /*
     * Re-number the remaining images so that
     * sortOrder stays continuous.
     */
    const remainingImages =
      await prisma.productImage.findMany({
        where: {
          productId: id,
        },
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            createdAt: "asc",
          },
        ],
      });

    await prisma.$transaction(
      remainingImages.map(
        (remainingImage, index) =>
          prisma.productImage.update({
            where: {
              id: remainingImage.id,
            },
            data: {
              sortOrder: index,
            },
          })
      )
    );

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully.",
    });
  } catch (error) {
    console.error(
      "PRODUCT_IMAGE_DELETE_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete image.",
      },
      { status: 500 }
    );
  }
}