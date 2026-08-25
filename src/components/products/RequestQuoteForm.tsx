"use client";

import {
  FormEvent,
  useState,
} from "react";

type RequestQuoteFormProps = {
  productId?: string;
  productName: string;
  productType: "IMPORT" | "EXPORT";
};

export default function RequestQuoteForm({
  productId,
  productName,
  productType,
}: RequestQuoteFormProps) {
  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    const form =
      event.currentTarget;

    const formData =
      new FormData(form);

    const data = {
      productId: productId || null,
      productName,
      productType,

      name: String(
        formData.get("name") || ""
      ).trim(),

      company:
        String(
          formData.get("company") || ""
        ).trim() || null,

      email: String(
        formData.get("email") || ""
      ).trim(),

      phone:
        String(
          formData.get("phone") || ""
        ).trim() || null,

      country:
        String(
          formData.get("country") || ""
        ).trim() || null,

      destinationPort:
        String(
          formData.get(
            "destinationPort"
          ) || ""
        ).trim() || null,

      quantity:
        String(
          formData.get("quantity") || ""
        ).trim() || null,

      unit:
        String(
          formData.get("unit") || ""
        ).trim() || null,

      packaging:
        String(
          formData.get("packaging") || ""
        ).trim() || null,

      incoterm:
        String(
          formData.get("incoterm") || ""
        ).trim() || null,

      requiredDeliveryDate:
        String(
          formData.get(
            "requiredDeliveryDate"
          ) || ""
        ).trim() || null,

      requirements:
        String(
          formData.get("requirements") || ""
        ).trim() || null,
    };

    try {
      const response =
        await fetch("/api/rfqs", {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(data),
        });

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to submit request for quote."
        );
      }

      form.reset();

      setSuccess(
        `Your request for quote has been submitted successfully. RFQ Number: ${result.rfq?.rfqNumber || "Submitted"}. Our team will contact you shortly.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit request for quote."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-8 max-w-5xl"
    >
      {/* =====================================================
          PRODUCT SUMMARY
      ===================================================== */}

      <div className="mb-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
          Request for Quote
        </p>

        <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-bold text-[var(--foreground)]">
            {productName}
          </h3>

          <span className="inline-flex w-fit rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
            {productType === "EXPORT"
              ? "Export Product"
              : "Import Product"}
          </span>
        </div>
      </div>

      {/* =====================================================
          BUYER INFORMATION
      ===================================================== */}

      <section>
        <SectionTitle>
          Buyer Information
        </SectionTitle>

        <div className="grid gap-5 sm:grid-cols-2">

          <Field
            label="Name"
            name="name"
            placeholder="Your full name"
            required
          />

          <Field
            label="Company"
            name="company"
            placeholder="Company name"
          />

          <Field
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
          />

          <Field
            label="Phone / WhatsApp"
            name="phone"
            placeholder="+91"
          />

          <Field
            label="Country"
            name="country"
            placeholder="Country"
          />

          <Field
            label="Destination Port"
            name="destinationPort"
            placeholder="e.g. Jebel Ali"
          />

        </div>
      </section>

      {/* =====================================================
          REQUIREMENT
      ===================================================== */}

      <section className="mt-8">

        <SectionTitle>
          Product Requirement
        </SectionTitle>

        <div className="grid gap-5 sm:grid-cols-2">

          <Field
            label="Quantity"
            name="quantity"
            placeholder="Required quantity"
            required
          />

          <SelectField
            label="Unit"
            name="unit"
            options={[
              "KG",
              "MT",
              "TON",
              "GRAM",
              "LITRE",
              "PIECE",
              "BOX",
              "BAG",
              "CONTAINER",
              "OTHER",
            ]}
          />

          <Field
            label="Packaging Requirement"
            name="packaging"
            placeholder="e.g. 25 KG bags"
          />

          <SelectField
            label="Incoterm"
            name="incoterm"
            options={[
              "EXW",
              "FOB",
              "CFR",
              "CIF",
              "DAP",
              "DDP",
              "OTHER",
            ]}
          />

         <Field
  label="Required Delivery Date"
  name="requiredDeliveryDate"
  type="date"
  placeholder=""
/>

        </div>

      </section>

      {/* =====================================================
          ADDITIONAL REQUIREMENTS
      ===================================================== */}

      <section className="mt-8">

        <SectionTitle>
          Additional Requirements
        </SectionTitle>

        <textarea
          name="requirements"
          rows={6}
          placeholder={`Tell us about your ${productName} requirements, quality specifications, packaging preferences, delivery requirements or any other details...`}
          className="mt-2 w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3.5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--foreground)]/35 focus:border-[#1455a0] focus:ring-2 focus:ring-[#1455a0]/15 dark:focus:border-[#68b0ff]"
        />

      </section>

      {/* =====================================================
          SUCCESS
      ===================================================== */}

      {success && (
        <div
          role="status"
          className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm font-medium leading-6 text-emerald-600 dark:text-emerald-400"
        >
          {success}
        </div>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm font-medium leading-6 text-red-600 dark:text-red-400"
        >
          {error}
        </div>
      )}

      {/* =====================================================
          SUBMIT
      ===================================================== */}

      <button
        type="submit"
        disabled={loading}
        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1455a0] px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-[#1455a0]/20 transition hover:-translate-y-0.5 hover:bg-[#0f4688] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#1d68b8] dark:hover:bg-[#2678ca]"
      >
        {loading
          ? "Submitting RFQ..."
          : "Request a Quote"}
      </button>

    </form>
  );
}

/* ============================================================
   SECTION TITLE
============================================================ */

function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h3 className="mb-4 text-base font-bold text-[var(--foreground)]">
      {children}
    </h3>
  );
}

/* ============================================================
   INPUT FIELD
============================================================ */

function Field({
  label,
  name,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-sm font-semibold text-[var(--foreground)]"
      >
        {label}
        {required && " *"}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3.5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--foreground)]/35 focus:border-[#1455a0] focus:ring-2 focus:ring-[#1455a0]/15 dark:focus:border-[#68b0ff]"
      />
    </div>
  );
}

/* ============================================================
   SELECT FIELD
============================================================ */

function SelectField({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-sm font-semibold text-[var(--foreground)]"
      >
        {label}
      </label>

      <select
        id={name}
        name={name}
        defaultValue=""
        className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[#1455a0] focus:ring-2 focus:ring-[#1455a0]/15 dark:focus:border-[#68b0ff]"
      >
        <option value="">
          Select {label.toLowerCase()}
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}