"use client";

import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  FileText,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  Send,
  XCircle,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type ProductType = "IMPORT" | "EXPORT";

type QuotationStatus =
  | "DRAFT"
  | "SENT"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELLED";

type Currency =
  | "USD"
  | "EUR"
  | "GBP"
  | "AED"
  | "INR";

type Quotation = {
  id: string;
  quotationNumber: string;

  rfqId: string;

  productName: string;
  productType: ProductType;

  buyerName: string;
  buyerCompany: string | null;
  buyerEmail: string;
  buyerPhone: string | null;
  buyerCountry: string | null;

  quantity: string | null;
  unit: string | null;

  unitPrice: string | number | null;
  totalAmount: string | number | null;

  currency: Currency;

  destinationPort: string | null;
  incoterm: string | null;

  paymentTerms: string | null;
  deliveryTerms: string | null;
  deliveryTime: string | null;

  validityDays: number;

  countryOfOrigin: string | null;
  packaging: string | null;

  notes: string | null;

  status: QuotationStatus;

  sentAt: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;

  createdAt: string;
  updatedAt: string;

  rfq?: {
    id: string;
    rfqNumber: string;
    productName: string;
    productType: ProductType;
    name: string;
    company: string | null;
    email: string;
    status: string;
  };
};

const STATUS_OPTIONS: {
  value: QuotationStatus;
  label: string;
}[] = [
  {
    value: "DRAFT",
    label: "Draft",
  },
  {
    value: "SENT",
    label: "Sent",
  },
  {
    value: "ACCEPTED",
    label: "Accepted",
  },
  {
    value: "REJECTED",
    label: "Rejected",
  },
  {
    value: "EXPIRED",
    label: "Expired",
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
  },
];

const STATUS_STYLES: Record<
  QuotationStatus,
  string
> = {
  DRAFT:
    "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",

  SENT:
    "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",

  ACCEPTED:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",

  REJECTED:
    "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300",

  EXPIRED:
    "border-gray-500/20 bg-gray-500/10 text-gray-700 dark:text-gray-300",

  CANCELLED:
    "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300",
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

function formatAmount(
  amount: string | number | null,
  currency: Currency
) {
  if (
    amount === null ||
    amount === undefined ||
    amount === ""
  ) {
    return "—";
  }

  const numericAmount =
    Number(amount);

  if (Number.isNaN(numericAmount)) {
    return `${amount} ${currency}`;
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(numericAmount) +
    ` ${currency}`;
}

function StatusBadge({
  status,
}: {
  status: QuotationStatus;
}) {
  const option =
    STATUS_OPTIONS.find(
      (item) =>
        item.value === status
    );

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide ${STATUS_STYLES[status]}`}
    >
      {status === "DRAFT" && (
        <Clock3 className="h-3.5 w-3.5" />
      )}

      {status === "SENT" && (
        <Send className="h-3.5 w-3.5" />
      )}

      {status === "ACCEPTED" && (
        <CheckCircle2 className="h-3.5 w-3.5" />
      )}

      {status === "REJECTED" && (
        <XCircle className="h-3.5 w-3.5" />
      )}

      {status === "EXPIRED" && (
        <Clock3 className="h-3.5 w-3.5" />
      )}

      {status === "CANCELLED" && (
        <XCircle className="h-3.5 w-3.5" />
      )}

      {option?.label || status}
    </span>
  );
}

function ProductTypeBadge({
  type,
}: {
  type: ProductType;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
        type === "EXPORT"
          ? "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300"
          : "bg-blue-500/10 text-blue-700 dark:text-blue-300"
      }`}
    >
      {type}
    </span>
  );
}

