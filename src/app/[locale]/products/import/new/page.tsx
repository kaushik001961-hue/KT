import { redirect } from "next/navigation";

import ProductForm from "@/components/admin/products/ProductForm";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export default async function NewImportProductPage() {
  const admin = await getAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  const categories = await prisma.category.findMany({
    where: {
      type: "IMPORT",
      active: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <ProductForm
          type="IMPORT"
          categories={categories}
        />
      </div>
    </main>
  );
}