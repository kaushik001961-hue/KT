"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  ChevronDown,
  ArrowUpRight,
  Sun,
  Moon,
  LayoutDashboard,
} from "lucide-react";

import { useTheme } from "./ThemeProvider";

type NavbarProps = {
  isAdmin?: boolean;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  type: "IMPORT" | "EXPORT";
};

export default function Navbar({
  isAdmin = false,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);

  const [exportCategoriesOpen, setExportCategoriesOpen] =
    useState(false);

  const [importCategoriesOpen, setImportCategoriesOpen] =
    useState(false);

  const [showLogoIntro, setShowLogoIntro] = useState(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const { theme, toggleTheme } = useTheme();

  /* =====================================================
     LOGO INTRO
  ===================================================== */

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowLogoIntro(false);
    }, 1700);

    return () => window.clearTimeout(timer);
  }, []);

  /* =====================================================
     LOAD PUBLIC CATEGORIES
  ===================================================== */

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const response = await fetch("/api/categories", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load categories.");
        }

        const data = await response.json();

        if (!cancelled && data.success) {
          setCategories(
            Array.isArray(data.categories)
              ? data.categories
              : []
          );
        }
      } catch (error) {
        console.error(
          "NAVBAR_CATEGORY_LOAD_ERROR",
          error
        );

        if (!cancelled) {
          setCategories([]);
        }
      } finally {
        if (!cancelled) {
          setCategoriesLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =====================================================
     CATEGORY GROUPS
  ===================================================== */

  const importCategories = categories.filter(
    (category) => category.type === "IMPORT"
  );

  const exportCategories = categories.filter(
    (category) => category.type === "EXPORT"
  );

  /* =====================================================
     CLOSE MENUS
  ===================================================== */

  const closeMobile = () => {
    setMobileOpen(false);
    setProductsOpen(false);
    setExportCategoriesOpen(false);
    setImportCategoriesOpen(false);
  };

  /* =====================================================
     CLOSE PRODUCTS DROPDOWN
  ===================================================== */

  const closeProducts = () => {
    setProductsOpen(false);
    setExportCategoriesOpen(false);
    setImportCategoriesOpen(false);
  };

  return (
    <LayoutGroup>

      {/* =====================================================
          LOGO INTRO ANIMATION
      ===================================================== */}

      <AnimatePresence>
        {showLogoIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.35,
              delay: 0.95,
            }}
            className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-[var(--background)]"
          >
            <motion.div
              layoutId="krupali-brand-logo"
              initial={{
                scale: 1.45,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative h-64 w-64 overflow-hidden rounded-full bg-white shadow-2xl shadow-[#1455a0]/20 sm:h-72 sm:w-72"
            >
              <Image
                src="/images/Krupali-Traders-Logo.png"
                alt="Krupali Traders Private Limited"
                fill
                priority
                className="object-cover"
                sizes="288px"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="fixed inset-x-0 top-0 z-50 px-2 pt-2 sm:px-4 sm:pt-3 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)]/90 shadow-[0_10px_40px_rgba(20,55,100,0.12)] backdrop-blur-xl">

            {/* =================================================
                MAIN NAVBAR
            ================================================= */}

            <div className="flex h-16 items-center justify-between gap-2 px-3 sm:h-[68px] sm:px-5 lg:px-7">

              {/* =================================================
                  LOGO
              ================================================= */}

              <Link
                href="/"
                onClick={closeMobile}
                className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3.5"
              >
                <motion.div
                  layoutId="krupali-brand-logo"
                  className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-white shadow-lg shadow-[#1455a0]/20 sm:h-14 sm:w-14"
                  transition={{
                    layout: {
                      duration: 0.9,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  }}
                >
                  <Image
                    src="/images/Krupali-Traders-Logo.png"
                    alt="Krupali Traders Private Limited"
                    fill
                    priority
                    className="object-cover"
                    sizes="56px"
                  />
                </motion.div>

                <div className="min-w-0">
                  <div className="text-sm font-bold tracking-tight text-[var(--foreground)] sm:text-lg">
                    KRUPALI
                  </div>

                  <div className="-mt-0.5 hidden whitespace-nowrap text-[9px] font-semibold tracking-[0.10em] text-[#c9a24d] sm:block sm:text-[10px] lg:text-[11px]">
                    TRADERS PRIVATE LIMITED
                  </div>
                </div>
              </Link>

              {/* =================================================
                  DESKTOP NAVIGATION
              ================================================= */}

              <nav className="hidden items-center gap-3 lg:flex xl:gap-5">

                {/* HOME */}

                <Link
                  href="/"
                  className="rounded-full px-3 py-2 text-sm font-medium text-[var(--foreground)]/75 transition hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                >
                  Home
                </Link>

                {/* ABOUT */}

                <Link
                  href="/about"
                  className="rounded-full px-3 py-2 text-sm font-medium text-[var(--foreground)]/75 transition hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                >
                  About Us
                </Link>

                {/* =================================================
                    PRODUCTS
                ================================================= */}

                <div
                  className="relative"
                  onMouseEnter={() =>
                    setProductsOpen(true)
                  }
                  onMouseLeave={() =>
                    closeProducts()
                  }
                >

                  <button
                    type="button"
                    className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-[var(--foreground)]/75 transition hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                  >
                    Products

                    <ChevronDown
                      size={15}
                      className={`transition-transform ${
                        productsOpen
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </button>

                  {/* =================================================
                      PRODUCTS DROPDOWN
                  ================================================= */}

                  {productsOpen && (
                    <div
                      className="absolute left-1/2 top-full w-[430px] -translate-x-1/2 pt-3"
                      onMouseEnter={() =>
                        setProductsOpen(true)
                      }
                    >

                      <div className="max-h-[75vh] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-2xl">

                        {/* =================================================
                            EXPORT PRODUCTS
                        ================================================= */}

                        <div className="flex items-center justify-between rounded-xl p-4 transition hover:bg-[var(--primary-light)]">

                          <Link
                            href="/products/export"
                            className="min-w-0 flex-1"
                          >
                            <div className="font-semibold text-[var(--foreground)]">
                              Export Products
                            </div>

                            <div className="mt-1 text-xs text-[var(--foreground)]/55">
                              Products supplied to global markets
                            </div>
                          </Link>

                          {/* EXPORT + / - */}

                          <button
                            type="button"
                            onClick={() =>
                              setExportCategoriesOpen(
                                !exportCategoriesOpen
                              )
                            }
                            aria-label={
                              exportCategoriesOpen
                                ? "Hide export categories"
                                : "Show export categories"
                            }
                            className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-lg font-medium text-[#1455a0] transition hover:bg-[#1455a0] hover:text-white dark:text-[#68b0ff]"
                          >
                            {exportCategoriesOpen
                              ? "−"
                              : "+"}
                          </button>

                        </div>

                        {/* =================================================
                            EXPORT CATEGORIES
                        ================================================= */}

                        {exportCategoriesOpen &&
                          exportCategories.length > 0 && (
                            <div className="mb-2 ml-5 border-l border-[#1455a0]/25 pl-3">

                              <div className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#1455a0] dark:text-[#68b0ff]">
                                Export Categories
                              </div>

                              {exportCategories.map(
                                (category) => (
                                  <Link
                                    key={category.id}
                                    href={`/products/export?categoryId=${encodeURIComponent(
                                      category.id
                                    )}`}
                                    className="block rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)]/70 transition hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                                  >
                                    {category.name}
                                  </Link>
                                )
                              )}

                            </div>
                          )}

                        {/* =================================================
                            IMPORT PRODUCTS
                        ================================================= */}

                        <div className="flex items-center justify-between rounded-xl p-4 transition hover:bg-[var(--primary-light)]">

                          <Link
                            href="/products/import"
                            className="min-w-0 flex-1"
                          >
                            <div className="font-semibold text-[var(--foreground)]">
                              Import Products
                            </div>

                            <div className="mt-1 text-xs text-[var(--foreground)]/55">
                              Products sourced internationally
                            </div>
                          </Link>

                          {/* IMPORT + / - */}

                          <button
                            type="button"
                            onClick={() =>
                              setImportCategoriesOpen(
                                !importCategoriesOpen
                              )
                            }
                            aria-label={
                              importCategoriesOpen
                                ? "Hide import categories"
                                : "Show import categories"
                            }
                            className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-lg font-medium text-[#c9a24d] transition hover:bg-[#c9a24d] hover:text-white dark:text-[#d8b45b]"
                          >
                            {importCategoriesOpen
                              ? "−"
                              : "+"}
                          </button>

                        </div>

                        {/* =================================================
                            IMPORT CATEGORIES
                        ================================================= */}

                        {importCategoriesOpen &&
                          importCategories.length > 0 && (
                            <div className="ml-5 border-l border-[#c9a24d]/30 pl-3">

                              <div className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#c9a24d] dark:text-[#d8b45b]">
                                Import Categories
                              </div>

                              {importCategories.map(
                                (category) => (
                                  <Link
                                    key={category.id}
                                    href={`/products/import?categoryId=${encodeURIComponent(
                                      category.id
                                    )}`}
                                    className="block rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)]/70 transition hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                                  >
                                    {category.name}
                                  </Link>
                                )
                              )}

                            </div>
                          )}

                        {/* =================================================
                            LOADING
                        ================================================= */}

                        {categoriesLoading && (
                          <div className="px-4 py-3 text-xs text-[var(--foreground)]/45">
                            Loading categories...
                          </div>
                        )}

                        {/* =================================================
                            NO CATEGORIES
                        ================================================= */}

                        {!categoriesLoading &&
                          exportCategories.length === 0 &&
                          importCategories.length === 0 && (
                            <div className="px-4 py-3 text-xs text-[var(--foreground)]/45">
                              No product categories available.
                            </div>
                          )}

                      </div>
                    </div>
                  )}

                </div>

                {/* GALLERY */}

                <Link
                  href="/gallery"
                  className="rounded-full px-3 py-2 text-sm font-medium text-[var(--foreground)]/75 transition hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                >
                  Gallery
                </Link>

                {/* BLOG */}

                <Link
                  href="/blog"
                  className="rounded-full px-3 py-2 text-sm font-medium text-[var(--foreground)]/75 transition hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                >
                  Blog
                </Link>

                {/* CONTACT */}

                <Link
                  href="/contact"
                  className="rounded-full px-3 py-2 text-sm font-medium text-[var(--foreground)]/75 transition hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                >
                  Contact
                </Link>

              </nav>

              {/* =================================================
                  RIGHT CONTROLS
              ================================================= */}

              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">

                {/* THEME */}

                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label="Toggle light and dark mode"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--primary)] transition hover:bg-[var(--primary-light)] sm:h-10 sm:w-10"
                >
                  {theme === "light" ? (
                    <Moon size={18} />
                  ) : (
                    <Sun size={18} />
                  )}
                </button>

                {/* DASHBOARD */}

                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className="hidden items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2.5 text-sm font-bold text-blue-600 transition hover:bg-blue-600 hover:text-white lg:flex"
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>
                )}

                {/* GET QUOTE */}

                <Link
                  href="/contact"
                  className="gradient-button hidden items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white lg:flex"
                >
                  Get a Quote
                  <ArrowUpRight size={16} />
                </Link>

                {/* MOBILE BUTTON */}

                <button
                  type="button"
                  onClick={() =>
                    setMobileOpen(!mobileOpen)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] lg:hidden sm:h-10 sm:w-10"
                  aria-label="Toggle menu"
                >
                  {mobileOpen ? (
                    <X size={21} />
                  ) : (
                    <Menu size={21} />
                  )}
                </button>

              </div>

            </div>

            {/* =====================================================
                MOBILE MENU
            ===================================================== */}

            {mobileOpen && (
              <div className="border-t border-[var(--border)] px-4 pb-5 pt-3 lg:hidden">

                <nav className="flex flex-col gap-1">

                  {/* HOME */}

                  <Link
                    href="/"
                    onClick={closeMobile}
                    className="rounded-xl px-4 py-3 font-medium text-[var(--foreground)] hover:bg-[var(--primary-light)]"
                  >
                    Home
                  </Link>

                  {/* ABOUT */}

                  <Link
                    href="/about"
                    onClick={closeMobile}
                    className="rounded-xl px-4 py-3 font-medium text-[var(--foreground)] hover:bg-[var(--primary-light)]"
                  >
                    About Us
                  </Link>

                  {/* =================================================
                      MOBILE PRODUCTS
                  ================================================= */}

                  <button
                    type="button"
                    onClick={() =>
                      setProductsOpen(
                        !productsOpen
                      )
                    }
                    className="flex items-center justify-between rounded-xl px-4 py-3 text-left font-medium text-[var(--foreground)] hover:bg-[var(--primary-light)]"
                  >
                    Products

                    <ChevronDown
                      size={18}
                      className={`transition-transform ${
                        productsOpen
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </button>

                  {productsOpen && (
                    <div className="ml-4 border-l border-[var(--border)] pl-3">

                      {/* =================================================
                          MOBILE EXPORT PRODUCTS
                      ================================================= */}

                      <div className="flex items-center justify-between rounded-xl">

                        <Link
                          href="/products/export"
                          onClick={closeMobile}
                          className="flex-1 rounded-xl px-4 py-3 font-semibold text-[var(--foreground)] hover:bg-[var(--primary-light)]"
                        >
                          Export Products
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            setExportCategoriesOpen(
                              !exportCategoriesOpen
                            )
                          }
                          aria-label={
                            exportCategoriesOpen
                              ? "Hide export categories"
                              : "Show export categories"
                          }
                          className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-lg text-[#1455a0] dark:text-[#68b0ff]"
                        >
                          {exportCategoriesOpen
                            ? "−"
                            : "+"}
                        </button>

                      </div>

                      {/* MOBILE EXPORT CATEGORIES */}

                      {exportCategoriesOpen &&
                        exportCategories.length > 0 && (
                          <div className="mb-2 ml-4 border-l border-[#1455a0]/25 pl-3">

                            {exportCategories.map(
                              (category) => (
                                <Link
                                  key={category.id}
                                  href={`/products/export?categoryId=${encodeURIComponent(
                                    category.id
                                  )}`}
                                  onClick={closeMobile}
                                  className="block rounded-lg px-4 py-2.5 text-sm text-[var(--foreground)]/65 hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                                >
                                  {category.name}
                                </Link>
                              )
                            )}

                          </div>
                        )}

                      {/* =================================================
                          MOBILE IMPORT PRODUCTS
                      ================================================= */}

                      <div className="flex items-center justify-between rounded-xl">

                        <Link
                          href="/products/import"
                          onClick={closeMobile}
                          className="flex-1 rounded-xl px-4 py-3 font-semibold text-[var(--foreground)] hover:bg-[var(--primary-light)]"
                        >
                          Import Products
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            setImportCategoriesOpen(
                              !importCategoriesOpen
                            )
                          }
                          aria-label={
                            importCategoriesOpen
                              ? "Hide import categories"
                              : "Show import categories"
                          }
                          className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-lg text-[#c9a24d] dark:text-[#d8b45b]"
                        >
                          {importCategoriesOpen
                            ? "−"
                            : "+"}
                        </button>

                      </div>

                      {/* MOBILE IMPORT CATEGORIES */}

                      {importCategoriesOpen &&
                        importCategories.length > 0 && (
                          <div className="ml-4 border-l border-[#c9a24d]/30 pl-3">

                            {importCategories.map(
                              (category) => (
                                <Link
                                  key={category.id}
                                  href={`/products/import?categoryId=${encodeURIComponent(
                                    category.id
                                  )}`}
                                  onClick={closeMobile}
                                  className="block rounded-lg px-4 py-2.5 text-sm text-[var(--foreground)]/65 hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                                >
                                  {category.name}
                                </Link>
                              )
                            )}

                          </div>
                        )}

                      {/* MOBILE LOADING */}

                      {categoriesLoading && (
                        <div className="px-4 py-2 text-xs text-[var(--foreground)]/45">
                          Loading categories...
                        </div>
                      )}

                    </div>
                  )}

                  {/* SERVICES */}

                  <Link
                    href="/services"
                    onClick={closeMobile}
                    className="rounded-xl px-4 py-3 font-medium text-[var(--foreground)] hover:bg-[var(--primary-light)]"
                  >
                    Services
                  </Link>

                  {/* GALLERY */}

                  <Link
                    href="/gallery"
                    onClick={closeMobile}
                    className="rounded-xl px-4 py-3 font-medium text-[var(--foreground)] hover:bg-[var(--primary-light)]"
                  >
                    Gallery
                  </Link>

                  {/* BLOG */}

                  <Link
                    href="/blog"
                    onClick={closeMobile}
                    className="rounded-xl px-4 py-3 font-medium text-[var(--foreground)] hover:bg-[var(--primary-light)]"
                  >
                    Blog
                  </Link>

                  {/* CONTACT */}

                  <Link
                    href="/contact"
                    onClick={closeMobile}
                    className="rounded-xl px-4 py-3 font-medium text-[var(--foreground)] hover:bg-[var(--primary-light)]"
                  >
                    Contact
                  </Link>

                  {/* DASHBOARD */}

                  {isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      onClick={closeMobile}
                      className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 font-bold text-blue-600 transition hover:bg-blue-600 hover:text-white"
                    >
                      <LayoutDashboard size={18} />
                      Dashboard
                    </Link>
                  )}

                  {/* GET QUOTE */}

                  <Link
                    href="/contact"
                    onClick={closeMobile}
                    className="gradient-button mt-3 flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-white"
                  >
                    Get a Quote
                    <ArrowUpRight size={17} />
                  </Link>

                </nav>
              </div>
            )}

          </div>
        </div>
      </header>
    </LayoutGroup>
  );
}