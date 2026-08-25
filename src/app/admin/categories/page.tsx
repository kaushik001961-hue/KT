"use client";

import {
  Edit3,
  FolderPlus,
  Power,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

type ProductType = "IMPORT" | "EXPORT";

type ProductCategory = {
  id: string;
  name: string;
  slug: string;
  type: ProductType;
  description: string | null;
  active: boolean;
  _count: {
    products: number;
  };
};

type BlogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  active: boolean;
  _count?: {
    posts?: number;
    articles?: number;
  };
};

const emptyProductForm = {
  name: "",
  type: "IMPORT" as ProductType,
  description: "",
  active: true,
};

const emptyBlogForm = {
  name: "",
  slug: "",
  description: "",
  active: true,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [blogCategories, setBlogCategories] = useState<BlogCategory[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showProductForm, setShowProductForm] = useState(false);
  const [showBlogForm, setShowBlogForm] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);

  const [productForm, setProductForm] =
    useState(emptyProductForm);

  const [blogForm, setBlogForm] =
    useState(emptyBlogForm);

  async function loadCategories() {
    try {
      setLoading(true);
      setError("");

      const [productResponse, blogResponse] =
        await Promise.all([
          fetch("/api/admin/categories", {
            cache: "no-store",
          }),
          fetch("/api/admin/blog/categories", {
            cache: "no-store",
          }),
        ]);

      const productResult =
        await productResponse.json();

      const blogResult =
        await blogResponse.json();

      if (!productResponse.ok) {
        throw new Error(
          productResult.message ||
            "Unable to load product categories."
        );
      }

      if (!blogResponse.ok) {
        throw new Error(
          blogResult.message ||
            "Unable to load Blog categories."
        );
      }

      setCategories(
        productResult.categories || []
      );

      setBlogCategories(
        blogResult.categories || []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function openAddProductForm(type: ProductType) {
    setEditingId(null);

    setProductForm({
      ...emptyProductForm,
      type,
    });

    setError("");
    setSuccess("");
    setShowProductForm(true);
  }

  function openEditProductForm(
    category: ProductCategory
  ) {
    setEditingId(category.id);

    setProductForm({
      name: category.name,
      type: category.type,
      description: category.description || "",
      active: category.active,
    });

    setError("");
    setSuccess("");
    setShowProductForm(true);
  }

  function openAddBlogForm() {
    setEditingBlogId(null);
    setBlogForm(emptyBlogForm);

    setError("");
    setSuccess("");
    setShowBlogForm(true);
  }

  function openEditBlogForm(
    category: BlogCategory
  ) {
    setEditingBlogId(category.id);

    setBlogForm({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      active: category.active,
    });

    setError("");
    setSuccess("");
    setShowBlogForm(true);
  }

  function closeForms() {
    if (saving) return;

    setShowProductForm(false);
    setShowBlogForm(false);

    setEditingId(null);
    setEditingBlogId(null);

    setProductForm(emptyProductForm);
    setBlogForm(emptyBlogForm);
  }

  async function saveProductCategory(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!productForm.name.trim()) {
      setError("Category name is required.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        editingId
          ? `/api/admin/categories/${editingId}`
          : "/api/admin/categories",
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: productForm.name.trim(),
            type: productForm.type,
            description:
              productForm.description.trim() || null,
            active: productForm.active,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to save category."
        );
      }

      setSuccess(
        editingId
          ? "Category updated successfully."
          : "Category created successfully."
      );

      setShowProductForm(false);
      setEditingId(null);
      setProductForm(emptyProductForm);

      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save category."
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveBlogCategory(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const name = blogForm.name.trim();
    const slug = slugify(
      blogForm.slug || blogForm.name
    );

    if (!name) {
      setError("Blog category name is required.");
      return;
    }

    if (!slug) {
      setError(
        "A valid Blog category slug is required."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        editingBlogId
          ? `/api/admin/blog/categories/${editingBlogId}`
          : "/api/admin/blog/categories",
        {
          method: editingBlogId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            slug,
            description:
              blogForm.description.trim() || null,
            active: blogForm.active,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to save Blog category."
        );
      }

      setSuccess(
        editingBlogId
          ? "Blog category updated successfully."
          : "Blog category created successfully."
      );

      setShowBlogForm(false);
      setEditingBlogId(null);
      setBlogForm(emptyBlogForm);

      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save Blog category."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleProductCategory(
    category: ProductCategory
  ) {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/categories/${category.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: category.name,
            type: category.type,
            description: category.description,
            active: !category.active,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to update category."
        );
      }

      setSuccess(
        category.active
          ? "Category deactivated."
          : "Category activated."
      );

      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update category."
      );
    }
  }

  async function toggleBlogCategory(
    category: BlogCategory
  ) {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/blog/categories/${category.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: category.name,
            slug: category.slug,
            description: category.description,
            active: !category.active,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to update Blog category."
        );
      }

      setSuccess(
        category.active
          ? "Blog category deactivated."
          : "Blog category activated."
      );

      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update Blog category."
      );
    }
  }

  async function deleteProductCategory(
    category: ProductCategory
  ) {
    const confirmed = window.confirm(
      category._count.products > 0
        ? `"${category.name}" is used by ${category._count.products} product(s). It will be deactivated instead. Continue?`
        : `Delete "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/categories/${category.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to delete category."
        );
      }

      setSuccess(
        result.message ||
          "Category deleted successfully."
      );

      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete category."
      );
    }
  }

  async function deleteBlogCategory(
    category: BlogCategory
  ) {
    const confirmed = window.confirm(
      `Delete Blog category "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/blog/categories/${category.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to delete Blog category."
        );
      }

      setSuccess(
        result.message ||
          "Blog category deleted successfully."
      );

      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete Blog category."
      );
    }
  }

  const importCategories =
    categories.filter(
      (category) => category.type === "IMPORT"
    );

  const exportCategories =
    categories.filter(
      (category) => category.type === "EXPORT"
    );

  function ProductCategoryList({
    title,
    type,
    items,
  }: {
    title: string;
    type: ProductType;
    items: ProductCategory[];
  }) {
    return (
      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-lg shadow-blue-950/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              {type}
            </p>

            <h2 className="mt-1 text-2xl font-black text-[var(--foreground)]">
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={() =>
              openAddProductForm(type)
            }
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5"
          >
            <FolderPlus className="h-4 w-4" />
            Add Category
          </button>
        </div>

        {items.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-soft)] p-8 text-center">
            <p className="font-semibold text-[var(--foreground)]/50">
              No {type.toLowerCase()} categories yet.
            </p>

            <button
              type="button"
              onClick={() =>
                openAddProductForm(type)
              }
              className="mt-3 text-sm font-bold text-blue-600 hover:underline"
            >
              Create the first category
            </button>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead>
                <tr className="border-b border-[var(--border)] text-left">
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-[var(--foreground)]/40">
                    Category
                  </th>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-[var(--foreground)]/40">
                    Slug
                  </th>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-[var(--foreground)]/40">
                    Products
                  </th>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-[var(--foreground)]/40">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-wider text-[var(--foreground)]/40">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.map((category) => (
                  <tr
                    key={category.id}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="px-4 py-4">
                      <div className="font-bold text-[var(--foreground)]">
                        {category.name}
                      </div>

                      {category.description && (
                        <div className="mt-1 max-w-xs truncate text-xs text-[var(--foreground)]/45">
                          {category.description}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4 text-sm text-[var(--foreground)]/50">
                      {category.slug}
                    </td>

                    <td className="px-4 py-4 text-sm font-bold text-[var(--foreground)]">
                      {category._count.products}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          category.active
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-gray-500/10 text-gray-500"
                        }`}
                      >
                        {category.active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditProductForm(
                              category
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 transition hover:bg-blue-500 hover:text-white"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            toggleProductCategory(
                              category
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 transition hover:bg-amber-500 hover:text-white"
                          title={
                            category.active
                              ? "Deactivate"
                              : "Activate"
                          }
                        >
                          <Power className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteProductCategory(
                              category
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-600 transition hover:bg-red-500 hover:text-white"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    );
  }

  function BlogCategoryList() {
    return (
      <section className="rounded-[2rem] border border-fuchsia-500/20 bg-[var(--surface)] p-6 shadow-lg shadow-fuchsia-950/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-fuchsia-500">
              BLOG
            </p>

            <h2 className="mt-1 text-2xl font-black text-[var(--foreground)]">
              Blog Categories
            </h2>
          </div>

          <button
            type="button"
            onClick={openAddBlogForm}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-600 to-pink-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-fuchsia-600/20 transition hover:-translate-y-0.5"
          >
            <FolderPlus className="h-4 w-4" />
            Add Category
          </button>
        </div>

        {blogCategories.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-fuchsia-500/20 bg-fuchsia-500/5 p-8 text-center">
            <p className="font-semibold text-[var(--foreground)]/50">
              No Blog categories yet.
            </p>

            <button
              type="button"
              onClick={openAddBlogForm}
              className="mt-3 text-sm font-bold text-fuchsia-500 hover:underline"
            >
              Create the first Blog category
            </button>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead>
                <tr className="border-b border-[var(--border)] text-left">
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-[var(--foreground)]/40">
                    Category
                  </th>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-[var(--foreground)]/40">
                    Slug
                  </th>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-[var(--foreground)]/40">
                    Articles
                  </th>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-[var(--foreground)]/40">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-wider text-[var(--foreground)]/40">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {blogCategories.map((category) => {
                  const articles =
                    category._count?.posts ??
                    category._count?.articles ??
                    0;

                  return (
                    <tr
                      key={category.id}
                      className="border-b border-[var(--border)] last:border-0"
                    >
                      <td className="px-4 py-4">
                        <div className="font-bold text-[var(--foreground)]">
                          {category.name}
                        </div>

                        {category.description && (
                          <div className="mt-1 max-w-xs truncate text-xs text-[var(--foreground)]/45">
                            {category.description}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4 text-sm text-[var(--foreground)]/50">
                        {category.slug}
                      </td>

                      <td className="px-4 py-4 text-sm font-bold text-[var(--foreground)]">
                        {articles}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            category.active
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-gray-500/10 text-gray-500"
                          }`}
                        >
                          {category.active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditBlogForm(
                                category
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-500 transition hover:bg-fuchsia-500 hover:text-white"
                            title="Edit"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              toggleBlogCategory(
                                category
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500 transition hover:bg-pink-500 hover:text-white"
                            title={
                              category.active
                                ? "Deactivate"
                                : "Activate"
                            }
                          >
                            <Power className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteBlogCategory(
                                category
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-600 transition hover:bg-red-500 hover:text-white"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
            CATEGORY MANAGEMENT
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl">
            Categories
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-[var(--foreground)]/55">
            Manage your product categories and Blog categories from one place.
          </p>
        </header>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm font-semibold text-emerald-600">
            {success}
          </div>
        )}

        {loading ? (
          <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
            <p className="font-semibold text-[var(--foreground)]/50">
              Loading categories...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <ProductCategoryList
              title="Import Categories"
              type="IMPORT"
              items={importCategories}
            />

            <ProductCategoryList
              title="Export Categories"
              type="EXPORT"
              items={exportCategories}
            />

            {/* BLOG CATEGORY — SAME FUNCTION, PINK THEME */}
            <BlogCategoryList />
          </div>
        )}
      </div>

      {/* PRODUCT CATEGORY MODAL */}

      {showProductForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                  {editingId
                    ? "Edit Category"
                    : "New Category"}
                </p>

                <h2 className="mt-2 text-2xl font-black text-[var(--foreground)]">
                  {editingId
                    ? "Update Category"
                    : "Add Category"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForms}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[var(--foreground)]/60 transition hover:text-red-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={saveProductCategory}
              className="mt-7 space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm font-bold text-[var(--foreground)]">
                  Category Name *
                </label>

                <input
                  type="text"
                  value={productForm.name}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      name: event.target.value,
                    })
                  }
                  placeholder="Example: Electronics"
                  className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-sm text-[var(--foreground)] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[var(--foreground)]">
                  Category Type *
                </label>

                <select
                  value={productForm.type}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      type:
                        event.target.value as ProductType,
                    })
                  }
                  className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="IMPORT">
                    Import
                  </option>
                  <option value="EXPORT">
                    Export
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[var(--foreground)]">
                  Description
                </label>

                <textarea
                  value={productForm.description}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      description:
                        event.target.value,
                    })
                  }
                  rows={4}
                  placeholder="Optional category description..."
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm leading-6 text-[var(--foreground)] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                <input
                  type="checkbox"
                  checked={productForm.active}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      active:
                        event.target.checked,
                    })
                  }
                  className="h-5 w-5 rounded text-blue-600"
                />

                <div>
                  <p className="font-bold text-[var(--foreground)]">
                    Active Category
                  </p>

                  <p className="mt-1 text-xs text-[var(--foreground)]/45">
                    Active categories appear in the product form.
                  </p>
                </div>
              </label>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForms}
                  disabled={saving}
                  className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-bold text-[var(--foreground)] transition hover:border-blue-500"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Category"
                      : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BLOG CATEGORY MODAL — PINK */}

      {showBlogForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] border border-fuchsia-500/20 bg-[var(--surface)] p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-fuchsia-500">
                  {editingBlogId
                    ? "Edit Blog Category"
                    : "New Blog Category"}
                </p>

                <h2 className="mt-2 text-2xl font-black text-[var(--foreground)]">
                  {editingBlogId
                    ? "Update Blog Category"
                    : "Add Blog Category"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForms}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[var(--foreground)]/60 transition hover:text-fuchsia-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={saveBlogCategory}
              className="mt-7 space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm font-bold text-[var(--foreground)]">
                  Category Name *
                </label>

                <input
                  type="text"
                  value={blogForm.name}
                  onChange={(event) => {
                    const value =
                      event.target.value;

                    setBlogForm({
                      ...blogForm,
                      name: value,
                      slug: editingBlogId
                        ? blogForm.slug
                        : slugify(value),
                    });
                  }}
                  placeholder="Example: Market Trends"
                  className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-sm text-[var(--foreground)] outline-none focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[var(--foreground)]">
                  Slug *
                </label>

                <input
                  type="text"
                  value={blogForm.slug}
                  onChange={(event) =>
                    setBlogForm({
                      ...blogForm,
                      slug: slugify(
                        event.target.value
                      ),
                    })
                  }
                  placeholder="market-trends"
                  className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-sm text-[var(--foreground)] outline-none focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[var(--foreground)]">
                  Description
                </label>

                <textarea
                  value={blogForm.description}
                  onChange={(event) =>
                    setBlogForm({
                      ...blogForm,
                      description:
                        event.target.value,
                    })
                  }
                  rows={4}
                  placeholder="Optional Blog category description..."
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm leading-6 text-[var(--foreground)] outline-none focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-fuchsia-500/15 bg-fuchsia-500/5 p-4">
                <input
                  type="checkbox"
                  checked={blogForm.active}
                  onChange={(event) =>
                    setBlogForm({
                      ...blogForm,
                      active:
                        event.target.checked,
                    })
                  }
                  className="h-5 w-5 rounded accent-fuchsia-500"
                />

                <div>
                  <p className="font-bold text-[var(--foreground)]">
                    Active Blog Category
                  </p>

                  <p className="mt-1 text-xs text-[var(--foreground)]/45">
                    Active Blog categories will appear in the Blog article category dropdown.
                  </p>
                </div>
              </label>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForms}
                  disabled={saving}
                  className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-bold text-[var(--foreground)] transition hover:border-fuchsia-500"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-gradient-to-r from-fuchsia-600 to-pink-500 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-fuchsia-600/20 disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingBlogId
                      ? "Update Blog Category"
                      : "Create Blog Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
