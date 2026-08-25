"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  CheckCircle2,
  ChevronDown,
  Eye,
  FileText,
  Filter,
  Loader2,
  Mail,
  MessageCircle,
  Package,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type RFQStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "QUOTE_SENT"
  | "NEGOTIATION"
  | "WON"
  | "LOST";

type ProductType =
  | "IMPORT"
  | "EXPORT";

type RFQ = {
  id: string;
  rfqNumber: string;

  productId: string | null;

  productName: string;
  productType: ProductType;

  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  country: string | null;

  destinationPort: string | null;

  quantity: string | null;
  unit: string | null;

  packaging: string | null;
  incoterm: string | null;

  requiredDeliveryDate: string | null;

  requirements: string | null;

  status: RFQStatus;

  createdAt: string;
  updatedAt: string;

  product?: {
    id: string;
    name: string;
    slug: string;
    type: ProductType;
  } | null;
};

type Counts = {
  TOTAL: number;
  NEW: number;
  CONTACTED: number;
  QUALIFIED: number;
  QUOTE_SENT: number;
  NEGOTIATION: number;
  WON: number;
  LOST: number;
};

/* =========================================================
   STATUS CONFIG
========================================================= */

const STATUS_CONFIG: Record<
  RFQStatus,
  {
    label: string;
    className: string;
    dot: string;
  }
