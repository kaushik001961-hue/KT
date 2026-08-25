"use client";

import {
  FormEvent,
  useState,
} from "react";

type ProductEnquiryFormProps = {
  productName: string;
  productType: "IMPORT" | "EXPORT";
};

export default function ProductEnquiryForm({
  productName,
  productType,
}: ProductEnquiryFormProps) {
  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    const form =
      event.currentTarget;

    const formData =
      new FormData(form);

    const data = {
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

      quantity:
        String(
          formData.get("quantity") || ""
        ).trim() || null,

      message:
        String(
          formData.get("message") || ""
        ).trim() || null,
    };

    try {
      const response =
        await fetch("/api/enquiries", {
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
            "Unable to submit enquiry."
        );
      }

      form.reset();

      setMessage(
        "Your enquiry has been submitted successfully. Our team will contact you shortly."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit enquiry."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-10 max-w-4xl"
    >
      <div className="grid gap-5 sm:grid-cols-2">

        <Field
          label="Name"
          name="name"
          placeholder="Your name"
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
          label="Phone"
          name="phone"
          placeholder="+91"
        />

        <Field
          label="Country"
          name="country"
          placeholder="Country"
        />

        <Field
          label="Quantity"
          name="quantity"
          placeholder="Required quantity"
        />

      </div>

      <div className="mt-5">

        <label
          htmlFor="product-enquiry-message"
          className="text-sm font-semibold text-[var(--foreground)]"
        >
          Message
        </label>

        <textarea
          id="product-enquiry-message"
          name="message"
          rows={5}
          placeholder={`Tell us about your ${productName} requirements...`}
          className="mt-2 w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3.5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--foreground)]/35 focus:border-[#1455a0] focus:ring-2 focus:ring-[#1455a0]/15 dark:focus:border-[#68b0ff]"
        />

      </div>

      {message && (
        <div className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1455a0] px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-[#1455a0]/20 transition hover:-translate-y-0.5 hover:bg-[#0f4688] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#1d68b8] dark:hover:bg-[#2678ca]"
      >
        {loading
          ? "Submitting..."
          : "Send Product Enquiry"}
      </button>

    </form>
  );
}

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
        htmlFor={`product-enquiry-${name}`}
        className="text-sm font-semibold text-[var(--foreground)]"
      >
        {label}
        {required && " *"}
      </label>

      <input
        id={`product-enquiry-${name}`}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3.5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--foreground)]/35 focus:border-[#1455a0] focus:ring-2 focus:ring-[#1455a0]/15 dark:focus:border-[#68b0ff]"
      />
    </div>
  );
}