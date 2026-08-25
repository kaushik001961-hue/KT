
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Globe2,
  Package,
  ShieldCheck,
} from "lucide-react";

import { notFound } from "next/navigation";
import ShareProductButton from "@/components/products/ShareProductButton";

import { prisma } from "@/lib/prisma";

import ProductGallery from "@/components/products/ProductGallery";
import ProductEnquiryForm from "@/components/products/ProductEnquiryForm";
import RequestQuoteForm from "@/components/products/RequestQuoteForm";

type PageProps = {
  params: Promise<{
    type: string;
    slug: string;
  }>;
};

export default async function ProductDetailPage({
  params,
}: PageProps) {
  const { type: typeParam, slug } = await params;

  const type =
    typeParam.toUpperCase() === "IMPORT"
      ? "IMPORT"
      : typeParam.toUpperCase() === "EXPORT"
        ? "EXPORT"
        : null;

  if (!type) {
    notFound();
  }

  const product = await prisma.product.findFirst({
    where: {
      slug,
      type,
      status: "PUBLISHED",
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
    notFound();
  }

  const typeLabel =
    product.type === "IMPORT"
      ? "Import Product"
      : "Export Product";

  return (
    <main className="gradient-section min-h-0 overflow-hidden">

      {/* =====================================================
          HERO / PRODUCT HEADER
      ===================================================== */}

      <section className="relative overflow-hidden px-5 pb-14 pt-28 sm:pb-16 sm:pt-32 lg:px-8">

        {/* Decorative gradients */}

        <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-[#2d7dd2]/10 blur-3xl" />

        <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-[#c9a24d]/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl">

          {/* BACK */}

          <Link
            href={`/products/${product.type.toLowerCase()}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]/60 transition hover:text-[#1455a0] dark:hover:text-[#68b0ff]"
          >
            <ArrowLeft size={17} />

            Back to{" "}

            {product.type === "IMPORT"
              ? "Import Products"
              : "Export Products"}
          </Link>

          {/* HEADER */}

          <div className="mx-auto mt-10 max-w-4xl text-center sm:mt-12">

            <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#c9a24d] dark:text-[#d8b45b]">
              {typeLabel}
            </div>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
              {product.name}
            </h1>

            {product.shortDescription && (
              <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-[var(--foreground)]/65 sm:text-lg">
                {product.shortDescription}
              </p>
            )}

            {product.featured && (
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#c9a24d]/30 bg-[#c9a24d]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#a17b2d] dark:text-[#d8b45b]">
                <CheckCircle2 className="h-4 w-4" />
                Featured Product
              </div>
            )}

          </div>

        </div>

      </section>

      {/* =====================================================
          PRODUCT CONTENT
      ===================================================== */}

      <section className="px-5 pb-20 sm:pb-24 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">

            {/* =================================================
                PRODUCT GALLERY
            ================================================= */}

            <div>
              <ProductGallery
                images={product.images}
                productName={product.name}
                productType={product.type}
              />
            </div>

            {/* =================================================
                INFORMATION
            ================================================= */}

            <div>

              {product.category && (
                <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#c9a24d] dark:text-[#d8b45b]">
                  {product.category.name}
                </div>
              )}

              <h2 className="mt-4 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
                Product Information
              </h2>

              {product.description && (
                <p className="mt-5 text-base leading-8 text-[var(--foreground)]/65">
                  {product.description}
                </p>
              )}

              {/* =================================================
                  DETAILS
              ================================================= */}

              <div className="mt-8 grid gap-3">

                {product.countryOfOrigin && (
                  <InfoRow
                    icon={<Globe2 size={19} />}
                    label="Country of Origin"
                    value={product.countryOfOrigin}
                  />
                )}

                {product.packaging && (
                  <InfoRow
                    icon={<Package size={19} />}
                    label="Packaging"
                    value={product.packaging}
                  />
                )}

                {product.minimumOrderQuantity && (
                  <InfoRow
                    icon={<CheckCircle2 size={19} />}
                    label="Minimum Order Quantity"
                    value={product.minimumOrderQuantity}
                  />
                )}

              </div>

              {/* =================================================
                  SPECIFICATIONS
              ================================================= */}

              {product.specifications && (
                <div className="gradient-card gradient-border mt-8 rounded-3xl p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[#1455a0] dark:text-[#68b0ff]">
                      <ShieldCheck size={20} />
                    </div>

                    <h3 className="font-bold text-[var(--foreground)]">
                      Specifications
                    </h3>

                  </div>

                  <div className="mt-5 whitespace-pre-line text-sm leading-7 text-[var(--foreground)]/65">
                    {product.specifications}
                  </div>

                </div>
              )}

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          PRODUCT ENQUIRY + RFQ
      ===================================================== */}

      <section className="px-5 pb-24 sm:pb-28 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl sm:p-8 lg:p-10">

            {/* Decorative glow */}

            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#1455a0]/10 blur-3xl" />

            <div className="relative">

              {/* =================================================
                  SECTION HEADER
              ================================================= */}

              <div className="mx-auto max-w-4xl text-center">

                <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#c9a24d] dark:text-[#d8b45b]">
                  Product Enquiry & Quote
                </div>

                <h2 className="mt-4 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
                  Interested in {product.name}?
                </h2>

                <p className="mx-auto mt-4 max-w-2xl text-[var(--foreground)]/65">
                  Choose the option that best matches your requirement.
                  You can send a quick enquiry or request a detailed quote.
                </p>

              </div>

              {/* =================================================
                  ACTION BUTTONS
              ================================================= */}

              <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-3 sm:flex-row sm:justify-center">

                <a
                  href="#product-enquiry"
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-[#1455a0]/30 bg-[#1455a0]/5 px-6 py-3.5 text-sm font-bold text-[#1455a0] transition hover:-translate-y-0.5 hover:bg-[#1455a0]/10 dark:border-[#68b0ff]/30 dark:bg-[#68b0ff]/5 dark:text-[#68b0ff] dark:hover:bg-[#68b0ff]/10"
                >
                  Send Product Enquiry
                </a>

                <a
                  href="#request-quote"
                  className="inline-flex flex-1 items-center justify-center rounded-full bg-[#1455a0] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#1455a0]/20 transition hover:-translate-y-0.5 hover:bg-[#0f4688] dark:bg-[#1d68b8] dark:hover:bg-[#2678ca]"
                >
                  Request a Quote
                </a>

                <ShareProductButton
                  productName={product.name}
                  productType={product.type}
                  productDescription={
                    product.shortDescription ||
                    product.description ||
                    ""
                  }
                />

              </div>

              {/* =================================================
                  QUICK ENQUIRY
              ================================================= */}

              <div
                id="product-enquiry"
                className="mt-12 scroll-mt-28 border-t border-[var(--border)] pt-10"
              >

                <div className="mx-auto max-w-4xl text-center">

                  <h3 className="text-2xl font-bold text-[var(--foreground)]">
                    Send a Product Enquiry
                  </h3>

                  <p className="mx-auto mt-2 max-w-2xl text-sm text-[var(--foreground)]/60">
                    For a quick enquiry, provide your contact details
                    and requirements below.
                  </p>

                </div>

                <ProductEnquiryForm
                  productName={product.name}
                  productType={product.type}
                />

              </div>

              {/* =================================================
                  REQUEST FOR QUOTE
              ================================================= */}

              <div
                id="request-quote"
                className="mt-14 scroll-mt-28 border-t border-[var(--border)] pt-10"
              >

                <div className="mx-auto max-w-4xl text-center">

                  <h3 className="text-2xl font-bold text-[var(--foreground)]">
                    Request a Detailed Quote
                  </h3>

                  <p className="mx-auto mt-2 max-w-2xl text-sm text-[var(--foreground)]/60">
                    Provide your quantity, destination, packaging and
                    delivery requirements so our team can prepare a
                    suitable quotation.
                  </p>

                </div>

                <RequestQuoteForm
                  productId={product.id}
                  productName={product.name}
                  productType={product.type}
                />

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="group flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[#1455a0]/30 hover:shadow-md dark:hover:border-[#68b0ff]/30">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[#1455a0] transition duration-300 group-hover:scale-105 dark:text-[#68b0ff]">
        {icon}
      </div>

      <div className="min-w-0">

        <div className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--foreground)]/45">
          {label}
        </div>

        <div className="mt-1 break-words font-semibold text-[var(--foreground)]">
          {value}
        </div>

      </div>

    </div>
  );
}
