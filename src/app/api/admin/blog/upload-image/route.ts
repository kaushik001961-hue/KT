import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

import { getAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function configureCloudinary() {
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME;

  const apiKey =
    process.env.CLOUDINARY_API_KEY;

  const apiSecret =
    process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary configuration is missing. Please check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET."
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

function uploadToCloudinary(
  buffer: Buffer
): Promise<{
  secure_url: string;
  public_id: string;
}> {
  return new Promise(
    (resolve, reject) => {
      const uploadStream =
        cloudinary.uploader.upload_stream(
          {
            folder:
              "krupali-traders/blog",
            resource_type: "image",
          },
          (error, result) => {
            if (error || !result) {
              reject(
                error ||
                  new Error(
                    "Cloudinary upload failed."
                  )
              );
              return;
            }

            resolve({
              secure_url:
                result.secure_url,
              public_id:
                result.public_id,
            });
          }
        );

      uploadStream.end(buffer);
    }
  );
}

export async function POST(
  request: Request
) {
  try {
    const admin =
      await getAdminSession();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    configureCloudinary();

    const formData =
      await request.formData();

    const file =
      formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please select an image file.",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only JPG, PNG, WEBP and GIF images are allowed.",
        },
        { status: 400 }
      );
    }

    if (file.size <= 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The selected image is empty.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Image size must be 10 MB or smaller.",
        },
        { status: 400 }
      );
    }

    const arrayBuffer =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(arrayBuffer);

    const uploaded =
      await uploadToCloudinary(
        buffer
      );

    return NextResponse.json({
      success: true,
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
    });
  } catch (error) {
    console.error(
      "BLOG_IMAGE_UPLOAD_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to upload Blog image.",
      },
      { status: 500 }
    );
  }
}
