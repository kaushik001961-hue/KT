import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  ArrowRight,
  Globe2,
  PackageCheck,
  ShieldCheck,
  Target,
} from 'lucide-react';

import Hero from '@/components/home/Hero';

const exportCountries = [
   { name: "UAE", code: "ae" },
  { name: "Afghanistan", code: "af" },
  { name: "Albania", code: "al" },
  { name: "Algeria", code: "dz" },
  { name: "Argentina", code: "ar" },
  { name: "Australia", code: "au" },
  { name: "Austria", code: "at" },
  { name: "Bangladesh", code: "bd" },
  { name: "Belgium", code: "be" },
  { name: "Bhutan", code: "bt" },
  { name: "Brazil", code: "br" },
  { name: "Canada", code: "ca" },
  { name: "Chile", code: "cl" },
  { name: "China", code: "cn" },
  { name: "Colombia", code: "co" },
  { name: "Denmark", code: "dk" },
  { name: "Egypt", code: "eg" },
  { name: "France", code: "fr" },
  { name: "Germany", code: "de" },
  { name: "Greece", code: "gr" },
  { name: "Hungary", code: "hu" },
  { name: "India", code: "in" },
  { name: "Indonesia", code: "id" },
  { name: "Iran", code: "ir" },
  { name: "Iraq", code: "iq" },
  { name: "Ireland", code: "ie" },
  { name: "Italy", code: "it" },
  { name: "Japan", code: "jp" },
  { name: "Jordan", code: "jo" },
  { name: "Kenya", code: "ke" },
  { name: "Lakshadweep", code: "in" },
  { name: "Malaysia", code: "my" },
  { name: "Maldives", code: "mv" },
  { name: "Mexico", code: "mx" },
  { name: "Morocco", code: "ma" },
  { name: "Nepal", code: "np" },
  { name: "Netherlands", code: "nl" },
  { name: "New Zealand", code: "nz" },
  { name: "Nigeria", code: "ng" },
  { name: "Norway", code: "no" },
  { name: "Oman", code: "om" },
  { name: "Philippines", code: "ph" },
  { name: "Poland", code: "pl" },
  { name: "Portugal", code: "pt" },
  { name: "Qatar", code: "qa" },
  { name: "Russia", code: "ru" },
  { name: "Saudi Arabia", code: "sa" },
  { name: "Singapore", code: "sg" },
  { name: "Sri Lanka", code: "lk" },
  { name: "South Africa", code: "za" },
  { name: "South Korea", code: "kr" },
  { name: "Spain", code: "es" },
  { name: "Sweden", code: "se" },
  { name: "Switzerland", code: "ch" },
  { name: "Thailand", code: "th" },
  { name: "Vietnam", code: "vn" },
];

