import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const categories = await prisma.category.findMany({
    where: {
      active: true,
    },
    orderBy: [
      {
        type: "asc",
      },
      {
        name: "asc",
      },
    ],
  });

  const importCategories = categories.filter(
    (category) => category.type === "IMPORT"
  );

  const exportCategories = categories.filter(
    (category) => category.type === "EXPORT"
  );

  return (
    <main className="min-h-screen bg-[var(--background)] pb-24 pt-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <section className="mx-auto mb-16 max-w-3xl text-center">
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#c9a24d]">
            Krupali Traders Private Limited
          </div>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
            Our Products
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[var(--foreground)]/60 sm:text-lg">
            Explore our carefully selected range of import and
            export products across multiple categories.
          </p>
        </section>

        {/* =====================================================
            IMPORT PRODUCTS
        ===================================================== */}

        <section className="mb-20">

          <div className="mb-8">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#c9a24d]">
              International Sourcing
            </div>

            <h2 className="mt-2 text-3xl font-bold text-[var(--foreground)]">
              Import Products
            </h2>

            <p className="mt-2 text-sm text-[var(--foreground)]/55">
              Explore products sourced from international markets.
            </p>
          </div>

          {importCategories.length === 0 ? (
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center">
              <p className="text-[var(--foreground)]/60">
                Currently no product available for this category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {importCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products/import?categoryId=${encodeURIComponent(
                    category.id
                  )}`}
                  className="group overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  {/* IMAGE */}

                  <div className="relative h-56 overflow-hidden bg-[var(--primary-light)]">

                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-5xl font-bold text-[var(--primary)]/20">
                          {category.name
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

                    <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#c9a24d] backdrop-blur">
                      Import
                    </div>
                  </div>

                  {/* CONTENT */}

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[var(--foreground)] transition group-hover:text-[var(--primary)]">
                      {category.name}
                    </h3>

                    {category.description && (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--foreground)]/55">
                        {category.description}
                      </p>
                    )}

                    <div className="mt-5 text-sm font-bold text-[var(--primary)]">
                      Explore Products →
                    </div>
                  </div>
                </Link>
              ))}

            </div>
          )}
        </section>

        {/* =====================================================
            EXPORT PRODUCTS
        ===================================================== */}

        <section>

          <div className="mb-8">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#1455a0]">
              Global Markets
            </div>

            <h2 className="mt-2 text-3xl font-bold text-[var(--foreground)]">
              Export Products
            </h2>

            <p className="mt-2 text-sm text-[var(--foreground)]/55">
              Explore products supplied to markets worldwide.
            </p>
          </div>

          {exportCategories.length === 0 ? (
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center">
              <p className="text-[var(--foreground)]/60">
                Currently no product available for this category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {exportCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products/export?categoryId=${encodeURIComponent(
                    category.id
                  )}`}
                  className="group overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  {/* IMAGE */}

                  <div className="relative h-56 overflow-hidden bg-[var(--primary-light)]">

                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-5xl font-bold text-[var(--primary)]/20">
                          {category.name
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

                    <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#1455a0] backdrop-blur">
                      Export
                    </div>
                  </div>

                  {/* CONTENT */}

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[var(--foreground)] transition group-hover:text-[var(--primary)]">
                      {category.name}
                    </h3>

                    {category.description && (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--foreground)]/55">
                        {category.description}
                      </p>
                    )}

                    <div className="mt-5 text-sm font-bold text-[var(--primary)]">
                      Explore Products →
                    </div>
                  </div>
                </Link>
              ))}

            </div>
          )}
        </section>

      </div>
    </main>
  );
}