async function readJsonResponse(
  response: Response
) {
  const text =
    await response.text();

  if (!text.trim()) {
    throw new Error(
      `Server returned an empty response (${response.status}).`
    );
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error(
      "QUOTATIONS_LIST_JSON_ERROR",
      error,
      {
        status: response.status,
        contentType:
          response.headers.get(
            "content-type"
          ),
        response:
          text.slice(0, 1000),
      }
    );

    throw new Error(
      `Server returned an invalid response (${response.status}).`
    );
  }
}

export default function QuotationsPage() {
  const [quotations, setQuotations] =
    useState<Quotation[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<
      QuotationStatus | "ALL"
    >("ALL");

  const [currencyFilter, setCurrencyFilter] =
    useState<Currency | "ALL">("ALL");

  const loadQuotations =
    useCallback(
      async (
        showRefresh = false
      ) => {
        try {
          if (showRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");

          const response =
            await fetch(
              "/api/admin/quotations",
              {
                method: "GET",
                cache: "no-store",
                headers: {
                  Accept:
                    "application/json",
                },
              }
            );

          const result =
            await readJsonResponse(
              response
            );

          if (!response.ok) {
            throw new Error(
              result.message ||
                "Unable to load quotations."
            );
          }

          if (
            !Array.isArray(
              result.quotations
            )
          ) {
            throw new Error(
              "Quotation list was not returned by the API."
            );
          }

          setQuotations(
            result.quotations
          );
        } catch (err) {
          console.error(
            "LOAD_QUOTATIONS_ERROR",
            err
          );

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load quotations."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );

  useEffect(() => {
    loadQuotations();
  }, [loadQuotations]);

  const counts = useMemo(() => {
    return {
      TOTAL: quotations.length,

      DRAFT: quotations.filter(
        (item) =>
          item.status === "DRAFT"
      ).length,

      SENT: quotations.filter(
        (item) =>
          item.status === "SENT"
      ).length,

      ACCEPTED: quotations.filter(
        (item) =>
          item.status === "ACCEPTED"
      ).length,

      REJECTED: quotations.filter(
        (item) =>
          item.status === "REJECTED"
      ).length,

      EXPIRED: quotations.filter(
        (item) =>
          item.status === "EXPIRED"
      ).length,

      CANCELLED: quotations.filter(
        (item) =>
          item.status === "CANCELLED"
      ).length,
    };
  }, [quotations]);

  const filteredQuotations =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return quotations.filter(
        (quotation) => {
          if (
            statusFilter !== "ALL" &&
            quotation.status !==
              statusFilter
          ) {
            return false;
          }

          if (
            currencyFilter !== "ALL" &&
            quotation.currency !==
              currencyFilter
          ) {
            return false;
          }

          if (!normalizedSearch) {
            return true;
          }

          const searchable = [
            quotation.quotationNumber,
            quotation.productName,
            quotation.productType,
            quotation.buyerName,
            quotation.buyerCompany ||
              "",
            quotation.buyerEmail,
            quotation.buyerCountry ||
              "",
            quotation.rfq?.rfqNumber ||
              "",
          ]
            .join(" ")
            .toLowerCase();

          return searchable.includes(
            normalizedSearch
          );
        }
      );
    }, [
      quotations,
      search,
      statusFilter,
      currencyFilter,
    ]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] p-6 lg:p-8">
        <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />

            <p className="text-sm font-semibold text-[var(--foreground)]/60">
              Loading quotations...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              <FileText className="h-4 w-4" />
              Sales Management
            </div>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl">
              Quotations
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--foreground)]/60">
              Manage commercial quotations created from customer RFQs.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadQuotations(true)
            }
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-bold text-[var(--foreground)] shadow-sm transition hover:border-blue-500 hover:text-blue-600 disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </button>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-700 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <div className="font-bold">
                Unable to load quotations
              </div>

              <div className="mt-1 opacity-80">
                {error}
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <SummaryCard
            label="Total"
            value={counts.TOTAL}
            icon={FileText}
            tone="blue"
          />

          <SummaryCard
            label="Draft"
            value={counts.DRAFT}
            icon={Clock3}
            tone="amber"
          />

          <SummaryCard
            label="Sent"
            value={counts.SENT}
            icon={Send}
            tone="cyan"
          />

          <SummaryCard
            label="Accepted"
            value={counts.ACCEPTED}
            icon={CheckCircle2}
            tone="emerald"
          />

          <SummaryCard
            label="Rejected"
            value={counts.REJECTED}
            icon={XCircle}
            tone="red"
          />

          <SummaryCard
            label="Expired"
            value={counts.EXPIRED}
            icon={Clock3}
            tone="gray"
          />

          <SummaryCard
            label="Cancelled"
            value={counts.CANCELLED}
            icon={XCircle}
            tone="red"
          />

        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <section className="mt-8 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">

          <div className="flex items-center gap-2 text-sm font-black text-[var(--foreground)]">
            <Filter className="h-4 w-4 text-blue-600" />
            Search & Filters
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_220px_180px]">

            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground)]/40" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search quotation, RFQ, buyer, company, product..."
                className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] pl-11 pr-4 text-sm font-medium text-[var(--foreground)] outline-none transition placeholder:text-[var(--foreground)]/35 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | QuotationStatus
                    | "ALL"
                )
              }
              className="h-12 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-blue-500"
            >
              <option value="ALL">
                All Statuses
              </option>

              {STATUS_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>

            <select
              value={currencyFilter}
              onChange={(event) =>
                setCurrencyFilter(
                  event.target.value as
                    | Currency
                    | "ALL"
                )
              }
              className="h-12 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-blue-500"
            >
              <option value="ALL">
                All Currencies
              </option>

              <option value="USD">
                USD
              </option>

              <option value="EUR">
                EUR
              </option>

              <option value="GBP">
                GBP
              </option>

              <option value="AED">
                AED
              </option>

              <option value="INR">
                INR
              </option>
            </select>

          </div>

          <div className="mt-4 text-xs font-semibold text-[var(--foreground)]/50">
            Showing{" "}
            <span className="font-black text-[var(--foreground)]/75">
              {filteredQuotations.length}
            </span>{" "}
            of{" "}
            <span className="font-black text-[var(--foreground)]/75">
              {quotations.length}
            </span>{" "}
            quotations
          </div>

        </section>

        {/* =================================================
            QUOTATION TABLE
        ================================================= */}

        <section className="mt-6 overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-sm">

          {filteredQuotations.length ===
          0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
                <FileText className="h-7 w-7" />
              </div>

              <h2 className="mt-5 text-lg font-black text-[var(--foreground)]">
                No quotations found
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-[var(--foreground)]/55">
                Try changing your search or filters. Quotations created from RFQs will appear here.
              </p>

              {(search ||
                statusFilter !==
                  "ALL" ||
                currencyFilter !==
                  "ALL") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter(
                      "ALL"
                    );
                    setCurrencyFilter(
                      "ALL"
                    );
                  }}
                  className="mt-5 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              )}

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1050px] border-collapse">

                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-left">

                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-[var(--foreground)]/45">
                      Quotation
                    </th>

                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-[var(--foreground)]/45">
                      Buyer
                    </th>

                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-[var(--foreground)]/45">
                      Product
                    </th>

                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-[var(--foreground)]/45">
                      Amount
                    </th>

                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-[var(--foreground)]/45">
                      Status
                    </th>

                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-[var(--foreground)]/45">
                      Created
                    </th>

                    <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-[0.15em] text-[var(--foreground)]/45">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-[var(--border)]">

                  {filteredQuotations.map(
                    (quotation) => (
                      <tr
                        key={quotation.id}
                        className="group transition hover:bg-blue-500/[0.025]"
                      >

                        {/* QUOTATION */}

                        <td className="px-5 py-5 align-top">

                          <Link
                            href={`/admin/quotations/${quotation.id}`}
                            className="group/link inline-flex items-center gap-2"
                          >
                            <div>
                              <div className="font-black text-[var(--foreground)] group-hover/link:text-blue-600">
                                {
                                  quotation.quotationNumber
                                }
                              </div>

                              <div className="mt-1 text-xs text-[var(--foreground)]/45">
                                RFQ:{" "}
                                {quotation.rfq?.rfqNumber ||
                                  quotation.rfqId}
                              </div>
                            </div>

                            <ChevronRight className="h-4 w-4 text-[var(--foreground)]/25 transition group-hover/link:translate-x-1 group-hover/link:text-blue-600" />
                          </Link>

                        </td>

                        {/* BUYER */}

                        <td className="px-5 py-5 align-top">

                          <div className="font-bold text-[var(--foreground)]">
                            {
                              quotation.buyerName
                            }
                          </div>

                          {quotation.buyerCompany && (
                            <div className="mt-1 text-xs font-semibold text-[var(--foreground)]/55">
                              {
                                quotation.buyerCompany
                              }
                            </div>
                          )}

                          <div className="mt-1 max-w-[220px] truncate text-xs text-[var(--foreground)]/45">
                            {
                              quotation.buyerEmail
                            }
                          </div>

                        </td>

                        {/* PRODUCT */}

                        <td className="px-5 py-5 align-top">

                          <div className="font-bold text-[var(--foreground)]">
                            {
                              quotation.productName
                            }
                          </div>

                          <div className="mt-2">
                            <ProductTypeBadge
                              type={
                                quotation.productType
                              }
                            />
                          </div>

                        </td>

                        {/* AMOUNT */}

                        <td className="px-5 py-5 align-top">

                          <div className="font-black text-[var(--foreground)]">
                            {formatAmount(
                              quotation.totalAmount,
                              quotation.currency
                            )}
                          </div>

                          {quotation.unitPrice && (
                            <div className="mt-1 text-xs text-[var(--foreground)]/45">
                              Unit:{" "}
                              {formatAmount(
                                quotation.unitPrice,
                                quotation.currency
                              )}
                            </div>
                          )}

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-5 align-top">
                          <StatusBadge
                            status={
                              quotation.status
                            }
                          />
                        </td>

                        {/* DATE */}

                        <td className="px-5 py-5 align-top">

                          <div className="text-sm font-semibold text-[var(--foreground)]">
                            {formatDate(
                              quotation.createdAt
                            )}
                          </div>

                          <div className="mt-1 text-xs text-[var(--foreground)]/45">
                            Updated{" "}
                            {formatDate(
                              quotation.updatedAt
                            )}
                          </div>

                        </td>

                        {/* ACTION */}

                        <td className="px-5 py-5 text-right align-top">

                          <Link
                            href={`/admin/quotations/${quotation.id}`}
                            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2.5 text-xs font-black text-[var(--foreground)] transition hover:border-blue-500 hover:text-blue-600"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Link>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </div>
    </main>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof FileText;
  tone:
    | "blue"
    | "amber"
    | "cyan"
    | "emerald"
    | "red"
    | "gray";
}) {
  const styles = {
    blue: {
      icon: "bg-blue-500/10 text-blue-600",
    },

    amber: {
      icon: "bg-amber-500/10 text-amber-600",
    },

    cyan: {
      icon: "bg-cyan-500/10 text-cyan-600",
    },

    emerald: {
      icon: "bg-emerald-500/10 text-emerald-600",
    },

    red: {
      icon: "bg-red-500/10 text-red-600",
    },

    gray: {
      icon: "bg-gray-500/10 text-gray-600",
    },
  } as const;

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg">

      <div className="flex items-center justify-between">

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${styles[tone].icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="text-3xl font-black text-[var(--foreground)]">
          {value}
        </div>

      </div>

      <div className="mt-4 text-xs font-black uppercase tracking-[0.15em] text-[var(--foreground)]/45">
        {label}
      </div>

    </div>
  );
}