"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileText,
  Globe2,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Send,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

type ProductType = "IMPORT" | "EXPORT";

type RFQStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "QUOTE_SENT"
  | "NEGOTIATION"
  | "WON"
  | "LOST";

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
    status: string;
  } | null;
};

const STATUS_CONFIG: Record<
  RFQStatus,
  {
    label: string;
    description: string;
    className: string;
    dot: string;
  }
> = {
  NEW: {
    label: "New",
    description: "Newly received RFQ",
    className:
      "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
  },

  CONTACTED: {
    label: "Contacted",
    description: "Buyer has been contacted",
    className:
      "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },

  QUALIFIED: {
    label: "Qualified",
    description: "Requirement has been qualified",
    className:
      "border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400",
    dot: "bg-violet-500",
  },

  QUOTE_SENT: {
    label: "Quote Sent",
    description: "Quotation has been sent",
    className:
      "border-cyan-500/20 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    dot: "bg-cyan-500",
  },

  NEGOTIATION: {
    label: "Negotiation",
    description: "Commercial discussion in progress",
    className:
      "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400",
    dot: "bg-orange-500",
  },

  WON: {
    label: "Won",
    description: "RFQ converted successfully",
    className:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },

  LOST: {
    label: "Lost",
    description: "RFQ was not converted",
    className:
      "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
    dot: "bg-red-500",
  },
};

const STATUS_ORDER: RFQStatus[] = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "QUOTE_SENT",
  "NEGOTIATION",
  "WON",
];

export default function RFQDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id =
    typeof params.id === "string"
      ? params.id
      : "";

  const [rfq, setRFQ] =
    useState<RFQ | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [updating, setUpdating] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

    const [creatingQuotation, setCreatingQuotation] =
  useState(false);

const [quotationError, setQuotationError] =
  useState("");

  const loadRFQ = useCallback(
    async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `/api/admin/rfqs/${id}`,
            {
              cache: "no-store",
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Unable to load RFQ."
          );
        }

        setRFQ(result.rfq);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load RFQ."
        );
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    loadRFQ();
  }, [loadRFQ]);

  async function updateStatus(
    status: RFQStatus
  ) {
    if (!rfq || rfq.status === status) {
      return;
    }

    try {
      setUpdating(true);
      setError("");

      const response =
        await fetch(
          `/api/admin/rfqs/${rfq.id}`,
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

      setRFQ(result.rfq);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update RFQ."
      );
    } finally {
      setUpdating(false);
    }
  }

  async function deleteRFQ() {
    if (!rfq) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete ${rfq.rfqNumber}?\n\nThis action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
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

      router.push("/admin/rfqs");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete RFQ."
      );

      setDeleting(false);
    }
  }

