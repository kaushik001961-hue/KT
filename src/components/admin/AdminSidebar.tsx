"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  ChevronRight,
  FileCheck2,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ReceiptText,
  X,
} from "lucide-react";
import { useState } from "react";

import AdminThemeToggle from "@/components/admin/AdminThemeToggle";

const navigation = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Import Products",
    href: "/admin/products/import",
    icon: ArrowDownToLine,
  },
  {
    label: "Export Products",
    href: "/admin/products/export",
    icon: ArrowUpFromLine,
  },
 
  {
    label: "Enquiries",
    href: "/admin/enquiries",
    icon: FileText,
  },
  {
    label: "RFQs",
    href: "/admin/rfqs",
    icon: ReceiptText,
  },
  {
    label: "Quotations",
    href: "/admin/quotations",
    icon: FileCheck2,
  },
  {
    label: "Blog",
    href: "/admin/blog",
    icon: FileText,
  },

   {
    label: "Categories",
    href: "/admin/categories",
    icon: Boxes,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/admin/dashboard") {
      return pathname === href;
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  return (
    <>
      {/* =====================================================
          MOBILE TOP BAR
      ===================================================== */}

      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 shadow-sm backdrop-blur-xl lg:hidden">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-3"
          onClick={() => setMobileOpen(false)}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-black text-white">
            KT
          </div>

          <div>
            <div className="text-sm font-black text-[var(--foreground)]">
              KRUPALI TRADERS
            </div>

            <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">
              Admin Panel
            </div>
          </div>
        </Link>

        <button
          type="button"
          onClick={() =>
            setMobileOpen((value) => !value)
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground)]"
          aria-label="Toggle admin menu"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 flex w-[min(18rem,88vw)] flex-col border-r border-[var(--border)] bg-[var(--surface)] shadow-xl shadow-blue-950/5 transition-transform duration-300 lg:w-72 lg:translate-x-0 ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* =================================================
            LOGO
        ================================================= */}

        <div className="border-b border-[var(--border)] p-6">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3"
            onClick={() => setMobileOpen(false)}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-lg font-black text-white shadow-lg shadow-blue-600/20">
              KT
            </div>

            <div className="min-w-0">
              <div className="truncate text-sm font-black text-[var(--foreground)]">
                KRUPALI TRADERS
              </div>

              <div className="mt-0.5 text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                Private Limited
              </div>

              <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-[var(--foreground)]/40">
                Admin Panel
              </div>
            </div>
          </Link>
        </div>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="flex-1 overflow-y-auto p-4">
          <p className="px-3 pb-3 pt-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--foreground)]/40">
            Management
          </p>

          <div className="space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                    active
                      ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-600/20"
                      : "text-[var(--foreground)]/65 hover:bg-blue-500/10 hover:text-blue-600"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />

                  <span className="flex-1">
                    {item.label}
                  </span>

                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${
                      active
                        ? "opacity-100"
                        : "opacity-0 group-hover:translate-x-1 group-hover:opacity-100"
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          {/* =================================================
              DIVIDER
          ================================================= */}

          <div className="my-6 h-px bg-[var(--border)]" />

          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <p className="px-3 pb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--foreground)]/40">
            Quick Actions
          </p>

          <div className="space-y-2">
            <Link
              href="/admin/products/import/new"
              onClick={() =>
                setMobileOpen(false)
              }
              className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-blue-500 hover:text-blue-600"
            >
              <Package className="h-5 w-5 text-blue-600" />

              Add Import Product
            </Link>

            <Link
              href="/admin/products/export/new"
              onClick={() =>
                setMobileOpen(false)
              }
              className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-blue-500 hover:text-blue-600"
            >
              <Package className="h-5 w-5 text-cyan-600" />

              Add Export Product
            </Link>

            <Link
              href="/admin/blog"
              onClick={() =>
                setMobileOpen(false)
              }
              className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-blue-500 hover:text-blue-600"
            >
              <FileText className="h-5 w-5 text-blue-600" />

              Manage Blog
            </Link>
          </div>
        </nav>

        {/* =================================================
            BOTTOM CONTROLS
        ================================================= */}

        <div className="border-t border-[var(--border)] p-4">
          <div className="mb-3 flex items-center justify-between rounded-2xl bg-[var(--surface-soft)] p-2">
            <span className="px-2 text-xs font-semibold text-[var(--foreground)]/60">
              Appearance
            </span>

            <AdminThemeToggle />
          </div>

          <form
            action="/api/admin/logout"
            method="POST"
          >
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--foreground)]/65 transition hover:bg-red-500/10 hover:text-red-600"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
