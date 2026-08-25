import Link from "next/link";
import {
  ArrowRight,
  Globe2,
  PackageCheck,
  SearchCheck,
} from "lucide-react";

export default function ServicesPage() {
  return (
    <main className="gradient-section">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden px-5 pb-16 pt-24 sm:pb-20 sm:pt-28 lg:px-8 lg:pt-32">

        <div className="mx-auto max-w-5xl text-center">

          <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#c9a24d] dark:text-[#d8b45b]">
            Our Services
          </div>

          <h1 className="mx-auto mt-4 max-w-5xl text-4xl font-bold leading-[1.05] tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">

            <span className="gradient-text">
              Trade solutions.
            </span>

            <br />

            Built for global business.

          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--foreground)]/65">
            Krupali Traders Private Limited provides professional
            import, export and international sourcing support for
            businesses looking to build reliable global trade
            relationships.
          </p>

        </div>

      </section>

      {/* =====================================================
          SERVICES
      ===================================================== */}

      <section className="px-5 pb-20 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="grid gap-6 md:grid-cols-3">

            {/* EXPORT */}

            <div className="gradient-card gradient-border rounded-[2rem] p-8">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-light)] text-[#1455a0] dark:text-[#68b0ff]">
                <Globe2 size={25} />
              </div>

              <h2 className="mt-6 text-2xl font-bold text-[var(--foreground)]">
                Export Solutions
              </h2>

              <p className="mt-4 leading-7 text-[var(--foreground)]/60">
                Connecting quality Indian products with international
                buyers and markets through dependable export support.
              </p>

              <Link
                href="/products/export"
                className="mt-6 inline-flex items-center gap-2 font-semibold text-[#1455a0] dark:text-[#68b0ff]"
              >
                Explore Export Products
                <ArrowRight size={17} />
              </Link>

            </div>

            {/* IMPORT */}

            <div className="gradient-card gradient-border rounded-[2rem] p-8">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-light)] text-[#1455a0] dark:text-[#68b0ff]">
                <PackageCheck size={25} />
              </div>

              <h2 className="mt-6 text-2xl font-bold text-[var(--foreground)]">
                Import Solutions
              </h2>

              <p className="mt-4 leading-7 text-[var(--foreground)]/60">
                Supporting businesses with international sourcing and
                dependable import opportunities.
              </p>

              <Link
                href="/products/import"
                className="mt-6 inline-flex items-center gap-2 font-semibold text-[#1455a0] dark:text-[#68b0ff]"
              >
                Explore Import Products
                <ArrowRight size={17} />
              </Link>

            </div>

            {/* SOURCING */}

            <div className="gradient-card gradient-border rounded-[2rem] p-8">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-light)] text-[#1455a0] dark:text-[#68b0ff]">
                <SearchCheck size={25} />
              </div>

              <h2 className="mt-6 text-2xl font-bold text-[var(--foreground)]">
                Global Sourcing
              </h2>

              <p className="mt-4 leading-7 text-[var(--foreground)]/60">
                Helping businesses identify suitable products and
                suppliers for reliable international trade.
              </p>

              <Link
                href="/contact"
                className="mt-6 inline-flex items-center gap-2 font-semibold text-[#1455a0] dark:text-[#68b0ff]"
              >
                Discuss Requirements
                <ArrowRight size={17} />
              </Link>

            </div>

          </div>

          {/* =================================================
              CTA
          ================================================= */}

          <div className="mt-8 rounded-[2rem] bg-gradient-to-br from-[#07111f] via-[#0b3266] to-[#1455a0] p-8 text-white lg:p-12">

            <div className="max-w-3xl">

              <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#d8b45b]">
                Work With Us
              </div>

              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                Let's build your next international trade opportunity.
              </h2>

              <p className="mt-6 leading-8 text-white/70">
                Tell us about your sourcing, import or export
                requirements and our team can discuss the next steps
                with you.
              </p>

              <Link
                href="/contact"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-[#0b3266] transition hover:-translate-y-1"
              >
                Contact Us
                <ArrowRight size={17} />
              </Link>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}