> = {
  NEW: {
    label: "New",
    className:
      "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
  },

  CONTACTED: {
    label: "Contacted",
    className:
      "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },

  QUALIFIED: {
    label: "Qualified",
    className:
      "border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400",
    dot: "bg-violet-500",
  },

  QUOTE_SENT: {
    label: "Quote Sent",
    className:
      "border-cyan-500/20 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    dot: "bg-cyan-500",
  },

  NEGOTIATION: {
    label: "Negotiation",
    className:
      "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400",
    dot: "bg-orange-500",
  },

  WON: {
    label: "Won",
    className:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },

  LOST: {
    label: "Lost",
    className:
      "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
    dot: "bg-red-500",
  },
};

/* =========================================================
   MAIN PAGE
========================================================= */

export default function AdminRFQsPage() {

    const router = useRouter();
  const [rfqs, setRfqs] =
    useState<RFQ[]>([]);

  const [counts, setCounts] =
    useState<Counts>({
      TOTAL: 0,
      NEW: 0,
      CONTACTED: 0,
      QUALIFIED: 0,
      QUOTE_SENT: 0,
      NEGOTIATION: 0,
      WON: 0,
      LOST: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<RFQStatus | "ALL">("ALL");

  const [productTypeFilter, setProductTypeFilter] =
    useState<ProductType | "ALL">("ALL");

  const [selectedRFQ, setSelectedRFQ] =
    useState<RFQ | null>(null);

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  /* =======================================================
     LOAD RFQs
  ======================================================= */

  const loadRFQs = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const params =
          new URLSearchParams();

        if (search.trim()) {
          params.set(
            "search",
            search.trim()
          );
        }

        if (statusFilter !== "ALL") {
          params.set(
            "status",
            statusFilter
          );
        }

        if (
          productTypeFilter !== "ALL"
        ) {
          params.set(
            "productType",
            productTypeFilter
          );
        }

        const response =
          await fetch(
            `/api/admin/rfqs?${params.toString()}`,
            {
              cache: "no-store",
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Unable to load RFQs."
          );
        }

        setRfqs(
          Array.isArray(result.rfqs)
            ? result.rfqs
            : []
        );

        setCounts(
          result.counts || {
            TOTAL: 0,
            NEW: 0,
            CONTACTED: 0,
            QUALIFIED: 0,
            QUOTE_SENT: 0,
            NEGOTIATION: 0,
            WON: 0,
            LOST: 0,
          }
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load RFQs."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      search,
      statusFilter,
      productTypeFilter,
    ]
  );

  useEffect(() => {
    const timer =
      setTimeout(() => {
        loadRFQs();
      }, 250);

    return () =>
      clearTimeout(timer);
  }, [loadRFQs]);

  /* =======================================================
     STATUS UPDATE
  ======================================================= */

  async function updateStatus(
    id: string,
    status: RFQStatus
  ) {
    try {
      setUpdatingId(id);
      setError("");

      const response =
        await fetch(
          `/api/admin/rfqs/${id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              status,
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to update RFQ."
        );
      }

      setRfqs((current) =>
        current.map((rfq) =>
          rfq.id === id
            ? {
                ...rfq,
                status,
              }
            : rfq
        )
      );

      setSelectedRFQ((current) =>
        current?.id === id
          ? {
              ...current,
              status,
            }
          : current
      );

      await loadRFQs(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update RFQ."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  /* =======================================================
     DELETE
  ======================================================= */

  async function deleteRFQ(
    rfq: RFQ
  ) {
    const confirmed =
      window.confirm(
        `Delete ${rfq.rfqNumber}?\n\nThis action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(rfq.id);
      setError("");

      const response =
        await fetch(
          `/api/admin/rfqs/${rfq.id}`,
          {
            method: "DELETE",
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to delete RFQ."
        );
      }

      setRfqs((current) =>
        current.filter(
          (item) =>
            item.id !== rfq.id
        )
      );

      if (
        selectedRFQ?.id === rfq.id
      ) {
        setSelectedRFQ(null);
      }

      await loadRFQs(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete RFQ."
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* =======================================================
     FILTERED DATA
  ======================================================= */

  const visibleRFQs = useMemo(
    () => rfqs,
    [rfqs]
  );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-[var(--background)] p-4 transition-colors duration-300 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)]/90 p-5 shadow-xl shadow-blue-900/5 backdrop-blur-xl sm:p-6">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                KRUPALI TRADERS PRIVATE LIMITED
              </p>

              <h1 className="mt-1 text-2xl font-black tracking-tight text-[var(--foreground)] sm:text-3xl">
                Request for Quotes
              </h1>

              <p className="mt-1 text-sm text-[var(--foreground)]/60">
                Manage buyer quotation requests and sales opportunities.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                loadRFQs(true)
              }
              disabled={refreshing}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-5 py-3 text-sm font-bold text-[var(--foreground)] transition hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}

              Refresh
            </button>

          </div>

        </header>

        {/* =================================================
            STATUS CARDS
        ================================================= */}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <CountCard
            label="Total RFQs"
            value={counts.TOTAL}
            icon={FileText}
            active={
              statusFilter === "ALL"
            }
            onClick={() =>
              setStatusFilter("ALL")
            }
          />

          <CountCard
            label="New"
            value={counts.NEW}
            icon={FileText}
            status="NEW"
            active={
              statusFilter === "NEW"
            }
            onClick={() =>
              setStatusFilter(
                statusFilter === "NEW"
                  ? "ALL"
                  : "NEW"
              )
            }
          />

          <CountCard
            label="Contacted"
            value={counts.CONTACTED}
            icon={MessageCircle}
            status="CONTACTED"
            active={
              statusFilter === "CONTACTED"
            }
            onClick={() =>
              setStatusFilter(
                statusFilter ===
                "CONTACTED"
                  ? "ALL"
                  : "CONTACTED"
              )
            }
          />

          <CountCard
            label="Qualified"
            value={counts.QUALIFIED}
            icon={CheckCircle2}
            status="QUALIFIED"
            active={
              statusFilter === "QUALIFIED"
            }
            onClick={() =>
              setStatusFilter(
                statusFilter ===
                "QUALIFIED"
                  ? "ALL"
                  : "QUALIFIED"
              )
            }
          />

          <CountCard
            label="Quote Sent"
            value={counts.QUOTE_SENT}
            icon={Mail}
            status="QUOTE_SENT"
            active={
              statusFilter ===
              "QUOTE_SENT"
            }
            onClick={() =>
              setStatusFilter(
                statusFilter ===
                "QUOTE_SENT"
                  ? "ALL"
                  : "QUOTE_SENT"
              )
            }
          />

          <CountCard
            label="Negotiation"
            value={counts.NEGOTIATION}
            icon={MessageCircle}
            status="NEGOTIATION"
            active={
              statusFilter ===
              "NEGOTIATION"
            }
            onClick={() =>
              setStatusFilter(
                statusFilter ===
                "NEGOTIATION"
                  ? "ALL"
                  : "NEGOTIATION"
              )
            }
          />

          <CountCard
            label="Won"
            value={counts.WON}
            icon={CheckCircle2}
            status="WON"
            active={
              statusFilter === "WON"
            }
            onClick={() =>
              setStatusFilter(
                statusFilter === "WON"
                  ? "ALL"
                  : "WON"
              )
            }
          />

          <CountCard
            label="Lost"
            value={counts.LOST}
            icon={Trash2}
            status="LOST"
            active={
              statusFilter === "LOST"
            }
            onClick={() =>
              setStatusFilter(
                statusFilter === "LOST"
                  ? "ALL"
                  : "LOST"
              )
            }
          />

        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mt-6 flex items-start justify-between gap-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-600 dark:text-red-400">

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </button>

          </div>
        )}

        {/* =================================================
            FILTERS
        ================================================= */}

        <section className="mt-8 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-lg shadow-blue-900/5">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

            {/* Search */}

            <div className="relative flex-1">

              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground)]/40" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search RFQ, buyer, company, product or country..."
                className="w-full rounded-full border border-[var(--border)] bg-[var(--background)] py-3 pl-11 pr-4 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--foreground)]/35 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />

            </div>

            {/* Product type */}

            <div className="relative">

              <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground)]/40" />

              <select
                value={
                  productTypeFilter
                }
                onChange={(event) =>
                  setProductTypeFilter(
                    event.target.value as
                      | ProductType
                      | "ALL"
                  )
                }
                className="w-full appearance-none rounded-full border border-[var(--border)] bg-[var(--background)] py-3 pl-11 pr-10 text-sm font-semibold text-[var(--foreground)] outline-none transition focus:border-blue-500 sm:w-48"
              >
                <option value="ALL">
                  All Types
                </option>

                <option value="IMPORT">
                  Import
                </option>

                <option value="EXPORT">
                  Export
                </option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground)]/40" />

            </div>

            {/* Status */}

            <div className="relative">

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as
                      | RFQStatus
                      | "ALL"
                  )
                }
                className="w-full appearance-none rounded-full border border-[var(--border)] bg-[var(--background)] py-3 pl-4 pr-10 text-sm font-semibold text-[var(--foreground)] outline-none transition focus:border-blue-500 sm:w-52"
              >
                <option value="ALL">
                  All Statuses
                </option>

                <option value="NEW">
                  New
                </option>

                <option value="CONTACTED">
                  Contacted
                </option>

                <option value="QUALIFIED">
                  Qualified
                </option>

                <option value="QUOTE_SENT">
                  Quote Sent
                </option>

                <option value="NEGOTIATION">
                  Negotiation
                </option>

                <option value="WON">
                  Won
                </option>

                <option value="LOST">
                  Lost
                </option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground)]/40" />

            </div>

          </div>

        </section>

        {/* =================================================
            RFQ TABLE
        ================================================= */}

        <section className="mt-6 overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-lg shadow-blue-900/5">

          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4 sm:px-6">

            <div>
              <h2 className="font-bold text-[var(--foreground)]">
                RFQ Requests
              </h2>

              <p className="mt-0.5 text-xs text-[var(--foreground)]/50">
                {visibleRFQs.length} request
                {visibleRFQs.length === 1
                  ? ""
                  : "s"} found
              </p>
            </div>

          </div>

          {loading ? (
            <LoadingState />
          ) : visibleRFQs.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* DESKTOP */}

              <div className="hidden overflow-x-auto md:block">

                <table className="w-full min-w-[1100px]">

                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-left text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/45">

                      <th className="px-6 py-4">
                        RFQ
                      </th>

                      <th className="px-6 py-4">
                        Product
                      </th>

                      <th className="px-6 py-4">
                        Buyer
                      </th>

                      <th className="px-6 py-4">
                        Country
                      </th>

                      <th className="px-6 py-4">
                        Quantity
                      </th>

                      <th className="px-6 py-4">
                        Type
                      </th>

                      <th className="px-6 py-4">
                        Status
                      </th>

                      <th className="px-6 py-4">
                        Date
                      </th>

                      <th className="px-6 py-4 text-right">
                        Action
                      </th>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[var(--border)]">

                    {visibleRFQs.map(
                      (rfq) => (
                        <tr
                          key={rfq.id}
                          className="group transition duration-200 hover:bg-blue-500/[0.035]"
                        >

                          <td className="px-6 py-5">

                            <div className="font-bold text-[var(--foreground)]">
                              {rfq.rfqNumber}
                            </div>

                            <div className="mt-1 text-xs text-[var(--foreground)]/40">
                              {formatDate(
                                rfq.createdAt
                              )}
                            </div>

                          </td>

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-3">

                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <Package className="h-4 w-4" />
                              </div>

                              <div className="min-w-0">

                                <div className="max-w-[180px] truncate font-semibold text-[var(--foreground)]">
                                  {rfq.productName}
                                </div>

                              </div>

                            </div>

                          </td>

                          <td className="px-6 py-5">

                            <div className="font-semibold text-[var(--foreground)]">
                              {rfq.name}
                            </div>

                            {rfq.company && (
                              <div className="mt-1 text-xs text-[var(--foreground)]/50">
                                {rfq.company}
                              </div>
                            )}

                          </td>

                          <td className="px-6 py-5 text-sm text-[var(--foreground)]/65">
                            {rfq.country ||
                              "—"}
                          </td>

                          <td className="px-6 py-5 text-sm font-semibold text-[var(--foreground)]">
                            {rfq.quantity ||
                              "—"}

                            {rfq.unit &&
                              ` ${rfq.unit}`}
                          </td>

                          <td className="px-6 py-5">

                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${
                                rfq.productType ===
                                "EXPORT"
                                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              }`}
                            >
                              {rfq.productType}
                            </span>

                          </td>

                          <td className="px-6 py-5">
                            <StatusBadge
                              status={
                                rfq.status
                              }
                            />
                          </td>

                          <td className="px-6 py-5 text-sm text-[var(--foreground)]/55">
                            {formatDate(
                              rfq.createdAt
                            )}
                          </td>

                          <td className="px-6 py-5">

                            <div className="flex justify-end gap-2">

                             <ActionButton
  title="View RFQ"
  onClick={() =>
    router.push(`/admin/rfqs/${rfq.id}`)
  }
>
  <Eye className="h-4 w-4" />
</ActionButton>

                              <ActionButton
                                title="Delete RFQ"
                                danger
                                loading={
                                  deletingId ===
                                  rfq.id
                                }
                                onClick={() =>
                                  deleteRFQ(
                                    rfq
                                  )
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </ActionButton>

                            </div>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

              {/* MOBILE */}

              <div className="divide-y divide-[var(--border)] md:hidden">

                {visibleRFQs.map(
                  (rfq) => (
                    <div
                      key={rfq.id}
                      className="p-5 transition hover:bg-blue-500/[0.035]"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div>
                          <div className="font-bold text-[var(--foreground)]">
                            {rfq.rfqNumber}
                          </div>

                          <div className="mt-1 text-xs text-[var(--foreground)]/45">
                            {formatDate(
                              rfq.createdAt
                            )}
                          </div>
                        </div>

                        <StatusBadge
                          status={
                            rfq.status
                          }
                        />

                      </div>

                      <div className="mt-5">

                        <div className="font-semibold text-[var(--foreground)]">
                          {rfq.productName}
                        </div>

                        <div className="mt-1 text-sm text-[var(--foreground)]/55">
                          {rfq.name}
                          {rfq.company
                            ? ` • ${rfq.company}`
                            : ""}
                        </div>

                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">

                        <MiniInfo
                          label="Country"
                          value={
                            rfq.country ||
                            "—"
                          }
                        />

                        <MiniInfo
                          label="Quantity"
                          value={
                            `${rfq.quantity || "—"}${rfq.unit ? ` ${rfq.unit}` : ""}`
                          }
                        />

                        <MiniInfo
                          label="Type"
                          value={
                            rfq.productType
                          }
                        />

                        <MiniInfo
                          label="Port"
                          value={
                            rfq.destinationPort ||
                            "—"
                          }
                        />

                      </div>

                      <div className="mt-5 flex gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedRFQ(
                              rfq
                            )
                          }
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-blue-500/10 px-4 py-2.5 text-sm font-bold text-blue-600 transition hover:bg-blue-500/15 dark:text-blue-400"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>

                        <button
                          type="button"
                          disabled={
                            deletingId ===
                            rfq.id
                          }
                          onClick={() =>
                            deleteRFQ(
                              rfq
                            )
                          }
                          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-red-500/20 bg-red-500/5 text-red-600 transition hover:bg-red-500/10 disabled:opacity-50 dark:text-red-400"
                          title="Delete"
                        >
                          {deletingId ===
                          rfq.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>

                      </div>

                    </div>
                  )
                )}

              </div>
            </>
          )}

        </section>

      </div>

      {/* =====================================================
          RFQ DETAIL MODAL
      ===================================================== */}

      {selectedRFQ && (
        <RFQModal
          rfq={selectedRFQ}
          updating={
            updatingId ===
            selectedRFQ.id
          }
          onClose={() =>
            setSelectedRFQ(null)
          }
          onStatusChange={(
            status
          ) =>
            updateStatus(
              selectedRFQ.id,
              status
            )
          }
          onDelete={() =>
            deleteRFQ(selectedRFQ)
          }
        />
      )}
    </main>
  );
}

/* =========================================================
   COUNT CARD
========================================================= */

function CountCard({
  label,
  value,
  icon: Icon,
  status,
  active,
  onClick,
}: {
  label: string;
  value: number;
  icon: typeof FileText;
  status?: RFQStatus;
  active: boolean;
  onClick: () => void;
}) {
  const colors = status
    ? STATUS_CONFIG[status]
    : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full rounded-[1.5rem] border bg-[var(--surface)] p-5 text-left shadow-lg shadow-blue-900/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
        active
          ? "border-blue-500/40 ring-2 ring-blue-500/10"
          : "border-[var(--border)]"
      }`}
    >

      <div className="flex items-center justify-between">

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            colors
              ? colors.className
              : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <span className="text-2xl font-black text-[var(--foreground)]">
          {value}
        </span>

      </div>

      <p className="mt-4 text-sm font-semibold text-[var(--foreground)]/55">
        {label}
      </p>

    </button>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status: RFQStatus;
}) {
  const config =
    STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${config.className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
      />

      {config.label}
    </span>
  );
}

