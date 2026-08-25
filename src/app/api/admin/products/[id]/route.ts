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

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  context: RouteContext
) {
  const admin = await getAdminSession();

  if (!admin) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await context.params;

    const product =
      await prisma.product.findUnique({
        where: {
          id,
        },
        include: {
          category: true,
          images: {
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      });

    if (!product) {
      return NextResponse.json(
        {
          message:
            "Product not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(
      "PRODUCT_GET_ERROR",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to load product.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: RouteContext
) {
  const admin = await getAdminSession();

  if (!admin) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing =
      await prisma.product.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          message:
            "Product not found.",
        },
        { status: 404 }
      );
    }

    const name = String(
      body.name ?? existing.name
    ).trim();

    const slug = slugify(
      String(
        body.slug ?? existing.slug
      )
    );

    const type =
      body.type ?? existing.type;

    const status =
      body.status ?? existing.status;

    const categoryId =
      body.categoryId !== undefined
        ? body.categoryId
          ? String(body.categoryId)
          : null
        : existing.categoryId;

    const featured =
      body.featured !== undefined
        ? Boolean(body.featured)
        : existing.featured;

    if (!name || !slug) {
      return NextResponse.json(
        {
          message:
            "Product name and slug are required.",
        },
        { status: 400 }
      );
    }

    if (
      type !== "IMPORT" &&
      type !== "EXPORT"
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid product type.",
        },
        { status: 400 }
      );
    }

    if (
      status !== "DRAFT" &&
      status !== "PUBLISHED" &&
      status !== "ARCHIVED"
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid product status.",
        },
        { status: 400 }
      );
    }

    const duplicate =
      await prisma.product.findFirst({
        where: {
          slug,
          type,
          NOT: {
            id,
          },
        },
      });

    if (duplicate) {
      return NextResponse.json(
        {
          message:
            "Another product already uses this slug.",
        },
        { status: 409 }
      );
    }

    if (categoryId) {
      const category =
        await prisma.category.findUnique({
          where: {
            id: categoryId,
          },
        });

      if (!category) {
        return NextResponse.json(
          {
            message:
              "Selected category was not found.",
          },
          { status: 400 }
        );
      }

      if (category.type !== type) {
        return NextResponse.json(
          {
            message:
              "Selected category does not match the product type.",
          },
          { status: 400 }
        );
      }

      if (!category.active) {
        return NextResponse.json(
          {
            message:
              "Selected category is inactive.",
          },
          { status: 400 }
        );
      }
    }

    const rawImages = Array.isArray(body.images)
      ? body.images
      : null;

    const product =
      await prisma.$transaction(
        async (tx) => {
          if (rawImages !== null) {
            await tx.productImage.deleteMany({
              where: {
                productId: id,
              },
            });
          }

          return tx.product.update({
            where: {
              id,
            },

            data: {
              name,
              slug,
              type,
              status,

              shortDescription:
                body.shortDescription !==
                undefined
                  ? String(
                      body.shortDescription ||
                        ""
                    ).trim() || null
                  : existing.shortDescription,

              description:
                body.description !==
                undefined
                  ? String(
                      body.description || ""
                    ).trim() || null
                  : existing.description,

              specifications:
                body.specifications !==
                undefined
                  ? String(
                      body.specifications ||
                        ""
                    ).trim() || null
                  : existing.specifications,

              countryOfOrigin:
                body.countryOfOrigin !==
                undefined
                  ? String(
                      body.countryOfOrigin ||
                        ""
                    ).trim() || null
                  : existing.countryOfOrigin,

              packaging:
                body.packaging !==
                undefined
                  ? String(
                      body.packaging || ""
                    ).trim() || null
                  : existing.packaging,

              minimumOrderQuantity:
                body.minimumOrderQuantity !==
                undefined
                  ? String(
                      body.minimumOrderQuantity ||
                        ""
                    ).trim() || null
                  : existing.minimumOrderQuantity,

              featured,
              categoryId,

              ...(rawImages !== null
                ? {
                    images: {
                      create: rawImages
                        .map(
                          (
                            image: {
                              url?: unknown;
                              alt?: unknown;
                              sortOrder?: unknown;
                            },
                            index: number
                          ) => ({
                            url: String(
                              image.url ||
                                ""
                            ).trim(),

                            alt:
                              String(
                                image.alt ||
                                  ""
                              ).trim() ||
                              null,

                            sortOrder:
                              Number.isFinite(
                                Number(
                                  image.sortOrder
                                )
                              )
                                ? Number(
                                    image.sortOrder
                                  )
                                : index,
                          })
                        )
                        .filter(
                          (image: {
                            url: string;
                          }) =>
                            Boolean(
                              image.url
                            )
                        ),
                    },
                  }
                : {}),
            },

            include: {
              category: true,
              images: {
                orderBy: {
                  sortOrder: "asc",
                },
              },
            },
          });
        }
      );

    return NextResponse.json({
      success: true,
      message:
        "Product updated successfully.",
      product,
    });
  } catch (error) {
    console.error(
      "PRODUCT_UPDATE_ERROR",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to update product.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  const admin = await getAdminSession();

  if (!admin) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await context.params;

    const product =
      await prisma.product.findUnique({
        where: {
          id,
        },
      });

    if (!product) {
      return NextResponse.json(
        {
          message:
            "Product not found.",
        },
        { status: 404 }
      );
    }

    await prisma.product.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Product deleted successfully.",
    });
  } catch (error) {
    console.error(
      "PRODUCT_DELETE_ERROR",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to delete product.",
      },
      { status: 500 }
    );
  }
}