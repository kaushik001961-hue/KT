"use client";

import {
  CheckCircle2,
  Eye,
  Filter,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type EnquiryStatus =
  | "NEW"
  | "CONTACTED"
  | "CLOSED";

type ProductType = "IMPORT" | "EXPORT";

type Enquiry = {
  id: string;
  productName: string;
  productType: ProductType;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  country: string | null;
  quantity: string | null;
  message: string | null;
  status: EnquiryStatus;
  createdAt: string;
  updatedAt: string;
};

type Counts = {
  NEW: number;
  CONTACTED: number;
  CLOSED: number;
};

const initialCounts: Counts = {
  NEW: 0,
  CONTACTED: 0,
  CLOSED: 0,
};

function statusLabel(status: EnquiryStatus) {
  if (status === "NEW") return "New";
  if (status === "CONTACTED") return "Contacted";
  return "Closed";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusClasses(status: EnquiryStatus) {
  if (status === "NEW") {
    return "bg-blue-500/10 text-blue-600";
  }

  if (status === "CONTACTED") {
    return "bg-amber-500/10 text-amber-600";
  }

  return "bg-emerald-500/10 text-emerald-600";
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>(
    []
  );

  const [counts, setCounts] =
    useState<Counts>(initialCounts);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState<
    EnquiryStatus | "ALL"
  >("ALL");

  const [productType, setProductType] = useState<
    ProductType | "ALL"
  >("ALL");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [selectedEnquiry, setSelectedEnquiry] =
    useState<Enquiry | null>(null);

  const [actionLoading, setActionLoading] =
    useState(false);

  async function loadEnquiries() {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (status !== "ALL") {
        params.set("status", status);
      }

      if (productType !== "ALL") {
        params.set("productType", productType);
      }

      const response = await fetch(
        `/api/admin/enquiries?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to load enquiries."
        );
      }

      setEnquiries(result.enquiries || []);

      setCounts(
        result.counts || initialCounts
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load enquiries."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEnquiries();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, status, productType]);

  const totalCount = useMemo(
    () =>
      counts.NEW +
      counts.CONTACTED +
      counts.CLOSED,
    [counts]
  );

  function clearFilters() {
    setSearch("");
    setStatus("ALL");
    setProductType("ALL");
  }

  const hasFilters =
    Boolean(search.trim()) ||
    status !== "ALL" ||
    productType !== "ALL";

  /* =========================================================
     UPDATE STATUS
  ========================================================= */

  async function updateStatus(
    enquiry: Enquiry,
    newStatus: EnquiryStatus
  ) {
    if (enquiry.status === newStatus) {
      return;
    }

    setActionLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/enquiries/${enquiry.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to update enquiry."
        );
      }

      setSelectedEnquiry(
        result.enquiry || {
          ...enquiry,
          status: newStatus,
        }
      );

      await loadEnquiries();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update enquiry."
      );
    } finally {
      setActionLoading(false);
    }
  }

  /* =========================================================
     DELETE
  ========================================================= */

  async function deleteEnquiry(
    enquiry: Enquiry
  ) {
    const confirmed = window.confirm(
      `Are you sure you want to delete the enquiry from ${enquiry.name}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setActionLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/enquiries/${enquiry.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to delete enquiry."
        );
      }

      setSelectedEnquiry(null);

      await loadEnquiries();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete enquiry."
      );
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] p-5 transition-colors duration-300 sm:p-8">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              KRUPALI TRADERS PRIVATE LIMITED
            </p>

            <h1 className="mt-1 text-3xl font-black tracking-tight text-[var(--foreground)]">
              Enquiries
            </h1>

            <p className="mt-2 text-sm text-[var(--foreground)]/55">
              Manage customer and product enquiries.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadEnquiries}
              disabled={loading}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-bold text-[var(--foreground)] transition hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading ? "animate-spin" : ""
                }`}
              />

              Refresh
            </button>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]/40">
                Total Enquiries
              </p>

              <p className="mt-1 text-2xl font-black text-[var(--foreground)]">
                {totalCount}
              </p>
            </div>
          </div>
        </div>

       {/* =====================================================
    STATUS CARDS
===================================================== */}

<section className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-3">

  {/* NEW */}

  <button
    type="button"
    onClick={() =>
      setStatus(status === "NEW" ? "ALL" : "NEW")
    }
    className={`group cursor-pointer rounded-[1.5rem] border p-4 text-left shadow-md transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl sm:p-5 ${
      status === "NEW"
        ? "border-blue-500 bg-blue-500/10 shadow-blue-500/10"
        : "border-[var(--border)] bg-[var(--surface)] hover:border-blue-500/30 hover:bg-blue-500/[0.03] hover:shadow-blue-600/10"
    }`}
  >
    <div className="flex items-center gap-4">

      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
          status === "NEW"
            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
            : "bg-blue-500/10 text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-600/25"
        }`}
      >
        <Mail className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">

        <div className="flex items-center justify-between gap-3">

          <p
            className={`text-sm font-bold transition-colors ${
              status === "NEW"
                ? "text-blue-600"
                : "text-[var(--foreground)] group-hover:text-blue-600"
            }`}
          >
            New
          </p>

          <span className="text-2xl font-black text-blue-600 transition-transform duration-300 group-hover:scale-105">
            {counts.NEW}
          </span>

        </div>

        <p className="mt-1 text-xs text-[var(--foreground)]/45">
          New enquiries awaiting attention
        </p>

      </div>

    </div>
  </button>

  {/* CONTACTED */}

  <button
    type="button"
    onClick={() =>
      setStatus(
        status === "CONTACTED"
          ? "ALL"
          : "CONTACTED"
      )
    }
    className={`group cursor-pointer rounded-[1.5rem] border p-4 text-left shadow-md transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl sm:p-5 ${
      status === "CONTACTED"
        ? "border-amber-500 bg-amber-500/10 shadow-amber-500/10"
        : "border-[var(--border)] bg-[var(--surface)] hover:border-amber-500/30 hover:bg-amber-500/[0.03] hover:shadow-amber-600/10"
    }`}
  >
    <div className="flex items-center gap-4">

      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
          status === "CONTACTED"
            ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
            : "bg-amber-500/10 text-amber-600 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-amber-500/25"
        }`}
      >
        <Phone className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">

        <div className="flex items-center justify-between gap-3">

          <p
            className={`text-sm font-bold transition-colors ${
              status === "CONTACTED"
                ? "text-amber-600"
                : "text-[var(--foreground)] group-hover:text-amber-600"
            }`}
          >
            Contacted
          </p>

          <span className="text-2xl font-black text-amber-600 transition-transform duration-300 group-hover:scale-105">
            {counts.CONTACTED}
          </span>

        </div>

        <p className="mt-1 text-xs text-[var(--foreground)]/45">
          Enquiries already contacted
        </p>

      </div>

    </div>
  </button>

  {/* CLOSED */}

  <button
    type="button"
    onClick={() =>
      setStatus(
        status === "CLOSED"
          ? "ALL"
          : "CLOSED"
      )
    }
    className={`group cursor-pointer rounded-[1.5rem] border p-4 text-left shadow-md transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl sm:p-5 ${
      status === "CLOSED"
        ? "border-emerald-500 bg-emerald-500/10 shadow-emerald-500/10"
        : "border-[var(--border)] bg-[var(--surface)] hover:border-emerald-500/30 hover:bg-emerald-500/[0.03] hover:shadow-emerald-600/10"
    }`}
  >
    <div className="flex items-center gap-4">

      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
          status === "CLOSED"
            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
            : "bg-emerald-500/10 text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-500/25"
        }`}
      >
        <CheckCircle2 className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">

        <div className="flex items-center justify-between gap-3">

          <p
            className={`text-sm font-bold transition-colors ${
              status === "CLOSED"
                ? "text-emerald-600"
                : "text-[var(--foreground)] group-hover:text-emerald-600"
            }`}
          >
            Closed
          </p>

          <span className="text-2xl font-black text-emerald-600 transition-transform duration-300 group-hover:scale-105">
            {counts.CLOSED}
          </span>

        </div>

        <p className="mt-1 text-xs text-[var(--foreground)]/45">
          Completed enquiries
        </p>

      </div>

    </div>
  </button>

