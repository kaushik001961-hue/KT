import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_IMAGES = 500;
const ALLOWED_TYPES = new Set(["IMPORT", "EXPORT"]);

type BulkImage = {
  productId: string;
  url: string;
  alt?: string;
  sortOrder?: number;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const type = String(body?.type || "").toUpperCase();
    const replaceExisting = Boolean(body?.replaceExisting);
    const images = Array.isArray(body?.images) ? (body.images as BulkImage[]) : [];

    if (!ALLOWED_TYPES.has(type)) {
      return NextResponse.json({ message: "Invalid product type." }, { status: 400 });
    }

    if (!images.length) {
      return NextResponse.json({ message: "No images were supplied." }, { status: 400 });
    }

    if (images.length > MAX_IMAGES) {
      return NextResponse.json(
        { message: `Maximum ${MAX_IMAGES} images can be saved at once.` },
        { status: 400 }
      );
    }

    for (const item of images) {
      if (!item?.productId || !item?.url) {
        return NextResponse.json(
          { message: "Every image requires productId and url." },
          { status: 400 }
        );
      }

      if (!/^https?:\/\//i.test(item.url)) {
        return NextResponse.json(
          { message: "Invalid image URL supplied." },
          { status: 400 }
        );
      }
    }

    const productIds = [...new Set(images.map((item) => item.productId))];

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        type: type as "IMPORT" | "EXPORT",
      },
      select: { id: true, name: true },
    });

    const validIds = new Set(products.map((product) => product.id));
    const invalidIds = productIds.filter((id) => !validIds.has(id));

    if (invalidIds.length) {
      return NextResponse.json(
        { message: `${invalidIds.length} product(s) were not found for ${type}.` },
        { status: 400 }
      );
    }

    const grouped = new Map<string, BulkImage[]>();
    for (const item of images) {
      const list = grouped.get(item.productId) || [];
      list.push(item);
      grouped.set(item.productId, list);
    }

    const saved = await prisma.$transaction(async (tx) => {
      let count = 0;

      for (const [productId, items] of grouped) {
        if (replaceExisting) {
          await tx.productImage.deleteMany({ where: { productId } });
        }

        const existingCount = replaceExisting
          ? 0
          : await tx.productImage.count({ where: { productId } });

        await tx.productImage.createMany({
          data: items.map((item, index) => ({
            productId,
            url: item.url,
            alt: item.alt?.trim() || null,
            sortOrder: Number.isFinite(item.sortOrder)
              ? Math.max(0, Number(item.sortOrder))
              : existingCount + index,
          })),
        });

        count += items.length;
      }

      return count;
    });

    return NextResponse.json({
      success: true,
      saved,
      products: products.length,
      replaceExisting,
    });
  } catch (error) {
    console.error("BULK_PRODUCT_IMAGE_UPLOAD_ERROR", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to save product images.",
      },
      { status: 500 }
    );
  }
}
