import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Globe, Share2, MessageCircle, Send } from "lucide-react";

export default function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <main className="gradient-section overflow-hidden pt-28 sm:pt-36">
      {/* Hero Section */}
      <section className="relative px-4 py-12 sm:px-6 lg:px-12">
        <div className="mx-auto max-w-[96rem]">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--primary)] shadow-sm">
                <ShieldCheck size={14} className="text-[#c9a24d]" />
                Global Exporter & Importer
              </div>

              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-6xl lg:text-7xl">
                Connecting Global Markets with <span className="text-[var(--primary)]">Trust</span>
              </h1>

              <p className="mt-6 text-base text-[var(--foreground)]/70 sm:text-lg lg:text-xl">
                Krupali Traders Private Limited delivers excellence across international borders. We source, supply, and trade superior grade products worldwide with unmatched reliability.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/en/products"
                  className="gradient-button flex items-center gap-2 rounded-full px-8 py-4 text-base font-bold text-white shadow-xl transition hover:brightness-110"
                >
                  Explore Products
                  <ArrowUpRight size={18} />
                </Link>

                <Link
                  href="/en/contact"
                  className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-8 py-4 text-base font-bold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--primary-light)]"
                >
                  Contact Us
                </Link>
              </div>

              {/* Social Media Links Bar */}
              <div className="mt-8 flex items-center gap-4 text-[var(--foreground)]/70">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/50">Connect:</span>
                <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" className="rounded-full border border-[var(--border)] bg-[var(--surface)] p-2.5 hover:text-[var(--primary)] transition shadow-sm">
                  <MessageCircle size={18} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="rounded-full border border-[var(--border)] bg-[var(--surface)] p-2.5 hover:text-[var(--primary)] transition shadow-sm">
                  <Globe size={18} />
                </a>
                <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" className="rounded-full border border-[var(--border)] bg-[var(--surface)] p-2.5 hover:text-[var(--primary)] transition shadow-sm">
                  <Send size={18} />
                </a>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-6 border-t border-[var(--border)] pt-8">
                <div>
                  <div className="text-2xl font-black text-[var(--primary)] sm:text-3xl">100+</div>
                  <div className="mt-1 text-xs text-[var(--foreground)]/60 sm:text-sm">Global Partners</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#c9a24d] sm:text-3xl">50+</div>
                  <div className="mt-1 text-xs text-[var(--foreground)]/60 sm:text-sm">Products Shipped</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[var(--primary)] sm:text-3xl">24/7</div>
                  <div className="mt-1 text-xs text-[var(--foreground)]/60 sm:text-sm">Trade Support</div>
                </div>
              </div>
            </div>

            {/* Right Graphic/Logo Container */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative h-72 w-72 sm:h-96 sm:w-96 overflow-hidden rounded-full border-4 border-[var(--border)] bg-[var(--surface)] shadow-2xl flex items-center justify-center">
                <Image
                  src="/images/Krupali-Traders-Logo.gif"
                  alt="Krupali Traders Private Limited"
                  fill
                  priority
                  unoptimized
                  className="object-cover"
                  sizes="(max-width: 640px) 288px, 384px"
                />
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}