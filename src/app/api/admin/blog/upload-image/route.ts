import { NextResponse } from "next/server";
import crypto from "crypto";

import { getAdminSession } from "@/lib/admin-auth";

const MAX_FILE_SIZE = 4 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function cloudinarySignature(
  params: Record<string, string>,
  apiSecret: string
) {
  const payload = Object.entries(params)
    .filter(([, value]) => value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return crypto
    .createHash("sha1")
    .update(payload + apiSecret)
    .digest("hex");
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminSession();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 }
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in Vercel.",
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const value = formData.get("file");

    if (!(value instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select an image file.",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(value.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Only JPG, PNG, WEBP and GIF images are allowed.",
        },
        { status: 400 }
      );
    }

    if (value.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "Image size must be 4 MB or less.",
        },
        { status: 400 }
      );
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = "krupali-traders/blog";

    const signature = cloudinarySignature(
      {
        folder,
        timestamp,
      },
      apiSecret
    );

    const uploadForm = new FormData();

    uploadForm.append(
      "file",
      new Blob([await value.arrayBuffer()], {
        type: value.type,
      }),
      value.name
    );
    uploadForm.append("api_key", apiKey);
    uploadForm.append("timestamp", timestamp);
    uploadForm.append("folder", folder);
    uploadForm.append("signature", signature);

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(
        cloudName
      )}/image/upload`,
      {
        method: "POST",
        body: uploadForm,
      }
    );

    const responseText = await cloudinaryResponse.text();

    let uploadResult: {
      secure_url?: string;
      public_id?: string;
      error?: {
        message?: string;
      };
    };

    try {
      uploadResult = JSON.parse(responseText);
    } catch {
      console.error(
        "CLOUDINARY BLOG IMAGE INVALID RESPONSE:",
        responseText
      );

      return NextResponse.json(
        {
          success: false,
          message: "Cloudinary returned an invalid response.",
        },
        { status: 502 }
      );
    }

    if (!cloudinaryResponse.ok || !uploadResult.secure_url) {
      const message =
        uploadResult.error?.message ||
        `Cloudinary HTTP ${cloudinaryResponse.status}`;

      console.error("CLOUDINARY BLOG IMAGE UPLOAD ERROR:", {
        status: cloudinaryResponse.status,
        message,
      });

      return NextResponse.json(
        {
          success: false,
          message: `Cloudinary upload failed: ${message}`,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Featured image uploaded successfully.",
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id ?? null,
    });
  } catch (error) {
    console.error("BLOG IMAGE UPLOAD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to upload the featured image.",
      },
      { status: 500 }
    );
  }
}