async function handleCreateQuotation() {
  if (!rfq || creatingQuotation) {
    return;
  }

  try {
    setCreatingQuotation(true);
    setQuotationError("");
    setError("");

    const response = await fetch(
      "/api/admin/quotations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rfqId: rfq.id,
        }),
      }
    );

    const result = await response.json();

    if (response.status === 409) {
      if (result?.quotation?.id) {
        router.push(
          `/admin/quotations/${result.quotation.id}`
        );
        return;
      }

      throw new Error(
        result?.message ||
          "A quotation already exists for this RFQ."
      );
    }

    if (!response.ok) {
      throw new Error(
        result?.message ||
          "Unable to create quotation."
      );
    }

    if (!result?.quotation?.id) {
      throw new Error(
        "Quotation was created, but no quotation ID was returned."
      );
    }

    router.push(
      `/admin/quotations/${result.quotation.id}`
    );
  } catch (err) {
    console.error(
      "CREATE_QUOTATION_ERROR",
      err
    );

    setQuotationError(
      err instanceof Error
        ? err.message
        : "Unable to create quotation."
    );
  } finally {
    setCreatingQuotation(false);
  }
}

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="flex items-center gap-3 text-sm font-semibold text-[var(--foreground)]/60">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          Loading RFQ...
        </div>
      </main>
    );
  }

  if (error && !rfq) {
    return (
      <main className="min-h-screen bg-[var(--background)] p-5 sm:p-8">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-red-500/20 bg-red-500/5 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400">
            <X className="h-7 w-7" />
          </div>

          <h1 className="mt-5 text-xl font-black text-[var(--foreground)]">
            Unable to load RFQ
          </h1>

          <p className="mt-2 text-sm text-[var(--foreground)]/55">
            {error}
          </p>

          <Link
            href="/admin/rfqs"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to RFQs
          </Link>
        </div>
      </main>
    );
  }

  if (!rfq) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[var(--background)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            TOP NAVIGATION
        ================================================= */}

        <div className="mb-6 flex items-center justify-between gap-4">

          <Link
            href="/admin/rfqs"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-bold text-[var(--foreground)]/65 transition hover:border-blue-500 hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to RFQs
          </Link>

          <button
            type="button"
            onClick={deleteRFQ}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-500/10 disabled:opacity-50 dark:text-red-400"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}

            Delete
          </button>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-medium text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl shadow-blue-900/5 sm:p-7">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

            <div>

              <div className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                Request for Quote
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3">

                <h1 className="text-2xl font-black tracking-tight text-[var(--foreground)] sm:text-3xl">
                  {rfq.rfqNumber}
                </h1>

                <StatusBadge
                  status={rfq.status}
                />

              </div>

              <p className="mt-2 text-sm text-[var(--foreground)]/50">
                Submitted{" "}
                {formatDateTime(
                  rfq.createdAt
                )}
              </p>

            </div>

            <div className="flex flex-wrap gap-2">

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

          </div>

        </section>

        {/* =================================================
            SALES PIPELINE
        ================================================= */}

        <section className="mt-6 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-lg shadow-blue-900/5 sm:p-7">

          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <h2 className="text-lg font-black text-[var(--foreground)]">
                Sales Workflow
              </h2>

              <p className="mt-1 text-sm text-[var(--foreground)]/50">
                Move this RFQ through your sales process.
              </p>
            </div>

            {updating && (
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </div>
            )}

          </div>

          <div className="mt-7 overflow-x-auto pb-2">

            <div className="flex min-w-[760px] items-center">

              {STATUS_ORDER.map(
                (status, index) => {
                  const currentIndex =
                    STATUS_ORDER.indexOf(
                      rfq.status
                    );

                  const stepIndex =
                    STATUS_ORDER.indexOf(
                      status
                    );

                  const completed =
                    currentIndex >=
                    stepIndex;

                  const current =
                    rfq.status === status;

                  return (
                    <div
                      key={status}
                      className="flex flex-1 items-center"
                    >

                      <button
                        type="button"
                        disabled={updating}
                        onClick={() =>
                          updateStatus(
                            status
                          )
                        }
                        className="group flex min-w-0 flex-col items-center text-center"
                      >

                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition ${
                            current
                              ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                              : completed
                                ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                : "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground)]/30"
                          }`}
                        >
                          {completed ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <span className="text-xs font-black">
                              {index + 1}
                            </span>
                          )}
                        </div>

                        <span
                          className={`mt-2 text-xs font-bold ${
                            current
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-[var(--foreground)]/50"
                          }`}
                        >
                          {
                            STATUS_CONFIG[
                              status
                            ].label
                          }
                        </span>

                      </button>

                      {index <
                        STATUS_ORDER.length -
                          1 && (
                        <div
                          className={`mx-2 h-0.5 flex-1 rounded-full ${
                            currentIndex >
                            stepIndex
                              ? "bg-blue-500"
                              : "bg-[var(--border)]"
                          }`}
                        />
                      )}

                    </div>
                  );
                }
              )}

            </div>

          </div>

          {rfq.status === "LOST" && (
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600 dark:text-red-400">
              <X className="h-5 w-5 shrink-0" />
              This RFQ is currently marked as Lost.
            </div>
          )}

        </section>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">

          {/* LEFT */}

          <div className="space-y-6">

            {/* PRODUCT */}

            <DetailCard
              icon={Package}
              title="Product Information"
            >

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

              </div>

              {rfq.product && (
                <Link
                  href={`/products/${rfq.product.type.toLowerCase()}/${rfq.product.slug}`}
                  target="_blank"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline dark:text-blue-400"
                >
                  View Public Product
                  <ExternalLink className="h-4 w-4" />
                </Link>
              )}

            </DetailCard>

            {/* LOGISTICS */}

            <DetailCard
              icon={Globe2}
              title="Logistics & Commercial Terms"
            >

              <div className="grid gap-4 sm:grid-cols-2">

                <DetailItem
                  label="Destination Country"
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

            </DetailCard>

            {/* REQUIREMENTS */}

            <DetailCard
              icon={FileText}
              title="Buyer Requirements"
            >

              <div className="whitespace-pre-line rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 text-sm leading-7 text-[var(--foreground)]/70">
                {rfq.requirements ||
                  "No additional requirements were provided."}
              </div>

            </DetailCard>

          </div>

          {/* RIGHT */}

          <div className="space-y-6">

            {/* BUYER */}

            <DetailCard
              icon={UserRound}
              title="Buyer Information"
            >

              <div className="space-y-4">

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
                  label="Phone"
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

              </div>

              <div className="mt-5 grid gap-2">

                <a
                  href={`mailto:${rfq.email}`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  <Mail className="h-4 w-4" />
                  Send Email
                </a>

                {rfq.phone && (
                  <a
                    href={`https://wa.me/${rfq.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-700"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp Buyer
                  </a>
                )}

              </div>

            </DetailCard>

            {/* QUOTATION */}

           <div className="relative overflow-hidden rounded-[2rem] border border-blue-500/20 bg-gradient-to-br from-blue-600 to-cyan-500 p-6 text-white shadow-xl shadow-blue-600/15">

  <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

  <div className="relative">

    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
      <Send className="h-5 w-5" />
    </div>

    <h2 className="mt-5 text-xl font-black">
      Create Quotation
    </h2>

    <p className="mt-2 text-sm leading-6 text-white/75">
      Prepare a professional quotation for this buyer and move the RFQ to Quote Sent.
    </p>

    {quotationError && (
      <div className="mt-4 rounded-2xl border border-white/20 bg-red-500/20 px-4 py-3 text-xs font-semibold text-white">
        {quotationError}
      </div>
    )}

    <button
      type="button"
      onClick={handleCreateQuotation}
      disabled={creatingQuotation}
      className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-blue-600 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {creatingQuotation ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Creating Quotation...
        </>
      ) : (
        <>
          <FileText className="h-4 w-4" />
          Create Quotation
        </>
      )}
    </button>

    <p className="mt-3 text-center text-[11px] text-white/60">
      A quotation will be created from this RFQ and opened in the quotation builder.
    </p>

  </div>

</div>

            {/* RECORD INFO */}

            <DetailCard
              icon={MapPin}
              title="Record Information"
            >

              <div className="space-y-4">

                <DetailItem
                  label="RFQ Number"
                  value={
                    rfq.rfqNumber
                  }
                />

                <DetailItem
                  label="Created"
                  value={formatDateTime(
                    rfq.createdAt
                  )}
                />

                <DetailItem
                  label="Last Updated"
                  value={formatDateTime(
                    rfq.updatedAt
                  )}
                />

              </div>

            </DetailCard>

          </div>

        </div>

      </div>
    </main>
  );
}

/* =========================================================
   DETAIL CARD
========================================================= */

function DetailCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof FileText;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-lg shadow-blue-900/5 sm:p-6">

      <div className="mb-5 flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Icon className="h-5 w-5" />
        </div>

        <h2 className="font-black text-[var(--foreground)]">
          {title}
        </h2>

      </div>

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

      <div className="text-[10px] font-black uppercase tracking-[0.12em] text-[var(--foreground)]/40">
        {label}
      </div>

      <div className="mt-1 break-words text-sm font-semibold text-[var(--foreground)]">
        {value}
      </div>

    </div>
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
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black ${config.className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
      />

      {config.label}
    </span>
  );
}

/* =========================================================
   DATE
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

function formatDateTime(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(new Date(value));
}