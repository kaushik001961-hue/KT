import { notFound, redirect } from "next/navigation";

import ProductForm from "@/components/admin/products/ProductForm";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type EditExportProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditExportProductPage({
  params,
}: EditExportProductPageProps) {
  const admin = await getAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    }),

    prisma.category.findMany({
      where: {
        type: "EXPORT",
        active: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  if (!product) {
    notFound();
  }

  if (product.type !== "EXPORT") {
    redirect("/admin/products/export");
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <ProductForm
          type="EXPORT"
          categories={categories}
          product={product}
        />
      </div>
    </main>
  );
}