export default function HomePage() {
  const t = useTranslations('HomePage');

  return (
    <main className="gradient-section overflow-hidden">
      {/* HERO */}
      <Hero />

      {/* ABOUT */}
      <section className="gradient-section px-5 py-20 sm:py-24 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#c9a24d] dark:text-[#d8b45b]">
                {t('aboutTag')}
              </div>

              <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-[var(--foreground)] sm:text-5xl">
                {t('aboutTitle1')}
                <span className="block gradient-text">
                  {t('aboutTitle2')}
                </span>
              </h2>

              <p className="mt-6 max-w-xl text-base leading-8 text-[var(--foreground)]/65 sm:text-lg">
                {t('aboutDesc')}
              </p>

              <Link
                href="/about"
                className="mt-7 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-3 font-semibold text-[var(--foreground)] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {t('learnMore')}
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="gradient-card gradient-border rounded-[2rem] p-7">
                <Globe2 size={28} className="text-[#1455a0] dark:text-[#68b0ff]" />
                <h3 className="mt-5 text-xl font-bold text-[var(--foreground)]">
                  {t('globalReach')}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--foreground)]/60">
                  {t('globalReachDesc')}
                </p>
              </div>

              <div className="gradient-card gradient-border rounded-[2rem] p-7">
                <ShieldCheck size={28} className="text-[#1455a0] dark:text-[#68b0ff]" />
                <h3 className="mt-5 text-xl font-bold text-[var(--foreground)]">
                  {t('trustedTrade')}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--foreground)]/60">
                  {t('trustedTradeDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="gradient-section px-5 py-20 sm:py-24 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#c9a24d] dark:text-[#d8b45b]">
              {t('productsTag')}
            </div>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
              {t('productsTitle1')}
              <span className="block gradient-text">
                {t('productsTitle2')}
              </span>
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--foreground)]/65 sm:text-lg">
              {t('productsDesc')}
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {/* EXPORT */}
            <div className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#07111f] via-[#0b3266] to-[#1455a0] p-8 text-white shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl sm:p-10">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#68b0ff]/10 blur-3xl transition duration-500 group-hover:scale-125" />
              <div className="relative">
                <Globe2 size={32} className="text-[#9bcfff]" />
                <h3 className="mt-7 text-3xl font-bold">{t('exportTitle')}</h3>
                <p className="mt-4 max-w-xl leading-7 text-white/70">
                  {t('exportDesc')}
                </p>
                <Link
                  href="/products/export"
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-[#0b3266] transition duration-300 hover:-translate-y-1"
                >
                  {t('exportBtn')}
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>

            {/* IMPORT */}
            <div className="group relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-10">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#2d7dd2]/10 blur-3xl transition duration-500 group-hover:scale-125" />
              <div className="relative">
                <PackageCheck size={32} className="text-[#1455a0] dark:text-[#68b0ff]" />
                <h3 className="mt-7 text-3xl font-bold text-[var(--foreground)]">
                  {t('importTitle')}
                </h3>
                <p className="mt-4 max-w-xl leading-7 text-[var(--foreground)]/60">
                  {t('importDesc')}
                </p>
                <Link
                  href="/products/import"
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#1455a0] px-6 py-3 font-semibold text-white transition duration-300 hover:-translate-y-1"
                >
                  {t('importBtn')}
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="gradient-section px-5 py-20 sm:py-24 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#c9a24d] dark:text-[#d8b45b]">
              {t('whyUsTag')}
            </div>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
              {t('whyUsTitle1')}
              <span className="block gradient-text">
                {t('whyUsTitle2')}
              </span>
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="gradient-card gradient-border rounded-[2rem] p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-light)]">
                <Globe2 size={28} className="text-[#1455a0] dark:text-[#68b0ff]" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-[var(--foreground)]">
                {t('why1Title')}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--foreground)]/60">
                {t('why1Desc')}
              </p>
            </div>

            <div className="gradient-card gradient-border rounded-[2rem] p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-light)]">
                <ShieldCheck size={28} className="text-[#1455a0] dark:text-[#68b0ff]" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-[var(--foreground)]">
                {t('why2Title')}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--foreground)]/60">
                {t('why2Desc')}
              </p>
            </div>

            <div className="gradient-card gradient-border rounded-[2rem] p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-light)]">
                <Target size={28} className="text-[#1455a0] dark:text-[#68b0ff]" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-[var(--foreground)]">
                {t('why3Title')}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--foreground)]/60">
                {t('why3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-section px-5 pb-20 sm:pb-24 lg:px-8 lg:pb-28">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#07111f] via-[#0b3266] to-[#1455a0] p-8 text-center text-white shadow-2xl sm:p-12 lg:p-16">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#68b0ff]/10 blur-3xl" />
            <div className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-[#c9a24d]/10 blur-3xl" />
            <div className="relative mx-auto max-w-3xl">
              <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#d8b45b]">
                {t('ctaTag')}
              </div>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
                {t('ctaTitle')}
              </h2>
              <p className="mx-auto mt-5 max-w-2xl leading-7 text-white/70">
                {t('ctaDesc')}
              </p>
              <Link
                href="/contact"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-[#0b3266] shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                {t('ctaBtn')}
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MULTI-ROW EXPORT DESTINATIONS GRID WITH FLAGS (ABOVE FOOTER) */}
      <section className="relative z-10 py-16 border-t border-[var(--border)]/40 bg-[var(--surface)]/40 backdrop-blur-md">
        <div className="max-w-[96rem] mx-auto px-4 sm:px-6 lg:px-12 mb-8">
          <div className="text-center">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#c9a24d]">Global Reach</h2>
            <p className="mt-1 text-xl font-extrabold text-[var(--foreground)]">Proudly Exporting to 50+ Countries Worldwide</p>
          </div>
        </div>

        {/* Multi-row layout using flagcdn image icons for verified, universal flag rendering */}
        <div className="max-w-[96rem] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex flex-wrap justify-center items-center gap-2.5 sm:gap-3">
            {exportCountries.map((country, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-[var(--border)] bg-[var(--surface)]/90 text-[var(--foreground)] shadow-sm backdrop-blur-sm text-xs sm:text-sm font-semibold transition hover:scale-105"
              >
                <img
                  src={`https://flagcdn.com/w40/${country.code}.png`}
                  alt={`${country.name} flag`}
                  className="w-5 h-3.5 object-cover rounded-xs shrink-0"
                />
                <span className="tracking-wide">{country.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}