/* =========================================================
   ACTION BUTTON
========================================================= */

function ActionButton({
  children,
  title,
  onClick,
  danger = false,
  loading = false,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  danger?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={loading}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-full border transition hover:-translate-y-0.5 ${
        danger
          ? "border-red-500/20 bg-red-500/5 text-red-600 hover:bg-red-500/10 dark:text-red-400"
          : "border-blue-500/20 bg-blue-500/5 text-blue-600 hover:bg-blue-500/10 dark:text-blue-400"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}

/* =========================================================
   MINI INFO
========================================================= */

function MiniInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)]/40">
        {label}
      </div>

      <div className="mt-1 truncate text-sm font-semibold text-[var(--foreground)]">
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingState() {
  return (
    <div className="flex min-h-64 items-center justify-center">
      <div className="flex items-center gap-3 text-sm font-semibold text-[var(--foreground)]/55">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        Loading RFQs...
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyState() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
        <FileText className="h-7 w-7" />
      </div>

      <h3 className="mt-4 font-bold text-[var(--foreground)]">
        No RFQs found
      </h3>

      <p className="mt-1 max-w-md text-sm text-[var(--foreground)]/50">
        No request for quotes match the current search and filters.
      </p>

    </div>
  );
}

/* =========================================================
   RFQ MODAL
========================================================= */

