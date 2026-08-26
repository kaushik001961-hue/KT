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

/* =========================================================
   TYPES
========================================================= */

type NavbarProps = {
  isAdmin?: boolean;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  type: "IMPORT" | "EXPORT";
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

type Category = {
  id: string;
  name: string;
  slug: string;
  type: "IMPORT" | "EXPORT";
  description?: string | null;
  imageUrl?: string | null;
  products?: Product[];
};

/* =========================================================
   COMPONENT
========================================================= */

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

  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  const [openCategoryId, setOpenCategoryId] =
    useState<string | null>(null);

  const [mobileOpenCategoryId, setMobileOpenCategoryId] =
    useState<string | null>(null);

  const { theme, toggleTheme } = useTheme();

  /* =========================================================
     LOGO INTRO
  ========================================================= */

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowLogoIntro(false);
    }, 1700);

    return () => window.clearTimeout(timer);
  }, []);

  /* =========================================================
     LOAD CATEGORIES + PRODUCTS
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        setCategoriesLoading(true);

        /*
         * IMPORTANT:
         *
         * This is the PUBLIC category API.
         *
         * Do NOT use:
         *
         * /api/admin/categories
         *
         * because the Navbar is visible to public visitors.
         */

        const response = await fetch("/api/categories", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            "Unable to load product categories."
          );
        }

        const data = await response.json();

        if (
          !data.success ||
          !Array.isArray(data.categories)
        ) {
          throw new Error(
            "Invalid category response."
          );
        }

        if (!cancelled) {
          setCategories(data.categories);
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

  /* =========================================================
     CATEGORY GROUPS
  ========================================================= */

  const importCategories = categories.filter(
    (category) => category.type === "IMPORT"
  );

  const exportCategories = categories.filter(
    (category) => category.type === "EXPORT"
  );

  /* =========================================================
     CLOSE MOBILE
  ========================================================= */

  const closeMobile = () => {
    setMobileOpen(false);
    setProductsOpen(false);
    setExportCategoriesOpen(false);
    setImportCategoriesOpen(false);
    setOpenCategoryId(null);
    setMobileOpenCategoryId(null);
  };

  /* =========================================================
     CLOSE DESKTOP PRODUCTS
  ========================================================= */

  const closeProducts = () => {
    setProductsOpen(false);
    setExportCategoriesOpen(false);
    setImportCategoriesOpen(false);
    setOpenCategoryId(null);
  };

  /* =========================================================
     CATEGORY TOGGLE
  ========================================================= */

  const toggleCategory = (categoryId: string) => {
    setOpenCategoryId((current) =>
      current === categoryId ? null : categoryId
    );
  };

  const toggleMobileCategory = (categoryId: string) => {
    setMobileOpenCategoryId((current) =>
      current === categoryId ? null : categoryId
    );
  };

  /* =========================================================
     PRODUCT LIST
  ========================================================= */

  const CategoryProducts = ({
    category,
    mobile = false,
  }: {
    category: Category;
    mobile?: boolean;
  }) => {
    const products = category.products || [];

    if (products.length === 0) {
      return (
        <div
          className={
            mobile
              ? "px-4 py-2 text-xs text-[var(--foreground)]/45"
              : "px-3 py-2 text-xs text-[var(--foreground)]/45"
          }
        >
          Currently no product available
        </div>
      );
    }

    return (
      <div className="ml-3 border-l border-[var(--border)] pl-3">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.type.toLowerCase()}/${encodeURIComponent(
              product.slug
            )}`}
            onClick={mobile ? closeMobile : undefined}
            className="block rounded-lg px-3 py-2 text-sm text-[var(--foreground)]/65 transition hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
          >
            {product.name}
          </Link>
        ))}
      </div>
    );
  };

  /* =========================================================
     CATEGORY LIST
  ========================================================= */

  const DesktopCategoryList = ({
    categoryList,
    accent,
  }: {
    categoryList: Category[];
    accent: "blue" | "gold";
  }) => {
    if (categoryList.length === 0) {
      return (
        <div className="px-3 py-2 text-xs text-[var(--foreground)]/45">
          No categories available.
        </div>
      );
    }

    return (
      <div
        className={`ml-5 border-l pl-3 ${
          accent === "blue"
            ? "border-[#1455a0]/25"
            : "border-[#c9a24d]/30"
        }`}
      >
        {categoryList.map((category) => (
          <div
            key={category.id}
            className="rounded-lg"
          >
            <div className="flex items-center">

              {/* CATEGORY */}

              <Link
                href={`/products/${category.type.toLowerCase()}?categoryId=${encodeURIComponent(
                  category.id
                )}`}
                className="flex-1 rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)]/70 transition hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
              >
                {category.name}
              </Link>

              {/* PRODUCT TOGGLE */}

              <button
                type="button"
                onClick={() =>
                  toggleCategory(category.id)
                }
                className={`mr-1 flex h-8 w-8 items-center justify-center rounded-full transition ${
                  accent === "blue"
                    ? "text-[#1455a0] hover:bg-[#1455a0]/10 dark:text-[#68b0ff]"
                    : "text-[#c9a24d] hover:bg-[#c9a24d]/10 dark:text-[#d8b45b]"
                }`}
                aria-label={`Show products in ${category.name}`}
              >
                <ChevronDown
                  size={15}
                  className={`transition-transform ${
                    openCategoryId === category.id
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>
            </div>

            {/* PRODUCTS */}

            {openCategoryId === category.id && (
              <CategoryProducts category={category} />
            )}
          </div>
        ))}
      </div>
    );
  };

  /* =========================================================
     MOBILE CATEGORY LIST
  ========================================================= */

  const MobileCategoryList = ({
    categoryList,
    accent,
  }: {
    categoryList: Category[];
    accent: "blue" | "gold";
  }) => {
    if (categoryList.length === 0) {
      return (
        <div className="px-4 py-2 text-xs text-[var(--foreground)]/45">
          No categories available.
        </div>
      );
    }

    return (
      <div
        className={`ml-4 border-l pl-3 ${
          accent === "blue"
            ? "border-[#1455a0]/25"
            : "border-[#c9a24d]/30"
        }`}
      >
        {categoryList.map((category) => (
          <div key={category.id}>

            <div className="flex items-center">

              {/* CATEGORY */}

              <Link
                href={`/products/${category.type.toLowerCase()}?categoryId=${encodeURIComponent(
                  category.id
                )}`}
                onClick={closeMobile}
                className="flex-1 rounded-lg px-4 py-2.5 text-sm text-[var(--foreground)]/70 transition hover:bg-[var(--primary-light)]"
              >
                {category.name}
              </Link>

              {/* PRODUCT TOGGLE */}

              <button
                type="button"
                onClick={() =>
                  toggleMobileCategory(category.id)
                }
                className={`mr-1 flex h-8 w-8 items-center justify-center rounded-full ${
                  accent === "blue"
                    ? "text-[#1455a0] dark:text-[#68b0ff]"
                    : "text-[#c9a24d] dark:text-[#d8b45b]"
                }`}
                aria-label={`Show products in ${category.name}`}
              >
                <ChevronDown
                  size={15}
                  className={`transition-transform ${
                    mobileOpenCategoryId === category.id
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>
            </div>

            {/* PRODUCTS */}

            {mobileOpenCategoryId === category.id && (
              <CategoryProducts
                category={category}
                mobile
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <LayoutGroup>

      {/* =====================================================
          LOGO INTRO
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

  <div className="-mt-0.5 whitespace-nowrap text-[7px] font-semibold tracking-[0.06em] text-[#c9a24d] sm:text-[10px] sm:tracking-[0.10em] lg:text-[11px]">
    TRADERS PRIVATE LIMITED
  </div>
</div>
              </Link>

              {/* =================================================
                  DESKTOP NAV
              ================================================= */}

              <nav className="hidden items-center gap-3 lg:flex xl:gap-5">

                <Link
                  href="/"
                  className="rounded-full px-3 py-2 text-sm font-medium text-[var(--foreground)]/75 transition hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                >
                  Home
                </Link>

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
                    onClick={() =>
                      setProductsOpen(
                        (current) => !current
                      )
                    }
                    className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-[var(--foreground)]/80 transition hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
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

                  <AnimatePresence>
                    {productsOpen && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: 8,
                          scale: 0.98,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          y: 8,
                          scale: 0.98,
                        }}
                        transition={{
                          duration: 0.18,
                        }}
                        className="absolute left-1/2 top-full w-[270px] -translate-x-1/2 pt-3"
                      >
                        <div className="max-h-[80vh] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-2xl">

                          {/* =================================================
                              VIEW ALL PRODUCTS
                          ================================================= */}

                          <Link
                            href="/products"
                            className="mb-2 flex items-center justify-between rounded-xl bg-[var(--primary-light)] px-4 py-3 transition hover:bg-[var(--primary)] hover:text-white"
                          >
                            <div>
                              <div className="font-semibold">
                                All Products
                              </div>

                              <div className="mt-0.5 text-xs opacity-60">
                                Browse all Import & Export Products
                              </div>
                            </div>

                            <ArrowUpRight size={18} />
                          </Link>

                          {/* =================================================
                              EXPORT
                          ================================================= */}

                          <div className="rounded-xl">

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

                              <button
                                type="button"
                                onClick={() =>
                                  setExportCategoriesOpen(
                                    (current) =>
                                      !current
                                  )
                                }
                                className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-lg font-medium text-[#1455a0] transition hover:bg-[#1455a0] hover:text-white dark:text-[#68b0ff]"
                              >
                                {exportCategoriesOpen
                                  ? "−"
                                  : "+"}
                              </button>

                            </div>

                            {exportCategoriesOpen && (
                              <DesktopCategoryList
                                categoryList={
                                  exportCategories
                                }
                                accent="blue"
                              />
                            )}
                          </div>

                          {/* =================================================
                              IMPORT
                          ================================================= */}

                          <div className="mt-1 rounded-xl">

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

                              <button
                                type="button"
                                onClick={() =>
                                  setImportCategoriesOpen(
                                    (current) =>
                                      !current
                                  )
                                }
                                className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-lg font-medium text-[#c9a24d] transition hover:bg-[#c9a24d] hover:text-white dark:text-[#d8b45b]"
                              >
                                {importCategoriesOpen
                                  ? "−"
                                  : "+"}
                              </button>

                            </div>

                            {importCategoriesOpen && (
                              <DesktopCategoryList
                                categoryList={
                                  importCategories
                                }
                                accent="gold"
                              />
                            )}
                          </div>

                          {/* =================================================
                              LOADING
                          ================================================= */}

                          {categoriesLoading && (
                            <div className="px-4 py-3 text-xs text-[var(--foreground)]/45">
                              Loading product categories...
                            </div>
                          )}

                          {/* =================================================
                              EMPTY
                          ================================================= */}

                          {!categoriesLoading &&
                            categories.length === 0 && (
                              <div className="px-4 py-3 text-xs text-[var(--foreground)]/45">
                                No product categories available.
                              </div>
                            )}

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link
                  href="/gallery"
                  className="rounded-full px-3 py-2 text-sm font-medium text-[var(--foreground)]/75 transition hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                >
                  Gallery
                </Link>

                <Link
                  href="/blog"
                  className="rounded-full px-3 py-2 text-sm font-medium text-[var(--foreground)]/75 transition hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                >
                  Blog
                </Link>

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

                {/* ADMIN DASHBOARD */}

                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className="hidden items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2.5 text-sm font-bold text-blue-600 transition hover:bg-blue-600 hover:text-white lg:flex"
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>
                )}

                {/* GET A QUOTE */}

                <Link
                  href="/contact"
                  className="gradient-button hidden items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white lg:flex"
                >
                  Get a Quote
                  <ArrowUpRight size={16} />
                </Link>

                {/* MOBILE MENU */}

                <button
                  type="button"
                  onClick={() =>
                    setMobileOpen(
                      (current) => !current
                    )
                  }
                  aria-label="Toggle menu"
                  aria-expanded={mobileOpen}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] lg:hidden sm:h-10 sm:w-10"
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

            <AnimatePresence initial={false}>
              {mobileOpen && (
                <motion.div
                  initial={{
                    height: 0,
                    opacity: 0,
                  }}
                  animate={{
                    height: "auto",
                    opacity: 1,
                  }}
                  exit={{
                    height: 0,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.25,
                  }}
                  className="overflow-hidden lg:hidden"
                >
                  <div className="border-t border-[var(--border)] px-4 pb-5 pt-3">

                    <nav className="flex flex-col gap-1">

                      {/* HOME */}

                      <Link
                        href="/"
                        onClick={closeMobile}
                        className="rounded-xl px-4 py-3 font-medium text-[var(--foreground)] transition hover:bg-[var(--primary-light)]"
                      >
                        Home
                      </Link>

                      {/* ABOUT */}

                      <Link
                        href="/about"
                        onClick={closeMobile}
                        className="rounded-xl px-4 py-3 font-medium text-[var(--foreground)] transition hover:bg-[var(--primary-light)]"
                      >
                        About Us
                      </Link>

                      {/* =================================================
                          PRODUCTS
                      ================================================= */}

                      <div>

                        <button
                          type="button"
                          onClick={() =>
                            setProductsOpen(
                              (current) => !current
                            )
                          }
                          className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left font-semibold text-[var(--foreground)] transition hover:bg-[var(--primary-light)]"
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

                            {/* ALL PRODUCTS */}

                            <Link
                              href="/products"
                              onClick={closeMobile}
                              className="mb-1 block rounded-xl bg-[var(--primary-light)] px-4 py-3 font-semibold text-[var(--foreground)]"
                            >
                              All Products
                            </Link>

                            {/* =================================================
                                EXPORT
                            ================================================= */}

                            <div>

                              <div className="flex items-center">

                                <Link
                                  href="/products/export"
                                  onClick={closeMobile}
                                  className="flex-1 rounded-xl px-4 py-3 font-semibold text-[var(--foreground)] transition hover:bg-[var(--primary-light)]"
                                >
                                  Export Products
                                </Link>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setExportCategoriesOpen(
                                      (current) =>
                                        !current
                                    )
                                  }
                                  className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-lg text-[#1455a0] dark:text-[#68b0ff]"
                                >
                                  {exportCategoriesOpen
                                    ? "−"
                                    : "+"}
                                </button>

                              </div>

                              {exportCategoriesOpen && (
                                <MobileCategoryList
                                  categoryList={
                                    exportCategories
                                  }
                                  accent="blue"
                                />
                              )}

                            </div>

                            {/* =================================================
                                IMPORT
                            ================================================= */}

                            <div>

                              <div className="flex items-center">

                                <Link
                                  href="/products/import"
                                  onClick={closeMobile}
                                  className="flex-1 rounded-xl px-4 py-3 font-semibold text-[var(--foreground)] transition hover:bg-[var(--primary-light)]"
                                >
                                  Import Products
                                </Link>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setImportCategoriesOpen(
                                      (current) =>
                                        !current
                                    )
                                  }
                                  className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-lg text-[#c9a24d] dark:text-[#d8b45b]"
                                >
                                  {importCategoriesOpen
                                    ? "−"
                                    : "+"}
                                </button>

                              </div>

                              {importCategoriesOpen && (
                                <MobileCategoryList
                                  categoryList={
                                    importCategories
                                  }
                                  accent="gold"
                                />
                              )}

                            </div>

                            {categoriesLoading && (
                              <div className="px-4 py-3 text-xs text-[var(--foreground)]/45">
                                Loading product categories...
                              </div>
                            )}

                          </div>
                        )}
                      </div>

                      {/* GALLERY */}

                      <Link
                        href="/gallery"
                        onClick={closeMobile}
                        className="rounded-xl px-4 py-3 font-medium text-[var(--foreground)] transition hover:bg-[var(--primary-light)]"
                      >
                        Gallery
                      </Link>

                      {/* BLOG */}

                      <Link
                        href="/blog"
                        onClick={closeMobile}
                        className="rounded-xl px-4 py-3 font-medium text-[var(--foreground)] transition hover:bg-[var(--primary-light)]"
                      >
                        Blog
                      </Link>

                      {/* CONTACT */}

                      <Link
                        href="/contact"
                        onClick={closeMobile}
                        className="rounded-xl px-4 py-3 font-medium text-[var(--foreground)] transition hover:bg-[var(--primary-light)]"
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

                      {/* GET A QUOTE */}

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
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </header>
    </LayoutGroup>
  );
}