</section>

        {/* =====================================================
            FILTERS
        ===================================================== */}

        <section className="mt-6 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-lg shadow-blue-900/5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground)]/35" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search name, email, company, product or country..."
                className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] pl-11 pr-4 text-sm text-[var(--foreground)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div className="relative">
              <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground)]/35" />

              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as
                      | EnquiryStatus
                      | "ALL"
                  )
                }
                className="h-12 min-w-40 appearance-none rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] pl-11 pr-8 text-sm font-semibold text-[var(--foreground)] outline-none transition focus:border-blue-500"
              >
                <option value="ALL">
                  All Status
                </option>

                <option value="NEW">
                  New
                </option>

                <option value="CONTACTED">
                  Contacted
                </option>

                <option value="CLOSED">
                  Closed
                </option>
              </select>
            </div>

            <select
              value={productType}
              onChange={(event) =>
                setProductType(
                  event.target.value as
                    | ProductType
                    | "ALL"
                )
              }
              className="h-12 min-w-40 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-sm font-semibold text-[var(--foreground)] outline-none transition focus:border-blue-500"
            >
              <option value="ALL">
                All Products
              </option>

              <option value="IMPORT">
                Import
              </option>

              <option value="EXPORT">
                Export
              </option>
            </select>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[var(--border)] px-4 text-sm font-bold text-[var(--foreground)] transition hover:border-red-500 hover:text-red-600"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            )}

          </div>
        </section>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* =====================================================
            TABLE
        ===================================================== */}

        <section className="mt-6 overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-lg shadow-blue-900/5">

          {loading ? (
            <div className="flex min-h-80 items-center justify-center">
              <div className="flex items-center gap-3 text-sm font-semibold text-[var(--foreground)]/50">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                Loading enquiries...
              </div>
            </div>
          ) : enquiries.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
              <Mail className="h-12 w-12 text-[var(--foreground)]/20" />

              <h2 className="mt-4 text-xl font-black text-[var(--foreground)]">
                No enquiries found
              </h2>

              <p className="mt-2 max-w-md text-sm text-[var(--foreground)]/45">
                There are no enquiries matching your
                current search and filters.
              </p>
            </div>
          ) : (
            <>
              {/* =================================================
                  DESKTOP TABLE
              ================================================= */}

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)]">

                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-[var(--foreground)]/45">
                        Customer
                      </th>

                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-[var(--foreground)]/45">
                        Product
                      </th>

                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-[var(--foreground)]/45">
                        Contact
                      </th>

                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-[var(--foreground)]/45">
                        Type
                      </th>

                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-[var(--foreground)]/45">
                        Status
                      </th>

                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-[var(--foreground)]/45">
                        Date
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-[var(--foreground)]/45">
                        Action
                      </th>

                    </tr>
                  </thead>

                  <tbody>
                    {enquiries.map((enquiry) => (
                      <tr
                        key={enquiry.id}
                        className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-soft)]"
                      >

                        <td className="px-6 py-5">
                          <p className="font-bold text-[var(--foreground)]">
                            {enquiry.name}
                          </p>

                          {enquiry.company && (
                            <p className="mt-1 text-xs text-[var(--foreground)]/45">
                              {enquiry.company}
                            </p>
                          )}

                          {enquiry.country && (
                            <p className="mt-1 text-xs text-[var(--foreground)]/45">
                              {enquiry.country}
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <p className="font-semibold text-[var(--foreground)]">
                            {enquiry.productName}
                          </p>

                          {enquiry.quantity && (
                            <p className="mt-1 text-xs text-[var(--foreground)]/45">
                              Qty: {enquiry.quantity}
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <a
                            href={`mailto:${enquiry.email}`}
                            className="block text-sm font-semibold text-blue-600 hover:underline"
                          >
                            {enquiry.email}
                          </a>

                          {enquiry.phone && (
                            <a
                              href={`tel:${enquiry.phone}`}
                              className="mt-1 flex items-center gap-1 text-xs text-[var(--foreground)]/50 hover:text-blue-600"
                            >
                              <Phone className="h-3 w-3" />
                              {enquiry.phone}
                            </a>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-black ${
                              enquiry.productType ===
                              "IMPORT"
                                ? "bg-blue-500/10 text-blue-600"
                                : "bg-purple-500/10 text-purple-600"
                            }`}
                          >
                            {enquiry.productType}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-black ${statusClasses(
                              enquiry.status
                            )}`}
                          >
                            {statusLabel(
                              enquiry.status
                            )}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-5 text-xs font-semibold text-[var(--foreground)]/50">
                          {formatDate(
                            enquiry.createdAt
                          )}
                        </td>

                        <td className="px-6 py-5 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedEnquiry(
                                enquiry
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-xs font-bold text-[var(--foreground)] transition hover:border-blue-500 hover:text-blue-600"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* =================================================
                  MOBILE
              ================================================= */}

              <div className="divide-y divide-[var(--border)] lg:hidden">
                {enquiries.map((enquiry) => (
                  <div
                    key={enquiry.id}
                    className="p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-black text-[var(--foreground)]">
                          {enquiry.name}
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[var(--foreground)]/60">
                          {enquiry.productName}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-black ${statusClasses(
                          enquiry.status
                        )}`}
                      >
                        {statusLabel(
                          enquiry.status
                        )}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      <a
                        href={`mailto:${enquiry.email}`}
                        className="block text-blue-600"
                      >
                        {enquiry.email}
                      </a>

                      {enquiry.phone && (
                        <a
                          href={`tel:${enquiry.phone}`}
                          className="block text-[var(--foreground)]/55"
                        >
                          {enquiry.phone}
                        </a>
                      )}

                      <p className="text-xs text-[var(--foreground)]/40">
                        {formatDate(
                          enquiry.createdAt
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedEnquiry(
                          enquiry
                        )
                      }
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-bold text-[var(--foreground)] transition hover:border-blue-500 hover:text-blue-600"
                    >
                      <Eye className="h-4 w-4" />
                      View Enquiry
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {/* =======================================================
          DETAILS MODAL
      ======================================================= */}

      {selectedEnquiry && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() =>
            setSelectedEnquiry(null)
          }
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl sm:p-8"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* Modal Header */}

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-blue-600">
                  Enquiry Details
                </p>

                <h2 className="mt-1 text-2xl font-black text-[var(--foreground)]">
                  {selectedEnquiry.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedEnquiry(null)
                }
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--foreground)]/60 transition hover:border-red-500 hover:text-red-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Details */}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/40">
                  Product
                </p>

                <p className="mt-1 font-bold text-[var(--foreground)]">
                  {selectedEnquiry.productName}
                </p>
              </div>

              <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/40">
                  Type
                </p>

                <p className="mt-1 font-bold text-[var(--foreground)]">
                  {selectedEnquiry.productType}
                </p>
              </div>

              <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/40">
                  Email
                </p>

                <a
                  href={`mailto:${selectedEnquiry.email}`}
                  className="mt-1 block font-bold text-blue-600"
                >
                  {selectedEnquiry.email}
                </a>
              </div>

              <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/40">
                  Phone
                </p>

                <p className="mt-1 font-bold text-[var(--foreground)]">
                  {selectedEnquiry.phone ||
                    "Not provided"}
                </p>
              </div>

              <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/40">
                  Company
                </p>

                <p className="mt-1 font-bold text-[var(--foreground)]">
                  {selectedEnquiry.company ||
                    "Not provided"}
                </p>
              </div>

              <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/40">
                  Country
                </p>

                <p className="mt-1 font-bold text-[var(--foreground)]">
                  {selectedEnquiry.country ||
                    "Not provided"}
                </p>
              </div>

              <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/40">
                  Quantity
                </p>

                <p className="mt-1 font-bold text-[var(--foreground)]">
                  {selectedEnquiry.quantity ||
                    "Not provided"}
                </p>
              </div>

              <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/40">
                  Date
                </p>

                <p className="mt-1 font-bold text-[var(--foreground)]">
                  {formatDate(
                    selectedEnquiry.createdAt
                  )}
                </p>
              </div>

            </div>

            {/* Message */}

            <div className="mt-4 rounded-2xl bg-[var(--surface-soft)] p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/40">
                Message
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--foreground)]/70">
                {selectedEnquiry.message ||
                  "No message provided."}
              </p>
            </div>

            {/* =================================================
                STATUS MANAGEMENT
            ================================================= */}

            <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">

              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />

                <p className="font-black text-[var(--foreground)]">
                  Enquiry Status
                </p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() =>
                    updateStatus(
                      selectedEnquiry,
                      "NEW"
                    )
                  }
                  className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                    selectedEnquiry.status ===
                    "NEW"
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-[var(--border)] text-blue-600 hover:border-blue-500 hover:bg-blue-500/10"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  New
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() =>
                    updateStatus(
                      selectedEnquiry,
                      "CONTACTED"
                    )
                  }
                  className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                    selectedEnquiry.status ===
                    "CONTACTED"
                      ? "border-amber-500 bg-amber-500 text-white"
                      : "border-[var(--border)] text-amber-600 hover:border-amber-500 hover:bg-amber-500/10"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  Contacted
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() =>
                    updateStatus(
                      selectedEnquiry,
                      "CLOSED"
                    )
                  }
                  className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                    selectedEnquiry.status ===
                    "CLOSED"
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-[var(--border)] text-emerald-600 hover:border-emerald-500 hover:bg-emerald-500/10"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  Closed
                </button>

              </div>

              {actionLoading && (
                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[var(--foreground)]/50">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating enquiry...
                </div>
              )}

            </div>

            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="mt-6 flex flex-wrap gap-3">

              <a
                href={`mailto:${selectedEnquiry.email}`}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                <Mail className="h-4 w-4" />
                Email Customer
              </a>

              {selectedEnquiry.phone && (
                <a
                  href={`tel:${selectedEnquiry.phone}`}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-5 py-3 text-sm font-bold text-[var(--foreground)] transition hover:border-blue-500 hover:text-blue-600"
                >
                  <Phone className="h-4 w-4" />
                  Call Customer
                </a>
              )}

              <button
                type="button"
                disabled={actionLoading}
                onClick={() =>
                  deleteEnquiry(selectedEnquiry)
                }
                className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-600 transition hover:border-red-500 hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}

                Delete Enquiry
              </button>

            </div>

          </div>
        </div>
      )}
    </main>
  );
}