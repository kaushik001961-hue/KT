"use client";

import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { FormEvent, useState } from "react";

type ProductType = "IMPORT" | "EXPORT";

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSubmitting(true);
    setSuccess("");
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") || ""),
      company: String(formData.get("company") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      country: String(formData.get("country") || ""),
      productName: String(
        formData.get("productName") || ""
      ),
      productType: String(
        formData.get("productType") || ""
      ) as ProductType,
      quantity: String(
        formData.get("quantity") || ""
      ),
      message: String(
        formData.get("message") || ""
      ),
    };

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to submit enquiry."
        );
      }

      setSuccess(
        "Thank you. Your enquiry has been submitted successfully. Our team will contact you shortly."
      );

      form.reset();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your enquiry. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="gradient-section text-[var(--foreground)]">

      {/* =====================================================
          HERO
      ===================================================== */}

     <section className="relative overflow-hidden px-5 pb-16 pt-24 sm:pb-20 sm:pt-28 lg:px-8 lg:pt-32">

        <div className="mx-auto max-w-4xl text-center">

          <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#c9a24d] dark:text-[#d8b45b]">
            Contact Us
          </div>

          <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
            <span className="gradient-text">
              Let's discuss your trade requirements.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--foreground)]/65">
            Contact Krupali Traders Private Limited
            for import, export and international
            sourcing enquiries.
          </p>

        </div>
      </section>

      {/* =====================================================
          CONTACT + BUSINESS ENQUIRY
      ===================================================== */}

      <section className="px-5 pb-20 lg:px-8 lg:pb-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">

          {/* =================================================
              CONTACT INFORMATION
          ================================================= */}

          <div className="gradient-card gradient-border rounded-[2rem] p-8 lg:p-10">

            <h2 className="text-2xl font-bold text-[var(--foreground)]">
              Get in touch
            </h2>

            <p className="mt-3 text-sm leading-6 text-[var(--foreground)]/55">
              Our team is available to discuss
              sourcing, import, export and
              international trade requirements.
            </p>

            <div className="mt-8 space-y-6">

              {/* Location */}

              <div className="flex gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[#1455a0] dark:text-[#68b0ff]">
                  <MapPin size={20} />
                </div>

                <div>
                  <div className="font-semibold text-[var(--foreground)]">
                    Location
                  </div>

                  <div className="mt-1 text-sm text-[var(--foreground)]/60">
                    Gujarat, India
                  </div>
                </div>

              </div>

              {/* Phone */}

              <div className="flex gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[#1455a0] dark:text-[#68b0ff]">
                  <Phone size={20} />
                </div>

                <div>
                  <div className="font-semibold text-[var(--foreground)]">
                    Phone
                  </div>

                  <div className="mt-1 text-sm text-[var(--foreground)]/60">
                    +91 XXXXX XXXXX
                  </div>
                </div>

              </div>

              {/* Email */}

              <div className="flex gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[#1455a0] dark:text-[#68b0ff]">
                  <Mail size={20} />
                </div>

                <div>
                  <div className="font-semibold text-[var(--foreground)]">
                    Email
                  </div>

                  <div className="mt-1 text-sm text-[var(--foreground)]/60">
                    info@krupalitraders.com
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* =================================================
              BUSINESS ENQUIRY
          ================================================= */}

          <div
            className="
              rounded-[2rem]
              border
              border-[var(--border)]
              bg-[var(--surface)]
              p-6
              text-[var(--foreground)]
              shadow-[0_20px_60px_rgba(20,85,160,0.08)]
              sm:p-8
              lg:p-10

              dark:border-white/20
              dark:bg-gradient-to-br
              dark:from-[#07111f]
              dark:via-[#0b3266]
              dark:to-[#1455a0]
              dark:text-white
              dark:shadow-[0_25px_70px_rgba(0,0,0,0.35)]
            "
          >

            {/* Heading */}

         <div className="text-center text-sm font-bold uppercase tracking-[0.2em] text-[#c9a24d] dark:text-[#d8b45b]">
  Business Enquiry
</div>

            <h2 className="mt-4 text-center text-3xl font-bold text-[var(--foreground)] dark:text-white">
              Tell us what you need.
            </h2>

            <p className="mt-5 leading-7 text-[var(--foreground)]/65 dark:text-white/65">
              Whether you are looking for export
              products, import opportunities or
              international sourcing support, tell
              us about your requirements.
            </p>

            {/* =================================================
                SUCCESS MESSAGE
            ================================================= */}

            {success && (
              <div className="mt-6 flex gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:border-emerald-300/20 dark:bg-emerald-400/10 dark:text-emerald-100">

                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

                <span>{success}</span>

              </div>
            )}

            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {error && (
              <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-700 dark:border-red-300/20 dark:bg-red-400/10 dark:text-red-100">
                {error}
              </div>
            )}

            {/* =================================================
                FORM
            ================================================= */}

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

              {/* Name / Company */}

              <div className="grid gap-5 sm:grid-cols-2">

                <div>

                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-[var(--foreground)]/80 dark:text-white/85"
                  >
                    Name *
                  </label>

                  <input
                    id="name"
                    name="name"
                    required
                    placeholder="Your name"
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-[var(--border)]
                      bg-[var(--surface-soft)]
                      px-4
                      text-sm
                      text-[var(--foreground)]
                      outline-none
                      placeholder:text-[var(--foreground)]/40
                      focus:border-[var(--primary)]
                      focus:ring-2
                      focus:ring-[var(--primary)]/10
                      dark:border-white/15
                      dark:bg-white/10
                      dark:text-white
                      dark:placeholder:text-white/35
                      dark:focus:border-white/40
                      dark:focus:ring-white/10
                    "
                  />

                </div>

                <div>

                  <label
                    htmlFor="company"
                    className="mb-2 block text-sm font-semibold text-[var(--foreground)]/80 dark:text-white/85"
                  >
                    Company
                  </label>

                  <input
                    id="company"
                    name="company"
                    placeholder="Company name"
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-[var(--border)]
                      bg-[var(--surface-soft)]
                      px-4
                      text-sm
                      text-[var(--foreground)]
                      outline-none
                      placeholder:text-[var(--foreground)]/40
                      focus:border-[var(--primary)]
                      focus:ring-2
                      focus:ring-[var(--primary)]/10
                      dark:border-white/15
                      dark:bg-white/10
                      dark:text-white
                      dark:placeholder:text-white/35
                      dark:focus:border-white/40
                      dark:focus:ring-white/10
                    "
                  />

                </div>

              </div>

              {/* Email / Phone */}

              <div className="grid gap-5 sm:grid-cols-2">

                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-[var(--foreground)]/80 dark:text-white/85"
                  >
                    Email *
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-[var(--border)]
                      bg-[var(--surface-soft)]
                      px-4
                      text-sm
                      text-[var(--foreground)]
                      outline-none
                      placeholder:text-[var(--foreground)]/40
                      focus:border-[var(--primary)]
                      focus:ring-2
                      focus:ring-[var(--primary)]/10
                      dark:border-white/15
                      dark:bg-white/10
                      dark:text-white
                      dark:placeholder:text-white/35
                      dark:focus:border-white/40
                      dark:focus:ring-white/10
                    "
                  />

                </div>

                <div>

                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-[var(--foreground)]/80 dark:text-white/85"
                  >
                    Phone
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+91"
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-[var(--border)]
                      bg-[var(--surface-soft)]
                      px-4
                      text-sm
                      text-[var(--foreground)]
                      outline-none
                      placeholder:text-[var(--foreground)]/40
                      focus:border-[var(--primary)]
                      focus:ring-2
                      focus:ring-[var(--primary)]/10
                      dark:border-white/15
                      dark:bg-white/10
                      dark:text-white
                      dark:placeholder:text-white/35
                      dark:focus:border-white/40
                      dark:focus:ring-white/10
                    "
                  />

                </div>

              </div>

              {/* Country / Requirement Type */}

              <div className="grid gap-5 sm:grid-cols-2">

                <div>

                  <label
                    htmlFor="country"
                    className="mb-2 block text-sm font-semibold text-[var(--foreground)]/80 dark:text-white/85"
                  >
                    Country
                  </label>

                  <input
                    id="country"
                    name="country"
                    placeholder="Country"
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-[var(--border)]
                      bg-[var(--surface-soft)]
                      px-4
                      text-sm
                      text-[var(--foreground)]
                      outline-none
                      placeholder:text-[var(--foreground)]/40
                      focus:border-[var(--primary)]
                      focus:ring-2
                      focus:ring-[var(--primary)]/10
                      dark:border-white/15
                      dark:bg-white/10
                      dark:text-white
                      dark:placeholder:text-white/35
                      dark:focus:border-white/40
                      dark:focus:ring-white/10
                    "
                  />

                </div>

                <div>

                  <label
                    htmlFor="productType"
                    className="mb-2 block text-sm font-semibold text-[var(--foreground)]/80 dark:text-white/85"
                  >
                    Requirement Type *
                  </label>

                  <select
                    id="productType"
                    name="productType"
                    required
                    defaultValue=""
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-[var(--border)]
                      bg-[var(--surface-soft)]
                      px-4
                      text-sm
                      text-[var(--foreground)]
                      outline-none
                      focus:border-[var(--primary)]
                      focus:ring-2
                      focus:ring-[var(--primary)]/10
                      dark:border-white/15
                      dark:bg-[#0b3266]
                      dark:text-white
                      dark:focus:border-white/40
                      dark:focus:ring-white/10
                    "
                  >

                    <option
                      value=""
                      disabled
                    >
                      Select type
                    </option>

                    <option value="IMPORT">
                      Import
                    </option>

                    <option value="EXPORT">
                      Export
                    </option>

                  </select>

                </div>

              </div>

              {/* Product / Quantity */}

              <div className="grid gap-5 sm:grid-cols-2">

                <div>

                  <label
                    htmlFor="productName"
                    className="mb-2 block text-sm font-semibold text-[var(--foreground)]/80 dark:text-white/85"
                  >
                    Product *
                  </label>

                  <input
                    id="productName"
                    name="productName"
                    required
                    placeholder="Product you're interested in"
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-[var(--border)]
                      bg-[var(--surface-soft)]
                      px-4
                      text-sm
                      text-[var(--foreground)]
                      outline-none
                      placeholder:text-[var(--foreground)]/40
                      focus:border-[var(--primary)]
                      focus:ring-2
                      focus:ring-[var(--primary)]/10
                      dark:border-white/15
                      dark:bg-white/10
                      dark:text-white
                      dark:placeholder:text-white/35
                      dark:focus:border-white/40
                      dark:focus:ring-white/10
                    "
                  />

                </div>

                <div>

                  <label
                    htmlFor="quantity"
                    className="mb-2 block text-sm font-semibold text-[var(--foreground)]/80 dark:text-white/85"
                  >
                    Quantity
                  </label>

                  <input
                    id="quantity"
                    name="quantity"
                    placeholder="Required quantity"
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-[var(--border)]
                      bg-[var(--surface-soft)]
                      px-4
                      text-sm
                      text-[var(--foreground)]
                      outline-none
                      placeholder:text-[var(--foreground)]/40
                      focus:border-[var(--primary)]
                      focus:ring-2
                      focus:ring-[var(--primary)]/10
                      dark:border-white/15
                      dark:bg-white/10
                      dark:text-white
                      dark:placeholder:text-white/35
                      dark:focus:border-white/40
                      dark:focus:ring-white/10
                    "
                  />

                </div>

              </div>

              {/* Message */}

              <div>

                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-semibold text-[var(--foreground)]/80 dark:text-white/85"
                >
                  Message
                </label>

                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="Tell us about your requirements..."
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-[var(--border)]
                    bg-[var(--surface-soft)]
                    px-4
                    py-3
                    text-sm
                    text-[var(--foreground)]
                    outline-none
                    placeholder:text-[var(--foreground)]/40
                    focus:border-[var(--primary)]
                    focus:ring-2
                    focus:ring-[var(--primary)]/10
                    dark:border-white/15
                    dark:bg-white/10
                    dark:text-white
                    dark:placeholder:text-white/35
                    dark:focus:border-white/40
                    dark:focus:ring-white/10
                  "
                />

              </div>

              {/* Submit */}

              <button
                type="submit"
                disabled={submitting}
                className="
                  inline-flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-[var(--primary)]
                  px-6
                  py-3.5
                  font-semibold
                  text-white
                  transition
                  hover:-translate-y-0.5
                  hover:bg-[var(--primary-dark)]
                  hover:shadow-lg
                  dark:bg-white
                  dark:text-[#0b3266]
                  dark:hover:bg-white/90
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >

                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Submit Enquiry
                    <ArrowRight size={17} />
                  </>
                )}

              </button>

            </form>

          </div>

        </div>
      </section>

    </main>
  );
}