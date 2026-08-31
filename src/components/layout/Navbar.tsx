"use client";

import { useEffect, useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
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

export default function Navbar({ isAdmin = false }: NavbarProps) {
  const pathname = usePathname();
  const t = useTranslations("Navbar");

  const currentLocale = pathname.split("/")[1] || "en";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [exportCategoriesOpen, setExportCategoriesOpen] = useState(false);
  const [importCategoriesOpen, setImportCategoriesOpen] = useState(false);
  const [showLogoIntro, setShowLogoIntro] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const [mobileOpenCategoryId, setMobileOpenCategoryId] = useState<string | null>(null);

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

        const response = await fetch("/api/categories", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load product categories.");
        }

        const data = await response.json();

        if (!data.success || !Array.isArray(data.categories)) {
          throw new Error("Invalid category response.");
        }

        if (!cancelled) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error("NAVBAR_CATEGORY_LOAD_ERROR", error);
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
          {t("noProductsAvailable")}
        </div>
      );
    }

    return (
      <div className="ml-3 border-l border-[var(--border)] pl-3">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/${currentLocale}/products/${product.type.toLowerCase()}/${encodeURIComponent(
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
          {t("noCategories")}
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
          <div key={category.id} className="rounded-lg">
            <div className="flex items-center">
              <Link
                href={`/${currentLocale}/products/${category.type.toLowerCase()}?categoryId=${encodeURIComponent(
                  category.id
                )}`}
                className="flex-1 rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)]/70 transition hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
              >
                {category.name}
              </Link>

              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
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
                    openCategoryId === category.id ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

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
          {t("noCategories")}
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
              <Link
                href={`/${currentLocale}/products/${category.type.toLowerCase()}?categoryId=${encodeURIComponent(
                  category.id
                )}`}
                onClick={closeMobile}
                className="flex-1 rounded-lg px-4 py-2.5 text-sm text-[var(--foreground)]/70 transition hover:bg-[var(--primary-light)]"
              >
                {category.name}
              </Link>

              <button
                type="button"
                onClick={() => toggleMobileCategory(category.id)}
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
                    mobileOpenCategoryId === category.id ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {mobileOpenCategoryId === category.id && (
              <CategoryProducts category={category} mobile />
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
              initial={{ scale: 1.45, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative h-64 w-64 overflow-hidden rounded-full bg-white shadow-2xl shadow-[#1455a0]/20 sm:h-72 sm:w-72"
            >
              <Image
                src="/images/Krupali-Traders-Logo.gif"
                alt="Krupali Traders Private Limited"
                fill
                priority
                unoptimized
                className="object-cover"
                sizes="288px"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="fixed inset-x-0 top-0 z-50 px-2 pt-2 sm:px-6 sm:pt-4">
        <div className="mx-auto max-w-[96rem]">
          <div className="rounded-[2.5rem] border border-[var(--border)] bg-[var(--surface)]/95 shadow-[0_10px_40px_rgba(20,55,100,0.12)] backdrop-blur-xl">
            <div className="flex h-20 items-center justify-between gap-4 px-5 sm:h-22 sm:px-9 lg:px-12">
              <Link
                href={`/${currentLocale}`}
                onClick={closeMobile}
                className="flex shrink-0 items-center gap-3.5 sm:gap-4.5"
              >
                <motion.div
                  layoutId="krupali-brand-logo"
                  className="relative h-13 w-13 shrink-0 overflow-hidden rounded-full bg-white shadow-lg shadow-[#1455a0]/20 sm:h-15 sm:w-15"
                  transition={{
                    layout: {
                      duration: 0.9,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  }}
                >
                  <Image
                    src="/images/Krupali-Traders-Logo.gif"
                    alt="Krupali Traders Private Limited"
                    fill
                    priority
                    unoptimized
                    className="object-cover"
                    sizes="60px"
                  />
                </motion.div>

               {/* Example update inside your Navbar component */}
<div className="flex flex-col">
  <span className="font-extrabold tracking-wider text-[var(--foreground)] text-lg">
    KRUPALI TRADERS
  </span>
  <span className="font-semibold tracking-widest text-[#c9a24d] text-sm sm:text-base">
    PRIVATE LIMITED
  </span>
</div>
              </Link>

              <nav className="hidden items-center gap-1.5 lg:flex xl:gap-3">
                <Link
                  href={`/${currentLocale}`}
                  className="rounded-full px-4 py-2.5 text-sm font-semibold text-[var(--foreground)]/80 transition hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                >
                  {t("home")}
                </Link>

                <Link
                  href={`/${currentLocale}/about`}
                  className="rounded-full px-4 py-2.5 text-sm font-semibold text-[var(--foreground)]/80 transition hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                >
                  {t("about")}
                </Link>

                <div
                  className="relative"
                  onMouseEnter={() => setProductsOpen(true)}
                  onMouseLeave={() => closeProducts()}
                >
                  <button
                    type="button"
                    onClick={() => setProductsOpen((current) => !current)}
                    className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-[var(--foreground)]/80 transition hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                  >
                    {t("products")}
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        productsOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {productsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.18 }}
                        className="absolute left-1/2 top-full w-[290px] -translate-x-1/2 pt-3"
                      >
                        <div className="max-h-[80vh] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-2xl">
                          <Link
                            href={`/${currentLocale}/products`}
                            className="mb-2 flex items-center justify-between rounded-xl bg-[var(--primary-light)] px-4 py-3 transition hover:bg-[var(--primary)] hover:text-white"
                          >
                            <div>
                              <div className="font-semibold">{t("allProducts")}</div>
                              <div className="mt-0.5 text-xs opacity-60">
                                {t("browseAllProducts")}
                              </div>
                            </div>
                            <ArrowUpRight size={18} />
                          </Link>

                          <div className="rounded-xl">
                            <div className="flex items-center justify-between rounded-xl p-4 transition hover:bg-[var(--primary-light)]">
                              <Link
                                href={`/${currentLocale}/products/export`}
                                className="min-w-0 flex-1"
                              >
                                <div className="font-semibold text-[var(--foreground)]">
                                  {t("exportProducts")}
                                </div>
                                <div className="mt-1 text-xs text-[var(--foreground)]/55">
                                  {t("exportDesc")}
                                </div>
                              </Link>
                              <button
                                type="button"
                                onClick={() =>
                                  setExportCategoriesOpen((current) => !current)
                                }
                                className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-lg font-medium text-[#1455a0] transition hover:bg-[#1455a0] hover:text-white dark:text-[#68b0ff]"
                              >
                                {exportCategoriesOpen ? "−" : "+"}
                              </button>
                            </div>
                            {exportCategoriesOpen && (
                              <DesktopCategoryList
                                categoryList={exportCategories}
                                accent="blue"
                              />
                            )}
                          </div>

                          <div className="mt-1 rounded-xl">
                            <div className="flex items-center justify-between rounded-xl p-4 transition hover:bg-[var(--primary-light)]">
                              <Link
                                href={`/${currentLocale}/products/import`}
                                className="min-w-0 flex-1"
                              >
                                <div className="font-semibold text-[var(--foreground)]">
                                  {t("importProducts")}
                                </div>
                                <div className="mt-1 text-xs text-[var(--foreground)]/55">
                                  {t("importDesc")}
                                </div>
                              </Link>
                              <button
                                type="button"
                                onClick={() =>
                                  setImportCategoriesOpen((current) => !current)
                                }
                                className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-lg font-medium text-[#c9a24d] transition hover:bg-[#c9a24d] hover:text-white dark:text-[#d8b45b]"
                              >
                                {importCategoriesOpen ? "−" : "+"}
                              </button>
                            </div>
                            {importCategoriesOpen && (
                              <DesktopCategoryList
                                categoryList={importCategories}
                                accent="gold"
                              />
                            )}
                          </div>

                          {categoriesLoading && (
                            <div className="px-4 py-3 text-xs text-[var(--foreground)]/45">
                              {t("loadingCategories")}
                            </div>
                          )}

                          {!categoriesLoading && categories.length === 0 && (
                            <div className="px-4 py-3 text-xs text-[var(--foreground)]/45">
                              {t("noCategories")}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link
                  href={`/${currentLocale}/gallery`}
                  className="rounded-full px-4 py-2.5 text-sm font-semibold text-[var(--foreground)]/80 transition hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                >
                  {t("gallery")}
                </Link>

                <Link
                  href={`/${currentLocale}/blog`}
                  className="rounded-full px-4 py-2.5 text-sm font-semibold text-[var(--foreground)]/80 transition hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                >
                  {t("blog")}
                </Link>

                <Link
                  href={`/${currentLocale}/contact`}
                  className="rounded-full px-4 py-2.5 text-sm font-semibold text-[var(--foreground)]/80 transition hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                >
                  {t("contact")}
                </Link>
              </nav>

              <div className="flex shrink-0 items-center gap-2.5 sm:gap-3.5">
               

                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label="Toggle light and dark mode"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--primary)] transition hover:bg-[var(--primary-light)]"
                >
                  {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
                </button>

                {isAdmin && (
                  <Link
                    href={`/${currentLocale}/admin/dashboard`}
                    className="hidden items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2.5 text-sm font-bold text-blue-600 transition hover:bg-blue-600 hover:text-white lg:flex"
                  >
                    <LayoutDashboard size={16} />
                    {t("dashboard")}
                  </Link>
                )}

                <Link
                  href={`/${currentLocale}/contact`}
                  className="gradient-button hidden items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-lg transition duration-300 hover:brightness-110 lg:flex"
                >
                  {t("getQuote")}
                  <ArrowUpRight size={16} />
                </Link>

                <button
                  type="button"
                  onClick={() => setMobileOpen((current) => !current)}
                  aria-label="Toggle menu"
                  aria-expanded={mobileOpen}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] lg:hidden"
                >
                  {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {mobileOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden lg:hidden"
                >
                  <div className="border-t border-[var(--border)] px-4 pb-6 pt-4">
                    <nav className="flex flex-col gap-1">
                      <Link
                        href={`/${currentLocale}`}
                        onClick={closeMobile}
                        className="rounded-xl px-4 py-3 font-medium text-[var(--foreground)] transition hover:bg-[var(--primary-light)]"
                      >
                        {t("home")}
                      </Link>

                      <Link
                        href={`/${currentLocale}/about`}
                        onClick={closeMobile}
                        className="rounded-xl px-4 py-3 font-medium text-[var(--foreground)] transition hover:bg-[var(--primary-light)]"
                      >
                        {t("about")}
                      </Link>

                      <div>
                        <button
                          type="button"
                          onClick={() => setProductsOpen((current) => !current)}
                          className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left font-semibold text-[var(--foreground)] transition hover:bg-[var(--primary-light)]"
                        >
                          {t("products")}
                          <ChevronDown
                            size={18}
                            className={`transition-transform ${
                              productsOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {productsOpen && (
                          <div className="ml-4 border-l border-[var(--border)] pl-3">
                            <Link
                              href={`/${currentLocale}/products`}
                              onClick={closeMobile}
                              className="mb-1 block rounded-xl bg-[var(--primary-light)] px-4 py-3 font-semibold text-[var(--foreground)]"
                            >
                              {t("allProducts")}
                            </Link>

                            <div>
                              <div className="flex items-center">
                                <Link
                                  href={`/${currentLocale}/products/export`}
                                  onClick={closeMobile}
                                  className="flex-1 rounded-xl px-4 py-3 font-semibold text-[var(--foreground)] transition hover:bg-[var(--primary-light)]"
                                >
                                  {t("exportProducts")}
                                </Link>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExportCategoriesOpen((current) => !current)
                                  }
                                  className="mr-1 flex h-8 w-8 items-center justify-center rounded-full text-[#1455a0] dark:text-[#68b0ff]"
                                >
                                  <ChevronDown
                                    size={15}
                                    className={`transition-transform ${
                                      exportCategoriesOpen ? "rotate-180" : ""
                                    }`}
                                  />
                                </button>
                              </div>
                              {exportCategoriesOpen && (
                                <MobileCategoryList
                                  categoryList={exportCategories}
                                  accent="blue"
                                />
                              )}
                            </div>

                            <div className="mt-1">
                              <div className="flex items-center">
                                <Link
                                  href={`/${currentLocale}/products/import`}
                                  onClick={closeMobile}
                                  className="flex-1 rounded-xl px-4 py-3 font-semibold text-[var(--foreground)] transition hover:bg-[var(--primary-light)]"
                                >
                                  {t("importProducts")}
                                </Link>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setImportCategoriesOpen((current) => !current)
                                  }
                                  className="mr-1 flex h-8 w-8 items-center justify-center rounded-full text-[#c9a24d] dark:text-[#d8b45b]"
                                >
                                  <ChevronDown
                                    size={15}
                                    className={`transition-transform ${
                                      importCategoriesOpen ? "rotate-180" : ""
                                    }`}
                                  />
                                </button>
                              </div>
                              {importCategoriesOpen && (
                                <MobileCategoryList
                                  categoryList={importCategories}
                                  accent="gold"
                                />
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/${currentLocale}/gallery`}
                        onClick={closeMobile}
                        className="rounded-xl px-4 py-3 font-medium text-[var(--foreground)] transition hover:bg-[var(--primary-light)]"
                      >
                        {t("gallery")}
                      </Link>

                      <Link
                        href={`/${currentLocale}/blog`}
                        onClick={closeMobile}
                        className="rounded-xl px-4 py-3 font-medium text-[var(--foreground)] transition hover:bg-[var(--primary-light)]"
                      >
                        {t("blog")}
                      </Link>

                      <Link
                        href={`/${currentLocale}/contact`}
                        onClick={closeMobile}
                        className="rounded-xl px-4 py-3 font-medium text-[var(--foreground)] transition hover:bg-[var(--primary-light)]"
                      >
                        {t("contact")}
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