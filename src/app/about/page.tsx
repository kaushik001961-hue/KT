import Link from "next/link";
import {
  ArrowRight,
  Globe2,
  ShieldCheck,
  Target,
} from "lucide-react";

export default function AboutPage() {
  return (
    <main className="gradient-section">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden px-5 pb-16 pt-24 sm:pb-20 sm:pt-28 lg:px-8 lg:pt-32">

        <div className="mx-auto max-w-5xl text-center">

          <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#c9a24d] dark:text-[#d8b45b]">
            About Us
          </div>

          <h1 className="mx-auto mt-4 max-w-5xl text-4xl font-bold leading-[1.05] tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
            <span className="gradient-text">
              Connecting markets. Creating opportunities.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--foreground)]/65">
            Krupali Traders Private Limited is focused on creating
            dependable connections between quality products and
            international markets.
          </p>

        </div>
      </section>

      {/* =====================================================
          CORE VALUES
      ===================================================== */}

      <section className="px-5 pb-24 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <div className="grid gap-6 md:grid-cols-3">

            {/* GLOBAL APPROACH */}

            <div className="gradient-card gradient-border rounded-3xl p-6 sm:p-8">

              <Globe2
                className="text-[#1455a0] dark:text-[#68b0ff]"
                size={28}
              />

              <h2 className="mt-6 text-xl font-bold text-[var(--foreground)]">
                Global Approach
              </h2>

              <p className="mt-3 leading-7 text-[var(--foreground)]/60">
                Connecting businesses and products across
                international markets.
              </p>

            </div>

            {/* TRUSTED TRADE */}

            <div className="gradient-card gradient-border rounded-3xl p-6 sm:p-8">

              <ShieldCheck
                className="text-[#1455a0] dark:text-[#68b0ff]"
                size={28}
              />

              <h2 className="mt-6 text-xl font-bold text-[var(--foreground)]">
                Trusted Trade
              </h2>

              <p className="mt-3 leading-7 text-[var(--foreground)]/60">
                Professional and transparent trade relationships.
              </p>

            </div>

            {/* QUALITY FOCUS */}

            <div className="gradient-card gradient-border rounded-3xl p-6 sm:p-8">

              <Target
                className="text-[#1455a0] dark:text-[#68b0ff]"
                size={28}
              />

              <h2 className="mt-6 text-xl font-bold text-[var(--foreground)]">
                Quality Focus
              </h2>

              <p className="mt-3 leading-7 text-[var(--foreground)]/60">
                Focused on dependable sourcing and product quality.
              </p>

            </div>

          </div>

          {/* =================================================
              OUR APPROACH
          ================================================= */}

          <div className="mt-8 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#07111f] via-[#0b3266] to-[#1455a0] p-8 text-white shadow-[0_25px_70px_rgba(20,85,160,0.15)] lg:p-12">

            <div className="max-w-3xl">

              <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#d8b45b]">
                Our Approach
              </div>

              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                Professional trade connections built for
                long-term relationships.
              </h2>

              <p className="mt-6 leading-8 text-white/70">
                We aim to make international sourcing and supply
                straightforward through clear communication,
                dependable coordination and a quality-focused
                approach.
              </p>

              <Link
                href="/contact"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-[#0b3266] transition hover:-translate-y-1 hover:shadow-lg"
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