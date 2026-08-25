import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpFromLine,
  Boxes,
  FileCheck2,
  FileText,
  Globe2,
  LogOut,
  Mail,
  Package,
  ReceiptText,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

type AnalyticsCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
};

export default async function AdminDashboardPage() {
  const admin = await getAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  const [
    totalProducts,
    importProducts,
    exportProducts,
    publishedProducts,
    draftProducts,
    newEnquiries,

    totalRfqs,
    publishedBlogPosts,

    totalQuotations,
  ] = await Promise.all([
    /* =====================================================
       PRODUCTS
    ===================================================== */

    prisma.product.count(),

    prisma.product.count({
      where: {
        type: "IMPORT",
      },
    }),

    prisma.product.count({
      where: {
        type: "EXPORT",
      },
    }),

    prisma.product.count({
      where: {
        status: "PUBLISHED",
      },
    }),

    prisma.product.count({
      where: {
        status: "DRAFT",
      },
    }),

    /* =====================================================
       ENQUIRIES
    ===================================================== */

    prisma.enquiry.count({
      where: {
        status: "NEW",
      },
    }),

    /* =====================================================
       RFQS
    ===================================================== */

    prisma.rFQ.count(),

    /* =====================================================
       BLOG
    ===================================================== */

    prisma.blogPost.count({
      where: {
        status: "PUBLISHED",
      },
    }),

    /* =====================================================
       QUOTATIONS
    ===================================================== */

    prisma.quotation.count(),

  ]);

  /* =======================================================
     QUOTATION CONVERSION RATE
  ======================================================= */

  /* =======================================================
     MONEY FORMATTER
  ======================================================= */

  function formatMoney(
    value: number,
    currency: string
  ) {
    try {
      return new Intl.NumberFormat(
        "en-US",
        {
          style: "currency",
          currency,
          maximumFractionDigits: 2,
        }
      ).format(value);
    } catch {
      return `${currency} ${value.toLocaleString()}`;
    }
  }

  /* =======================================================
     DATE FORMATTER
  ======================================================= */

  function formatDate(
    value: Date
  ) {
    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    ).format(value);
  }

  /* =======================================================
     QUOTATION STATUS STYLES
  ======================================================= */

  const quotationStatusStyles: Record<
    string,
    string
  > = {
    DRAFT:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400",

    SENT:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400",

    ACCEPTED:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",

    REJECTED:
      "bg-red-500/10 text-red-600 dark:text-red-400",

    EXPIRED:
      "bg-gray-500/10 text-gray-600 dark:text-gray-400",

    CANCELLED:
      "bg-red-500/10 text-red-600 dark:text-red-400",
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] transition-colors duration-300 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)]/90 p-5 shadow-xl shadow-blue-950/5 backdrop-blur-xl sm:p-7 lg:p-8">

          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-600/20">
                  <Package className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-600">
                    Krupali Traders
                  </p>

                  <p className="text-xs font-semibold text-[var(--foreground)]/45">
                    Private Limited
                  </p>
                </div>

              </div>

              <h1 className="mt-6 text-3xl font-black tracking-tight sm:text-4xl">
                Admin Dashboard
              </h1>

              <p className="mt-2 text-sm text-[var(--foreground)]/55 sm:text-base">
                Welcome back{" "}
                <span className="font-semibold text-[var(--foreground)]">
                  {admin.name}
                </span>
              </p>

            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">

              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-5 text-sm font-bold text-blue-600 transition duration-300 hover:-translate-y-0.5 hover:border-blue-600 hover:bg-blue-600 hover:text-white sm:w-auto"
              >
                <Globe2 className="h-4 w-4" />
                View Website
              </Link>

              <form
                action="/api/admin/logout"
                method="POST"
                className="w-full sm:w-auto"
              >
                <button
                  type="submit"
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-5 text-sm font-bold text-[var(--foreground)] transition duration-300 hover:-translate-y-0.5 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-600 sm:w-auto"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </form>

            </div>

          </div>

        </header>

        {/* =====================================================
            BUSINESS OVERVIEW
        ===================================================== */}

        <section className="mt-8 sm:mt-10">

          {/* HEADER */}

          <div className="relative px-2 pb-7 sm:px-3 sm:pb-8">

            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-600">
                  Management Center
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                  Business Overview
                </h2>

                <p className="mt-2 text-sm text-[var(--foreground)]/50">
                  Manage your business from one place.
                </p>
              </div>

              <Link
                href="/admin/quotations"
                className="group inline-flex w-fit items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2.5 text-xs font-black text-blue-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500 hover:bg-blue-600 hover:text-white"
              >
                View Reports
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

            </div>
          </div>

          {/* ROUNDED STAT CARDS */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {/* IMPORT */}

            <Link
              href="/admin/products/import"
              className="group relative min-h-[190px] overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:bg-blue-500/[0.05] hover:shadow-xl hover:shadow-blue-500/10 dark:hover:bg-blue-500/[0.09]"
            >
              <div className="absolute inset-x-6 top-0 h-1 rounded-b-full bg-blue-500 transition-all group-hover:inset-x-4" />

              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white">
                  <ArrowDownToLine className="h-5 w-5" />
                </div>

                <span className="text-4xl font-black tracking-tight text-blue-600">
                  {importProducts}
                </span>
              </div>

              <h3 className="mt-5 text-base font-black">
                Import Products
              </h3>

              <p className="mt-1 text-sm text-[var(--foreground)]/45">
                Products sourced internationally
              </p>

              <div className="mt-5 flex items-center justify-between text-xs font-black text-blue-600">
                <span>Manage Imports</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 transition-all group-hover:translate-x-1 group-hover:bg-blue-600 group-hover:text-white">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>

            {/* EXPORT */}

            <Link
              href="/admin/products/export"
              className="group relative min-h-[190px] overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:bg-emerald-500/[0.05] hover:shadow-xl hover:shadow-emerald-500/10 dark:hover:bg-emerald-500/[0.09]"
            >
              <div className="absolute inset-x-6 top-0 h-1 rounded-b-full bg-emerald-500 transition-all group-hover:inset-x-4" />

              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white">
                  <ArrowUpFromLine className="h-5 w-5" />
                </div>

                <span className="text-4xl font-black tracking-tight text-emerald-600">
                  {exportProducts}
                </span>
              </div>

              <h3 className="mt-5 text-base font-black">
                Export Products
              </h3>

              <p className="mt-1 text-sm text-[var(--foreground)]/45">
                Products available for export
              </p>

              <div className="mt-5 flex items-center justify-between text-xs font-black text-emerald-600">
                <span>Manage Exports</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 transition-all group-hover:translate-x-1 group-hover:bg-emerald-600 group-hover:text-white">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>

            {/* ENQUIRIES */}

            <Link
              href="/admin/enquiries"
              className="group relative min-h-[190px] overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/30 hover:bg-amber-500/[0.05] hover:shadow-xl hover:shadow-amber-500/10 dark:hover:bg-amber-500/[0.09]"
            >
              <div className="absolute inset-x-6 top-0 h-1 rounded-b-full bg-amber-500 transition-all group-hover:inset-x-4" />

              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 transition-all duration-300 group-hover:bg-amber-600 group-hover:text-white">
                  <Mail className="h-5 w-5" />
                </div>

                <span className="text-4xl font-black tracking-tight text-amber-600">
                  {newEnquiries}
                </span>
              </div>

              <h3 className="mt-5 text-base font-black">
                Enquiries
              </h3>

              <p className="mt-1 text-sm text-[var(--foreground)]/45">
                New customer enquiries
              </p>

              <div className="mt-5 flex items-center justify-between text-xs font-black text-amber-600">
                <span>Manage Enquiries</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 transition-all group-hover:translate-x-1 group-hover:bg-amber-600 group-hover:text-white">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>

            {/* RFQS */}

            <Link
              href="/admin/rfqs"
              className="group relative min-h-[190px] overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:bg-violet-500/[0.05] hover:shadow-xl hover:shadow-violet-500/10 dark:hover:bg-violet-500/[0.09]"
            >
              <div className="absolute inset-x-6 top-0 h-1 rounded-b-full bg-violet-500 transition-all group-hover:inset-x-4" />

              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 transition-all duration-300 group-hover:bg-violet-600 group-hover:text-white">
                  <ReceiptText className="h-5 w-5" />
                </div>

                <span className="text-4xl font-black tracking-tight text-violet-600">
                  {totalRfqs}
                </span>
              </div>

              <h3 className="mt-5 text-base font-black">
                RFQs
              </h3>

              <p className="mt-1 text-sm text-[var(--foreground)]/45">
                Requests for quotation
              </p>

              <div className="mt-5 flex items-center justify-between text-xs font-black text-violet-600">
                <span>Manage RFQs</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/10 transition-all group-hover:translate-x-1 group-hover:bg-violet-600 group-hover:text-white">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>

            {/* QUOTATIONS */}

            <Link
              href="/admin/quotations"
              className="group relative min-h-[190px] overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/30 hover:bg-cyan-500/[0.05] hover:shadow-xl hover:shadow-cyan-500/10 dark:hover:bg-cyan-500/[0.09]"
            >
              <div className="absolute inset-x-6 top-0 h-1 rounded-b-full bg-cyan-500 transition-all group-hover:inset-x-4" />

              <div className="flex items-start justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 transition-all duration-300 group-hover:bg-cyan-600 group-hover:text-white">
                    <FileCheck2 className="h-6 w-6" />
                  </div>

                  <div>
                    <h3 className="text-xl font-black">
                      Quotations
                    </h3>

                    <p className="mt-1 text-xs text-[var(--foreground)]/45">
                      Buyer quotation management
                    </p>
                  </div>
                </div>

                <span className="text-4xl font-black tracking-tight text-cyan-600">
                  {totalQuotations}
                </span>
              </div>

              <div className="mt-8 flex items-center justify-between text-sm font-black text-cyan-600">
                <span>Manage Quotations</span>

                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/10 transition-all group-hover:translate-x-1 group-hover:bg-cyan-600 group-hover:text-white">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>

            {/* BLOG */}

            <Link
              href="/admin/blog"
              className="group relative min-h-[190px] overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-pink-500/30 hover:bg-pink-500/[0.05] hover:shadow-xl hover:shadow-pink-500/10 dark:hover:bg-pink-500/[0.09]"
            >
              <div className="absolute inset-x-6 top-0 h-1 rounded-b-full bg-pink-500 transition-all group-hover:inset-x-4" />

              <div className="flex items-start justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-600 transition-all duration-300 group-hover:bg-pink-600 group-hover:text-white">
                    <FileText className="h-6 w-6" />
                  </div>

                  <div>
                    <h3 className="text-xl font-black">
                      Blog
                    </h3>

                    <p className="mt-1 text-xs text-[var(--foreground)]/45">
                      Articles & trade insights
                    </p>
                  </div>
                </div>

                <span className="text-4xl font-black tracking-tight text-pink-600">
                  {publishedBlogPosts}
                </span>
              </div>

              <div className="mt-8 flex items-center justify-between text-sm font-black text-pink-600">
                <span>Manage Blog</span>

                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-500/10 transition-all group-hover:translate-x-1 group-hover:bg-pink-600 group-hover:text-white">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>

          </div>
        </section>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <section className="mt-6 rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)]/70 px-5 py-4 shadow-sm sm:mt-8 sm:px-6">

          <div className="flex flex-col gap-2 text-xs text-[var(--foreground)]/45 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Admin system active
            </div>

            <div>
              Krupali Traders Private Limited
            </div>

          </div>

        </section>

      </div>
    </main>
  );
}

/* =========================================================
   ANALYTICS CARD
========================================================= */

function AnalyticsCard({
  title,
  value,
  description,
  icon: Icon,
}: AnalyticsCardProps) {
  return (
    <div className="group rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 transition hover:-translate-y-0.5 hover:border-blue-500/25 hover:shadow-md">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">

          <p className="truncate text-xs font-bold text-[var(--foreground)]/55">
            {title}
          </p>

          <p className="mt-0.5 text-2xl font-black tracking-tight">
            {value}
          </p>

          <p className="mt-1 text-[10px] text-[var(--foreground)]/40">
            {description}
          </p>

        </div>

      </div>

    </div>
  );
}