function RFQModal({
  rfq,
  updating,
  onClose,
  onStatusChange,
  onDelete,
}: {
  rfq: RFQ;
  updating: boolean;
  onClose: () => void;
  onStatusChange: (
    status: RFQStatus
  ) => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >

      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-2xl sm:max-w-4xl sm:rounded-[2rem]">

        {/* HEADER */}

        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)]/95 px-5 py-5 backdrop-blur-xl sm:px-7">

          <div>

            <div className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
              Request for Quote
            </div>

            <h2 className="mt-1 text-xl font-black text-[var(--foreground)] sm:text-2xl">
              {rfq.rfqNumber}
            </h2>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground)]/60 transition hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>

        </div>

        <div className="p-5 sm:p-7">

          {/* STATUS */}

          <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/40">
                Current Status
              </div>

              <div className="mt-2">
                <StatusBadge
                  status={rfq.status}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">

              {(
                Object.keys(
                  STATUS_CONFIG
                ) as RFQStatus[]
              ).map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={
                    updating ||
                    rfq.status === status
                  }
                  onClick={() =>
                    onStatusChange(
                      status
                    )
                  }
                  className={`rounded-full border px-3 py-2 text-xs font-bold transition ${
                    rfq.status === status
                      ? STATUS_CONFIG[
                          status
                        ].className
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]/55 hover:border-blue-500/30 hover:text-blue-600"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {STATUS_CONFIG[
                    status
                  ].label}
                </button>
              ))}

            </div>

          </div>

          {/* PRODUCT */}

          <DetailSection title="Product Information">

            <div className="grid gap-4 sm:grid-cols-2">

              <DetailItem
                label="Product"
                value={
                  rfq.productName
                }
              />

              <DetailItem
                label="Type"
                value={
                  rfq.productType
                }
              />

              {rfq.product && (
                <div className="sm:col-span-2">

                  <Link
                    href={`/products/${rfq.product.type.toLowerCase()}/${rfq.product.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline dark:text-blue-400"
                  >
                    View Product
                  </Link>

                </div>
              )}

            </div>

          </DetailSection>

          {/* BUYER */}

          <DetailSection title="Buyer Information">

            <div className="grid gap-4 sm:grid-cols-2">

              <DetailItem
                label="Name"
                value={rfq.name}
              />

              <DetailItem
                label="Company"
                value={
                  rfq.company ||
                  "—"
                }
              />

              <DetailItem
                label="Email"
                value={rfq.email}
              />

              <DetailItem
                label="Phone / WhatsApp"
                value={
                  rfq.phone ||
                  "—"
                }
              />

              <DetailItem
                label="Country"
                value={
                  rfq.country ||
                  "—"
                }
              />

              <DetailItem
                label="Destination Port"
                value={
                  rfq.destinationPort ||
                  "—"
                }
              />

            </div>

            <div className="mt-5 flex flex-wrap gap-2">

              <a
                href={`mailto:${rfq.email}`}
                className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-2.5 text-sm font-bold text-blue-600 transition hover:bg-blue-500/15 dark:text-blue-400"
              >
                <Mail className="h-4 w-4" />
                Email
              </a>

              {rfq.phone && (
                <>
                  <a
                    href={`tel:${rfq.phone}`}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2.5 text-sm font-bold text-emerald-600 transition hover:bg-emerald-500/15 dark:text-emerald-400"
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </a>

                  <a
                    href={`https://wa.me/${rfq.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-2.5 text-sm font-bold text-green-600 transition hover:bg-green-500/15"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                </>
              )}

            </div>

          </DetailSection>

          {/* REQUIREMENT */}

          <DetailSection title="Quote Requirement">

            <div className="grid gap-4 sm:grid-cols-2">

              <DetailItem
                label="Quantity"
                value={
                  `${rfq.quantity || "—"}${rfq.unit ? ` ${rfq.unit}` : ""}`
                }
              />

              <DetailItem
                label="Packaging"
                value={
                  rfq.packaging ||
                  "—"
                }
              />

              <DetailItem
                label="Incoterm"
                value={
                  rfq.incoterm ||
                  "—"
                }
              />

              <DetailItem
                label="Required Delivery"
                value={
                  rfq.requiredDeliveryDate
                    ? formatDate(
                        rfq.requiredDeliveryDate
                      )
                    : "—"
                }
              />

            </div>

          </DetailSection>

          {/* REQUIREMENTS */}

          <DetailSection title="Additional Requirements">

            <div className="whitespace-pre-line rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 text-sm leading-7 text-[var(--foreground)]/70">
              {rfq.requirements ||
                "No additional requirements provided."}
            </div>

          </DetailSection>

          {/* META */}

          <div className="mt-6 text-xs text-[var(--foreground)]/40">
            Submitted:{" "}
            {formatDate(
              rfq.createdAt
            )}
          </div>

          {/* FOOTER */}

          <div className="mt-7 flex flex-col gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-red-500/20 bg-red-500/5 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-500/10 dark:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
              Delete RFQ
            </button>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Close
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   DETAIL SECTION
========================================================= */

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-7">

      <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.12em] text-[var(--foreground)]/50">
        {title}
      </h3>

      {children}

    </section>
  );
}

/* =========================================================
   DETAIL ITEM
========================================================= */

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">

      <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)]/40">
        {label}
      </div>

      <div className="mt-1 break-words text-sm font-semibold text-[var(--foreground)]">
        {value}
      </div>

    </div>
  );
}

/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(new Date(value));
}