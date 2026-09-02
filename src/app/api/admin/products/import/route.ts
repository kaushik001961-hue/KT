import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type ImportImage = {
  url?: unknown;
  alt?: unknown;
  sortOrder?: unknown;
};

type ImportProduct = {
  name?: unknown;
  slug?: unknown;
  type?: unknown;
  status?: unknown;

  shortDescription?: unknown;
  description?: unknown;
  specifications?: unknown;
  countryOfOrigin?: unknown;
  packaging?: unknown;
  minimumOrderQuantity?: unknown;

  featured?: unknown;

  category?: unknown;
  categoryId?: unknown;

  images?: unknown;
};

export async function POST(request: Request) {
  const admin = await getAdminSession();

  if (!admin) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    if (!Array.isArray(body.products)) {
      return NextResponse.json(
        {
          message:
            "Invalid request. 'products' must be an array.",
        },
        { status: 400 }
      );
    }

    const products = body.products as ImportProduct[];

    if (products.length === 0) {
      return NextResponse.json(
        {
          message: "No products supplied for import.",
        },
        { status: 400 }
      );
    }

    if (products.length > 500) {
      return NextResponse.json(
        {
          message:
            "Maximum 500 products can be imported at once.",
        },
        { status: 400 }
      );
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let failed = 0;

    const results: Array<{
      index: number;
      name?: string;
      status: "CREATED" | "UPDATED" | "SKIPPED" | "FAILED";
      message?: string;
    }> = [];

    for (let index = 0; index < products.length; index++) {
      const item = products[index];

      try {
        const name = String(item.name || "").trim();

        if (!name) {
          failed++;

          results.push({
            index,
            status: "FAILED",
            message: "Product name is required.",
          });

          continue;
        }

        // -----------------------------------------
        // PRODUCT TYPE
        // -----------------------------------------

        const type = item.type;

        if (
          type !== "IMPORT" &&
          type !== "EXPORT"
        ) {
          failed++;

          results.push({
            index,
            name,
            status: "FAILED",
            message:
              "Product type must be IMPORT or EXPORT.",
          });

          continue;
        }

        // -----------------------------------------
        // PRODUCT STATUS
        // -----------------------------------------

        const status =
          item.status || "DRAFT";

        if (
          status !== "DRAFT" &&
          status !== "PUBLISHED" &&
          status !== "ARCHIVED"
        ) {
          failed++;

          results.push({
            index,
            name,
            status: "FAILED",
            message:
              "Invalid product status.",
          });

          continue;
        }

        // -----------------------------------------
        // SLUG
        // -----------------------------------------

        const slug = slugify(
          String(item.slug || name)
        );

        if (!slug) {
          failed++;

          results.push({
            index,
            name,
            status: "FAILED",
            message:
              "Unable to generate product slug.",
          });

          continue;
        }

        // -----------------------------------------
        // CATEGORY
        // -----------------------------------------

        let categoryId: string | null = null;

        if (item.categoryId) {
          categoryId =
            String(item.categoryId);
        } else if (item.category) {
          const categoryName =
            String(item.category).trim();

          if (categoryName) {
            const categorySlug =
              slugify(categoryName);

            const category =
              await prisma.category.upsert({
                where: {
                  slug_type: {
                    slug: categorySlug,
                    type,
                  },
                },

                update: {
                  name: categoryName,
                  active: true,
                },

                create: {
                  name: categoryName,
                  slug: categorySlug,
                  type,
                  active: true,
                },
              });

            categoryId = category.id;
          }
        }

        // -----------------------------------------
        // CATEGORY VALIDATION
        // -----------------------------------------

        if (categoryId) {
          const category =
            await prisma.category.findUnique({
              where: {
                id: categoryId,
              },
            });

          if (!category) {
            failed++;

            results.push({
              index,
              name,
              status: "FAILED",
              message:
                "Category was not found.",
            });

            continue;
          }

          if (category.type !== type) {
            failed++;

            results.push({
              index,
              name,
              status: "FAILED",
              message:
                "Category type does not match product type.",
            });

            continue;
          }

          if (!category.active) {
            failed++;

            results.push({
              index,
              name,
              status: "FAILED",
              message:
                "Category is inactive.",
            });

            continue;
          }
        }

        // -----------------------------------------
        // PRODUCT DATA
        // -----------------------------------------

        const shortDescription =
          String(
            item.shortDescription || ""
          ).trim() || null;

        const description =
          String(
            item.description || ""
          ).trim() || null;

        const specifications =
          String(
            item.specifications || ""
          ).trim() || null;

        const countryOfOrigin =
          String(
            item.countryOfOrigin || ""
          ).trim() || null;

        const packaging =
          String(
            item.packaging || ""
          ).trim() || null;

        const minimumOrderQuantity =
          String(
            item.minimumOrderQuantity || ""
          ).trim() || null;

        const featured =
          Boolean(item.featured);

        // -----------------------------------------
        // IMAGES
        // -----------------------------------------

        const rawImages = Array.isArray(
          item.images
        )
          ? (item.images as ImportImage[])
          : [];

        const images = rawImages
          .map((image, imageIndex) => ({
            url: String(
              image.url || ""
            ).trim(),

            alt:
              String(
                image.alt || ""
              ).trim() || name,

            sortOrder:
              Number.isFinite(
                Number(image.sortOrder)
              )
                ? Number(image.sortOrder)
                : imageIndex,
          }))
          .filter(
            (image) =>
              Boolean(image.url)
          );

        // -----------------------------------------
        // FIND EXISTING PRODUCT
        // -----------------------------------------

        const existing =
          await prisma.product.findUnique({
            where: {
              slug_type: {
                slug,
                type,
              },
            },
          });

        // -----------------------------------------
        // UPDATE EXISTING
        // -----------------------------------------

        if (existing) {
          await prisma.product.update({
            where: {
              id: existing.id,
            },

            data: {
              name,
              shortDescription,
              description,
              specifications,
              countryOfOrigin,
              packaging,
              minimumOrderQuantity,
              featured,
              status,
              categoryId,
            },
          });

          // Add imported images only if supplied
          if (images.length > 0) {
            await prisma.productImage.deleteMany({
              where: {
                productId: existing.id,
              },
            });

            await prisma.productImage.createMany({
              data: images.map(
                (image) => ({
                  productId:
                    existing.id,
                  url: image.url,
                  alt: image.alt,
                  sortOrder:
                    image.sortOrder,
                })
              ),
            });
          }

          updated++;

          results.push({
            index,
            name,
            status: "UPDATED",
            message:
              "Product already existed and was updated.",
          });

          continue;
        }

        // -----------------------------------------
        // CREATE PRODUCT
        // -----------------------------------------

        const product =
          await prisma.product.create({
            data: {
              name,
              slug,
              type,
              status,

              shortDescription,
              description,
              specifications,

              countryOfOrigin,
              packaging,
              minimumOrderQuantity,

              featured,
              categoryId,

              images: {
                create: images,
              },
            },
          });

        created++;

        results.push({
          index,
          name: product.name,
          status: "CREATED",
          message:
            "Product created successfully.",
        });
      } catch (error) {
        console.error(
          `PRODUCT_IMPORT_ITEM_ERROR_${index}`,
          error
        );

        failed++;

        results.push({
          index,
          name: String(
            item.name || ""
          ).trim(),

          status: "FAILED",

          message:
            "Unexpected error while importing product.",
        });
      }
    }

    skipped =
      products.length -
      created -
      updated -
      failed;

    return NextResponse.json({
      success: failed === 0,

      message:
        "Product import completed.",

      summary: {
        total: products.length,
        created,
        updated,
        skipped,
        failed,
      },

      results,
    });
  } catch (error) {
    console.error(
      "PRODUCT_BULK_IMPORT_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to import products.",
      },
      { status: 500 }
    );
  }
}