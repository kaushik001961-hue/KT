
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
    FULL-SCREEN VIDEO HERO
===================================================== */}
<section className="relative min-h-screen w-full overflow-hidden">

  {/* Background Video */}
  <video
    className="absolute inset-0 h-full w-full object-cover"
    autoPlay
    muted
    loop
    playsInline
    preload="auto"
    poster="/images/about-hero-poster.jpg"
    aria-hidden="true"
  >
    <source
      src="/videos/krupali-trade.mp4"
      type="video/mp4"
    />
  </video>

  {/* Bottom Content */}
  <div className="absolute inset-x-0 bottom-0 z-10">

    <div className="mx-auto max-w-7xl px-5 pb-10 text-center sm:px-8 sm:pb-14 lg:pb-16">

      <div className="text-sm font-bold uppercase tracking-[0.25em] text-[#d8b45b]">
        About Krupali Traders
      </div>

      <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-white sm:text-lg sm:leading-8">
        Krupali Traders Private Limited is focused on creating
        dependable connections between quality products and
        international markets.
      </p>

      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">

        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-full bg-[#d8b45b] px-7 py-3 font-semibold text-[#07111f] transition hover:-translate-y-1 hover:bg-[#e6c66f] hover:shadow-xl"
        >
          Work With Us
          <ArrowRight size={17} />
        </Link>

        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-transparent px-7 py-3 font-semibold text-white transition hover:-translate-y-1 hover:bg-white/10"
        >
          Explore Products
        </Link>

      </div>

    </div>

  </div>

</section>

      {/* =====================================================
          CORE VALUES
      ===================================================== */}
      <section className="px-5 pb-24 pt-16 lg:px-8">
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