"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Globe2,
  Loader2,
  Mail,
  MapPin,
  Package,
  Printer,
  Save,
  Send,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import {
  FormEvent,
  useCallback,
  useEffect,
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
    phone: string | null;
    country: string | null;
    destinationPort: string | null;
    quantity: string | null;
    unit: string | null;
    packaging: string | null;
    incoterm: string | null;
    requiredDeliveryDate: string | null;
    requirements: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
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

const CURRENCIES: Currency[] = [
  "USD",
  "EUR",
  "GBP",
  "AED",
  "INR",
];

const STATUS_STYLES: Record<
  QuotationStatus,
  string
> = {
  DRAFT:
    "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",

  SENT:
    "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",

  ACCEPTED:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",

  REJECTED:
    "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",

  EXPIRED:
    "border-gray-500/20 bg-gray-500/10 text-gray-600 dark:text-gray-400",

  CANCELLED:
    "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
};

async function readJsonResponse(
  response: Response
): Promise<any> {
  const text = await response.text();

  if (!text.trim()) {
    throw new Error(
      `Server returned an empty response (${response.status}).`
    );
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error(
      "API_RESPONSE_JSON_PARSE_ERROR",
      error,
      {
        status: response.status,
        contentType:
          response.headers.get("content-type"),
        response: text.slice(0, 1000),
      }
    );

    throw new Error(
      `Server returned an invalid response (${response.status}).`
    );
  }
}

export default function QuotationBuilderPage() {
  const params = useParams();
  const router = useRouter();

  const id =
    typeof params.id === "string"
      ? params.id
      : "";

  const [quotation, setQuotation] =
    useState<Quotation | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [form, setForm] = useState({
    quantity: "",
    unit: "",

    unitPrice: "",
    totalAmount: "",

    currency: "USD" as Currency,

    destinationPort: "",
    incoterm: "",

    paymentTerms: "",
    deliveryTerms: "",
    deliveryTime: "",

    validityDays: "30",

    countryOfOrigin: "",
    packaging: "",

    notes: "",
  });

  const loadQuotation =
    useCallback(async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `/api/admin/quotations/${id}`,
            {
              cache: "no-store",
            }
          );

        const result =
          await readJsonResponse(response);

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Unable to load quotation."
          );
        }

        const data =
          result.quotation as Quotation;

        setQuotation(data);

        setForm({
          quantity:
            data.quantity || "",

          unit:
            data.unit || "",

          unitPrice:
            data.unitPrice !== null &&
            data.unitPrice !== undefined
              ? String(data.unitPrice)
              : "",

          totalAmount:
            data.totalAmount !== null &&
            data.totalAmount !== undefined
              ? String(data.totalAmount)
              : "",

          currency:
            data.currency,

          destinationPort:
            data.destinationPort ||
            "",

          incoterm:
            data.incoterm || "",

          paymentTerms:
            data.paymentTerms ||
            "",

          deliveryTerms:
            data.deliveryTerms ||
            "",

          deliveryTime:
            data.deliveryTime ||
            "",

          validityDays:
            String(
              data.validityDays ||
                30
            ),

          countryOfOrigin:
            data.countryOfOrigin ||
            "",

          packaging:
            data.packaging ||
            "",

          notes:
            data.notes || "",
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load quotation."
        );
      } finally {
        setLoading(false);
      }
    }, [id]);

  useEffect(() => {
    loadQuotation();
  }, [loadQuotation]);

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setSuccess("");
    setError("");
  }

  function calculateTotal() {
    const price =
      Number(form.unitPrice);

    const quantity =
      Number(form.quantity);

    if (
      Number.isFinite(price) &&
      Number.isFinite(quantity) &&
      price >= 0 &&
      quantity > 0
    ) {
      updateField(
        "totalAmount",
        (price * quantity).toFixed(2)
      );
    }
  }

  async function saveQuotation(
    status?: QuotationStatus
  ) {
    if (!quotation) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response =
        await fetch(
          `/api/admin/quotations/${quotation.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              quantity:
                form.quantity,

              unit:
                form.unit,

              unitPrice:
                form.unitPrice || null,

              totalAmount:
                form.totalAmount || null,

              currency:
                form.currency,

              destinationPort:
                form.destinationPort,

              incoterm:
                form.incoterm,

              paymentTerms:
                form.paymentTerms,

              deliveryTerms:
                form.deliveryTerms,

              deliveryTime:
                form.deliveryTime,

              validityDays:
                Number(
                  form.validityDays
                ) || 30,

              countryOfOrigin:
                form.countryOfOrigin,

              packaging:
                form.packaging,

              notes:
                form.notes,

              ...(status
                ? { status }
                : {}),
            }),
          }
        );

      const result =
        await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to save quotation."
        );
      }

      setQuotation(
        result.quotation
      );

      setSuccess(
        status === "SENT"
          ? "Quotation marked as sent successfully."
          : "Quotation saved successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save quotation."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    await saveQuotation();
  }

  async function deleteQuotation() {
    if (!quotation) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete ${quotation.quotationNumber}?\n\nThis action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      const response =
        await fetch(
          `/api/admin/quotations/${quotation.id}`,
          {
            method: "DELETE",
          }
        );

      const result =
        await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to delete quotation."
        );
      }

      router.push("/admin/rfqs");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete quotation."
      );

      setDeleting(false);
    }
  }

  function handlePrintQuotation() {
    if (typeof window === "undefined") {
      return;
    }

    setError("");
    setSuccess("");

    window.print();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="flex items-center gap-3 text-sm font-semibold text-[var(--foreground)]/60">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          Loading quotation...
        </div>
      </main>
    );
  }

  if (!quotation) {
    return (
      <main className="min-h-screen bg-[var(--background)] p-6">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-red-500/20 bg-red-500/5 p-8 text-center">

          <X className="mx-auto h-10 w-10 text-red-600" />

          <h1 className="mt-4 text-xl font-black text-[var(--foreground)]">
            Quotation not found
          </h1>

          <p className="mt-2 text-sm text-[var(--foreground)]/55">
            {error ||
              "The requested quotation could not be found."}
          </p>

          <Link
            href="/admin/rfqs"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to RFQs
          </Link>

        </div>
      </main>
    );
  }

  return (
    <>
      <style jsx global>{`
        .quotation-print-preview {
          display: block;
        }

        @media print {
          @page {
            size: A4;
            margin: 0;
          }

          html,
          body {
            background: #ffffff !important;
            color: #111827 !important;
          }

          body {
            margin: 0 !important;
          }

          .print-hidden,
          aside,
          nav {
            display: none !important;
          }

          main {
            min-height: auto !important;
            padding: 0 !important;
            background: #ffffff !important;
          }

          main > div {
            max-width: none !important;
            margin: 0 !important;
          }

          main > div > form {
            display: none !important;
          }

          .quotation-print-preview {
            display: block !important;
            max-width: none !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: 0 !important;
          }

          .quotation-print-preview > div {
            min-height: 297mm;
            padding: 12mm !important;
          }
        }
      `}</style>

      <main className="min-h-screen bg-[var(--background)] p-4 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-3">

            <Link
              href={`/admin/rfqs/${quotation.rfqId}`}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]/60 transition hover:border-blue-500 hover:text-blue-600"
              title="Back to RFQ"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div>

              <div className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                Quotation Builder
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-3">

                <h1 className="text-2xl font-black tracking-tight text-[var(--foreground)] sm:text-3xl">
                  {quotation.quotationNumber}
                </h1>

                <StatusBadge
                  status={quotation.status}
                />

              </div>

              <p className="mt-1 text-sm text-[var(--foreground)]/50">
                RFQ:{" "}
                {quotation.rfq?.rfqNumber ||
                  quotation.rfqId}
              </p>

            </div>

          </div>

          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={() =>
                saveQuotation()
              }
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-bold text-[var(--foreground)] transition hover:border-blue-500 hover:text-blue-600 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}

              Save Draft
            </button>

            <button
              type="button"
              onClick={() =>
                saveQuotation("SENT")
              }
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}

              Mark as Sent
            </button>

            <button
              type="button"
              onClick={handlePrintQuotation}
              className="print-hidden inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 text-sm font-bold text-emerald-600 transition hover:bg-emerald-500/10 dark:text-emerald-400"
            >
              <Printer className="h-4 w-4" />
              Print / PDF
            </button>

            <button
              type="button"
              onClick={deleteQuotation}
              disabled={deleting}
              className="print-hidden inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-500/10 disabled:opacity-50 dark:text-red-400"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}

              Delete
            </button>

          </div>

        </div>

        {/* =================================================
            MESSAGES
        ================================================= */}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-semibold text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
        >

          {/* =================================================
              LEFT COLUMN
          ================================================= */}

          <div className="space-y-6">

            {/* BUYER */}

            <SectionCard
              icon={UserRound}
              title="Buyer Information"
            >

              <div className="grid gap-4 sm:grid-cols-2">

                <ReadOnlyField
                  label="Buyer Name"
                  value={
                    quotation.buyerName
                  }
                />

                <ReadOnlyField
                  label="Company"
                  value={
                    quotation.buyerCompany ||
                    "Ã¢â‚¬â€"
                  }
                />

                <ReadOnlyField
                  label="Email"
                  value={
                    quotation.buyerEmail
                  }
                />

                <ReadOnlyField
                  label="Phone"
                  value={
                    quotation.buyerPhone ||
                    "Ã¢â‚¬â€"
                  }
                />

                <ReadOnlyField
                  label="Country"
                  value={
                    quotation.buyerCountry ||
                    "Ã¢â‚¬â€"
                  }
                />

                <ReadOnlyField
                  label="RFQ Number"
                  value={
                    quotation.rfq?.rfqNumber ||
                    quotation.rfqId
                  }
                />

              </div>

            </SectionCard>

            {/* PRODUCT */}

            <SectionCard
              icon={Package}
              title="Product & Quantity"
            >

              <div className="grid gap-4 sm:grid-cols-2">

                <ReadOnlyField
                  label="Product"
                  value={
                    quotation.productName
                  }
                />

                <ReadOnlyField
                  label="Trade Type"
                  value={
                    quotation.productType
                  }
                />

                <Field
                  label="Quantity"
                  value={
                    form.quantity
                  }
                  onChange={(value) =>
                    updateField(
                      "quantity",
                      value
                    )
                  }
                  placeholder="e.g. 1000"
                />

                <Field
                  label="Unit"
                  value={
                    form.unit
                  }
                  onChange={(value) =>
                    updateField(
                      "unit",
                      value
                    )
                  }
                  placeholder="MT / KG / Bags"
                />

              </div>

            </SectionCard>

            {/* PRICE */}

            <SectionCard
              icon={FileText}
              title="Pricing"
            >

              <div className="grid gap-4 sm:grid-cols-3">

                <SelectField
                  label="Currency"
                  value={
                    form.currency
                  }
                  onChange={(value) =>
                    updateField(
                      "currency",
                      value
                    )
                  }
                  options={CURRENCIES.map(
                    (currency) => ({
                      value: currency,
                      label: currency,
                    })
                  )}
                />

                <Field
                  label="Unit Price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={
                    form.unitPrice
                  }
                  onChange={(value) =>
                    updateField(
                      "unitPrice",
                      value
                    )
                  }
                  placeholder="0.00"
                />

                <Field
                  label="Total Amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={
                    form.totalAmount
                  }
                  onChange={(value) =>
                    updateField(
                      "totalAmount",
                      value
                    )
                  }
                  placeholder="0.00"
                />

              </div>

              <button
                type="button"
                onClick={
                  calculateTotal
                }
                className="mt-4 text-sm font-bold text-blue-600 hover:underline dark:text-blue-400"
              >
                Calculate total from quantity Ãƒâ€” unit price
              </button>

            </SectionCard>

            {/* LOGISTICS */}

            <SectionCard
              icon={Globe2}
              title="International Trade Terms"
            >

              <div className="grid gap-4 sm:grid-cols-2">

                <Field
                  label="Destination Port"
                  value={
                    form.destinationPort
                  }
                  onChange={(value) =>
                    updateField(
                      "destinationPort",
                      value
                    )
                  }
                  placeholder="e.g. Dubai Port"
                />

                <Field
                  label="Incoterm"
                  value={
                    form.incoterm
                  }
                  onChange={(value) =>
                    updateField(
                      "incoterm",
                      value
                    )
                  }
                  placeholder="FOB / CIF / CFR / EXW"
                />

                <Field
                  label="Country of Origin"
                  value={
                    form.countryOfOrigin
                  }
                  onChange={(value) =>
                    updateField(
                      "countryOfOrigin",
                      value
                    )
                  }
                  placeholder="India"
                />

                <Field
                  label="Packaging"
                  value={
                    form.packaging
                  }
                  onChange={(value) =>
                    updateField(
                      "packaging",
                      value
                    )
                  }
                  placeholder="25 KG bags"
                />

              </div>

            </SectionCard>

          </div>

          {/* =================================================
              RIGHT COLUMN
          ================================================= */}

          <div className="space-y-6">

            {/* DELIVERY */}

            <SectionCard
              icon={MapPin}
              title="Delivery & Payment"
            >

              <div className="space-y-4">

                <Field
                  label="Payment Terms"
                  value={
                    form.paymentTerms
                  }
                  onChange={(value) =>
                    updateField(
                      "paymentTerms",
                      value
                    )
                  }
                  placeholder="e.g. 30% advance, 70% against documents"
                />

                <Field
                  label="Delivery Terms"
                  value={
                    form.deliveryTerms
                  }
                  onChange={(value) =>
                    updateField(
                      "deliveryTerms",
                      value
                    )
                  }
                  placeholder="e.g. Delivery after confirmation"
                />

                <Field
                  label="Delivery Time"
                  value={
                    form.deliveryTime
                  }
                  onChange={(value) =>
                    updateField(
                      "deliveryTime",
                      value
                    )
                  }
                  placeholder="e.g. 15Ã¢â‚¬â€œ20 working days"
                />

                <Field
                  label="Quotation Validity"
                  type="number"
                  min="1"
                  value={
                    form.validityDays
                  }
                  onChange={(value) =>
                    updateField(
                      "validityDays",
                      value
                    )
                  }
                  placeholder="30"
                />

              </div>

            </SectionCard>

            {/* NOTES */}

            <SectionCard
              icon={FileText}
              title="Notes & Additional Terms"
            >

              <textarea
                value={form.notes}
                onChange={(event) =>
                  updateField(
                    "notes",
                    event.target.value
                  )
                }
                rows={8}
                placeholder="Additional commercial terms, special conditions, documentation requirements, inspection requirements, etc."
                className="w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--foreground)]/35 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />

            </SectionCard>

            {/* RFQ REQUIREMENTS */}

            {quotation.rfq?.requirements && (
              <SectionCard
                icon={FileText}
                title="Original Buyer Requirements"
              >

                <div className="whitespace-pre-line rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-sm leading-7 text-[var(--foreground)]/65">
                  {
                    quotation.rfq
                      .requirements
                  }
                </div>

              </SectionCard>
            )}

            {/* ACTIONS */}

            <div className="rounded-[2rem] border border-blue-500/20 bg-gradient-to-br from-blue-600 to-cyan-500 p-6 text-white shadow-xl shadow-blue-600/15">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                <FileText className="h-5 w-5" />
              </div>

              <h2 className="mt-5 text-xl font-black">
                Quotation Ready
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/75">
                Save the quotation details before sending it to the buyer.
              </p>

              <button
                type="submit"
                disabled={saving}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-blue-600 transition hover:bg-white/90 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}

                Save Quotation
              </button>

              <button
                type="button"
                onClick={() =>
                  saveQuotation(
                    "SENT"
                  )
                }
                disabled={saving}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/15 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                Save & Mark as Sent
              </button>

            </div>

          </div>

        </form>

        {/* =================================================
            PROFESSIONAL A4 QUOTATION PRINT PREVIEW
        ================================================= */}

        <section
          id="quotation-print"
          className="quotation-print-preview mx-auto mt-10 max-w-[210mm] bg-white text-slate-900 shadow-2xl"
        >
          <div className="min-h-[297mm] p-[12mm] sm:p-[15mm]">

            <div className="flex items-start justify-between border-b-2 border-blue-700 pb-6">
              <div>
                <div className="text-2xl font-black tracking-tight text-blue-800">
                  KRUPALI TRADERS
                </div>
                <div className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">
                  Private Limited
                </div>
                <div className="mt-3 text-xs leading-5 text-slate-500">
                  Import • Export • International Trade
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-black tracking-[0.08em] text-slate-900">
                  QUOTATION
                </div>
                <div className="mt-2 text-sm font-bold text-blue-700">
                  {quotation.quotationNumber}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Date: {formatPrintDate(quotation.createdAt)}
                </div>
                <div className="text-xs text-slate-500">
                  Valid for {form.validityDays || quotation.validityDays} days
                </div>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-8">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-700">
                  Bill To
                </div>
                <div className="mt-2 text-base font-black">
                  {quotation.buyerName}
                </div>
                {quotation.buyerCompany && (
                  <div className="text-sm font-semibold text-slate-700">
                    {quotation.buyerCompany}
                  </div>
                )}
                <div className="mt-2 text-xs leading-5 text-slate-600">
                  {quotation.buyerEmail}
                  {quotation.buyerPhone && (
                    <>
                      <br />
                      {quotation.buyerPhone}
                    </>
                  )}
                  {quotation.buyerCountry && (
                    <>
                      <br />
                      {quotation.buyerCountry}
                    </>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-700">
                  Quotation Details
                </div>
                <div className="mt-2 grid grid-cols-[auto_auto] justify-end gap-x-5 gap-y-1 text-xs">
                  <span className="font-bold text-slate-500">RFQ</span>
                  <span className="font-semibold">
                    {quotation.rfq?.rfqNumber || quotation.rfqId}
                  </span>
                  <span className="font-bold text-slate-500">Trade Type</span>
                  <span className="font-semibold">{quotation.productType}</span>
                  <span className="font-bold text-slate-500">Status</span>
                  <span className="font-semibold">{quotation.status}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-blue-800 text-white">
                    <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide">
                      Description
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-wide">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-wide">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-wide">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border-b border-slate-200 px-4 py-5">
                      <div className="font-black">{quotation.productName}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {form.packaging || quotation.packaging || "As agreed"}
                      </div>
                    </td>
                    <td className="border-b border-slate-200 px-4 py-5 text-right">
                      {form.quantity || quotation.quantity || "—"}
                      {form.unit || quotation.unit
                        ? ` ${form.unit || quotation.unit}`
                        : ""}
                    </td>
                    <td className="border-b border-slate-200 px-4 py-5 text-right font-semibold">
                      {form.unitPrice || quotation.unitPrice || "—"}
                      {" "}
                      {form.currency}
                    </td>
                    <td className="border-b border-slate-200 px-4 py-5 text-right font-black">
                      {form.totalAmount || quotation.totalAmount || "—"}
                      {" "}
                      {form.currency}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <div className="w-72 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                  <span className="text-xs font-bold text-slate-500">
                    Total Amount
                  </span>
                  <span className="text-xl font-black text-blue-800">
                    {form.totalAmount || quotation.totalAmount || "0.00"}{" "}
                    {form.currency}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-8">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-700">
                  Trade & Delivery Terms
                </div>
                <dl className="mt-3 space-y-2 text-xs">
                  <PrintTerm label="Destination Port" value={form.destinationPort || quotation.destinationPort} />
                  <PrintTerm label="Incoterm" value={form.incoterm || quotation.incoterm} />
                  <PrintTerm label="Country of Origin" value={form.countryOfOrigin || quotation.countryOfOrigin} />
                  <PrintTerm label="Packaging" value={form.packaging || quotation.packaging} />
                  <PrintTerm label="Delivery Time" value={form.deliveryTime || quotation.deliveryTime} />
                  <PrintTerm label="Payment Terms" value={form.paymentTerms || quotation.paymentTerms} />
                  <PrintTerm label="Delivery Terms" value={form.deliveryTerms || quotation.deliveryTerms} />
                </dl>
              </div>

              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-700">
                  Notes & Conditions
                </div>
                <div className="mt-3 whitespace-pre-line text-xs leading-5 text-slate-600">
                  {form.notes || quotation.notes || "No additional notes."}
                </div>
              </div>
            </div>

            {quotation.rfq?.requirements && (
              <div className="mt-8">
                <div className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-700">
                  Buyer Requirements
                </div>
                <div className="mt-2 whitespace-pre-line rounded-lg bg-slate-50 p-4 text-xs leading-5 text-slate-600">
                  {quotation.rfq.requirements}
                </div>
              </div>
            )}

            <div className="mt-14 grid grid-cols-2 gap-12">
              <div>
                <div className="h-12 border-b border-slate-300" />
                <div className="mt-2 text-xs font-bold text-slate-600">
                  Buyer Acceptance
                </div>
              </div>

              <div>
                <div className="h-12 border-b border-slate-300" />
                <div className="mt-2 text-xs font-bold text-slate-600">
                  For KRUPALI TRADERS PRIVATE LIMITED
                </div>
                <div className="mt-1 text-[10px] text-slate-500">
                  Authorized Signatory
                </div>
              </div>
            </div>

            <div className="mt-10 border-t border-slate-200 pt-4 text-center text-[10px] leading-4 text-slate-400">
              This quotation is subject to the commercial terms and conditions agreed between the parties.
              <br />
              Please quote the quotation number in all future correspondence.
            </div>
          </div>
        </section>

      </div>
    </main>
    </>
  );
}

function formatPrintDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function PrintTerm({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) {
    return null;
  }

  return (
    <div className="grid grid-cols-[120px_1fr] gap-3">
      <dt className="font-bold text-slate-500">{label}</dt>
      <dd className="font-semibold text-slate-800">{value}</dd>
    </div>
  );
}

/* =========================================================
   SECTION CARD
========================================================= */


function SectionCard({
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
   READ ONLY FIELD
========================================================= */

function ReadOnlyField({
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
   FIELD
========================================================= */

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  min?: string;
  step?: string;
}) {
  return (
    <label className="block">

      <span className="text-xs font-bold text-[var(--foreground)]/65">
        {label}
      </span>

      <input
        type={type}
        min={min}
        step={step}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--foreground)]/35 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
      />

    </label>
  );
}

/* =========================================================
   SELECT
========================================================= */

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <label className="block">

      <span className="text-xs font-bold text-[var(--foreground)]/65">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
      >
        {options.map(
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

    </label>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status: QuotationStatus;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black ${STATUS_STYLES[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />

      {
        STATUS_OPTIONS.find(
          (item) =>
            item.value === status
        )?.label
      }
    </span>
  );
}