import { NextResponse } from "next/server";
import { Readable } from "stream";

import { getAdminSession } from "@/lib/admin-auth";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const admin = await getAdminSession();

  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const type = String(formData.get("type") || "").toUpperCase();

    if (type !== "IMPORT" && type !== "EXPORT") {
      return NextResponse.json({ message: "Invalid category type." }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Category image is required." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ message: "Please upload a valid image file." }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ message: "Category image must be 10 MB or smaller." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `krupali-traders/categories/${type.toLowerCase()}`,
          resource_type: "image",
          transformation: [
            {
              width: 1200,
              height: 800,
              crop: "fill",
              gravity: "auto",
              quality: "auto",
              fetch_format: "auto",
            },
          ],
        },
        (error, uploaded) => {
          if (error || !uploaded?.secure_url) {
            reject(error || new Error("Cloudinary upload failed."));
            return;
          }
          resolve({ secure_url: uploaded.secure_url });
        }
      );

      Readable.from(buffer).pipe(stream);
    });

    return NextResponse.json({
      success: true,
      imageUrl: result.secure_url,
    });
  } catch (error) {
    console.error("CATEGORY_IMAGE_UPLOAD_ERROR", error);
    return NextResponse.json({ message: "Unable to upload category image." }, { status: 500 });
  }
}
