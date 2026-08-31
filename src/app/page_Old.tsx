import Link from "next/link";
import {
  ArrowRight,
  Globe2,
  PackageCheck,
  ShieldCheck,
  Target,
} from "lucide-react";

import Hero from "@/components/home/Hero";

export default function HomePage() {
  return (
    <main className="gradient-section overflow-hidden">

      {/* =====================================================
          HERO
      ===================================================== */}

      <Hero />

      {/* =====================================================
          ABOUT
      ===================================================== */}

      <section className="gradient-section px-5 py-20 sm:py-24 lg:px-8 lg:py-28">

        <div className="mx-auto max-w-7xl">

          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">

            <div>

              <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#c9a24d] dark:text-[#d8b45b]">
                About Krupali Traders
              </div>

              <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-[var(--foreground)] sm:text-5xl">
                Connecting markets.
                <span className="block gradient-text">
                  Creating opportunities.
                </span>
              </h2>

              <p className="mt-6 max-w-xl text-base leading-8 text-[var(--foreground)]/65 sm:text-lg">
                Krupali Traders Private Limited is focused on creating
                dependable connections between quality products,
                reliable suppliers and international markets.
              </p>

              <Link
                href="/about"
                className="mt-7 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-3 font-semibold text-[var(--foreground)] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                Learn More
                <ArrowRight size={17} />
              </Link>

            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <div className="gradient-card gradient-border rounded-[2rem] p-7">

                <Globe2
                  size={28}
                  className="text-[#1455a0] dark:text-[#68b0ff]"
                />

                <h3 className="mt-5 text-xl font-bold text-[var(--foreground)]">
                  Global Reach
                </h3>

                <p className="mt-3 text-sm leading-7 text-[var(--foreground)]/60">
                  Building connections between businesses and
                  international markets.
                </p>

              </div>

              <div className="gradient-card gradient-border rounded-[2rem] p-7">

                <ShieldCheck
                  size={28}
                  className="text-[#1455a0] dark:text-[#68b0ff]"
                />

                <h3 className="mt-5 text-xl font-bold text-[var(--foreground)]">
                  Trusted Trade
                </h3>

                <p className="mt-3 text-sm leading-7 text-[var(--foreground)]/60">
                  Professional, transparent and dependable trade
                  relationships.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          PRODUCTS
      ===================================================== */}

      <section className="gradient-section px-5 py-20 sm:py-24 lg:px-8 lg:py-28">

        <div className="mx-auto max-w-7xl">

          <div className="mx-auto max-w-3xl text-center">

            <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#c9a24d] dark:text-[#d8b45b]">
              Products
            </div>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
              Explore our
              <span className="block gradient-text">
                trade opportunities.
              </span>
            </h2>

            <p className="mt-5 text-base leading-8 text-[var(--foreground)]/65 sm:text-lg">
              Discover import and export opportunities through
              Krupali Traders Private Limited.
            </p>

          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">

            {/* EXPORT */}

            <div className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#07111f] via-[#0b3266] to-[#1455a0] p-8 text-white shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl sm:p-10">

              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#68b0ff]/10 blur-3xl transition duration-500 group-hover:scale-125" />

              <div className="relative">

                <Globe2
                  size={32}
                  className="text-[#9bcfff]"
                />

                <h3 className="mt-7 text-3xl font-bold">
                  Export Products
                </h3>

                <p className="mt-4 max-w-xl leading-7 text-white/70">
                  Quality products prepared for international markets
                  and global business opportunities.
                </p>

                <Link
                  href="/products/export"
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-[#0b3266] transition duration-300 hover:-translate-y-1"
                >
                  Explore Export Products
                  <ArrowRight size={17} />
                </Link>

              </div>

            </div>

            {/* IMPORT */}

            <div className="group relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-10">

              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#2d7dd2]/10 blur-3xl transition duration-500 group-hover:scale-125" />

              <div className="relative">

                <PackageCheck
                  size={32}
                  className="text-[#1455a0] dark:text-[#68b0ff]"
                />

                <h3 className="mt-7 text-3xl font-bold text-[var(--foreground)]">
                  Import Products
                </h3>

                <p className="mt-4 max-w-xl leading-7 text-[var(--foreground)]/60">
                  International sourcing opportunities for Indian
                  businesses and customers.
                </p>

                <Link
                  href="/products/import"
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#1455a0] px-6 py-3 font-semibold text-white transition duration-300 hover:-translate-y-1"
                >
                  Explore Import Products
                  <ArrowRight size={17} />
                </Link>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          WHY US
      ===================================================== */}

      <section className="gradient-section px-5 py-20 sm:py-24 lg:px-8 lg:py-28">

        <div className="mx-auto max-w-7xl">

          <div className="mx-auto max-w-3xl text-center">

            <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#c9a24d] dark:text-[#d8b45b]">
              Why Choose Us
            </div>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
              Built around
              <span className="block gradient-text">
                dependable trade.
              </span>
            </h2>

          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">

            <div className="gradient-card gradient-border rounded-[2rem] p-8 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-light)]">
                <Globe2
                  size={28}
                  className="text-[#1455a0] dark:text-[#68b0ff]"
                />
              </div>

              <h3 className="mt-6 text-xl font-bold text-[var(--foreground)]">
                Global Approach
              </h3>

              <p className="mt-3 text-sm leading-7 text-[var(--foreground)]/60">
                Connecting businesses, products and opportunities
                across international markets.
              </p>

            </div>

            <div className="gradient-card gradient-border rounded-[2rem] p-8 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-light)]">
                <ShieldCheck
                  size={28}
                  className="text-[#1455a0] dark:text-[#68b0ff]"
                />
              </div>

              <h3 className="mt-6 text-xl font-bold text-[var(--foreground)]">
                Trusted Relationships
              </h3>

              <p className="mt-3 text-sm leading-7 text-[var(--foreground)]/60">
                Clear communication and professional coordination
                throughout the trade process.
              </p>

            </div>

            <div className="gradient-card gradient-border rounded-[2rem] p-8 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-light)]">
                <Target
                  size={28}
                  className="text-[#1455a0] dark:text-[#68b0ff]"
                />
              </div>

              <h3 className="mt-6 text-xl font-bold text-[var(--foreground)]">
                Quality Focus
              </h3>

              <p className="mt-3 text-sm leading-7 text-[var(--foreground)]/60">
                Focused on dependable sourcing, product quality and
                long-term opportunities.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="gradient-section px-5 pb-20 sm:pb-24 lg:px-8 lg:pb-28">

        <div className="mx-auto max-w-7xl">

          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#07111f] via-[#0b3266] to-[#1455a0] p-8 text-center text-white shadow-2xl sm:p-12 lg:p-16">

            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#68b0ff]/10 blur-3xl" />

            <div className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-[#c9a24d]/10 blur-3xl" />

            <div className="relative mx-auto max-w-3xl">

              <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#d8b45b]">
                Let's Work Together
              </div>

              <h2 className="mt-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
                Ready to discuss your trade requirements?
              </h2>

              <p className="mx-auto mt-5 max-w-2xl leading-7 text-white/70">
                Contact Krupali Traders Private Limited for import,
                export and international sourcing enquiries.
              </p>

              <Link
                href="/contact"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-[#0b3266] shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                Send an Enquiry
                <ArrowRight size={18} />
              </Link>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}