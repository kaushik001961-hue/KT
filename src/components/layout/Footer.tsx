
import Link from "next/link";
import {
  ArrowUpRight,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";

/* ============================================================
    SOCIAL MEDIA CONFIGURATION

    WhatsApp number is configured below.

    Indian format:
    919876543210

    Do NOT use:
    +91 98765 43210
    ============================================================ */

const WHATSAPP_NUMBER = "919601090109";

const whatsappMessage =
  "Hello Krupali Traders Private Limited, I am interested in your products. Please provide me with more information.";

const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  whatsappMessage
)}`;

/* ============================================================
    SOCIAL LINKS
============================================================ */

const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61594078650660",
    icon: FaFacebookF,
    color: "text-[#1877F2]",
    hoverBorder: "hover:border-[#1877F2]/50",
    hoverBg: "hover:bg-[#1877F2]/10",
    shadow: "hover:shadow-[#1877F2]/20",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/krupalitraderspvtltd/",
    icon: FaInstagram,
    color: "text-[#E4405F]",
    hoverBorder: "hover:border-[#E4405F]/50",
    hoverBg: "hover:bg-[#E4405F]/10",
    shadow: "hover:shadow-[#E4405F]/20",
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/in/arvind-jethva-047b59432",
    icon: FaLinkedinIn,
    color: "text-[#0A66C2]",
    hoverBorder: "hover:border-[#0A66C2]/50",
    hoverBg: "hover:bg-[#0A66C2]/10",
    shadow: "hover:shadow-[#0A66C2]/20",
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@KrupaliTradersPrivateLimited",
    icon: FaYoutube,
    color: "text-[#FF0000]",
    hoverBorder: "hover:border-[#FF0000]/50",
    hoverBg: "hover:bg-[#FF0000]/10",
    shadow: "hover:shadow-[#FF0000]/20",
  },
  {
    name: "WhatsApp",
    href: whatsappUrl,
    icon: FaWhatsapp,
    color: "text-[#25D366]",
    hoverBorder: "hover:border-[#25D366]/50",
    hoverBg: "hover:bg-[#25D366]/10",
    shadow: "hover:shadow-[#25D366]/20",
  },
];

export default function Footer() {
  return (
    <>
      {/* =====================================================
          FLOATING SOCIAL MEDIA BAR
          Desktop / tablet
      ===================================================== */}

      <div className="fixed right-3 top-1/2 z-[80] hidden -translate-y-1/2 flex-col gap-2 sm:flex">

        {socialLinks.map((social) => {
          const Icon = social.icon;

          return (
            <a
              key={`floating-${social.name}`}
              href={social.href}
              aria-label={social.name}
              title={social.name}
              target={social.href === "#" ? undefined : "_blank"}
              rel={
                social.href === "#"
                  ? undefined
                  : "noopener noreferrer"
              }
              className={`
                group
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                border
                border-[var(--border)]
                bg-white/95
                shadow-lg
                backdrop-blur-md
                transition-all
                duration-300
                hover:-translate-x-1
                hover:scale-110
                dark:bg-[#071b34]/95
                ${social.hoverBorder}
                ${social.hoverBg}
                ${social.shadow}
              `}
            >
              <Icon
                size={17}
                className={`
                  transition-transform
                  duration-300
                  group-hover:scale-110
                  ${social.color}
                `}
              />
            </a>
          );
        })}

      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="relative overflow-hidden bg-gradient-to-br from-[#050d18] via-[#071b34] to-[#0b3266] text-white">

        {/* Decorative glows */}

        <div className="gradient-glow -left-32 bottom-0 h-80 w-80 bg-[#1455a0]/20" />

        <div className="gradient-glow right-0 top-0 h-96 w-96 bg-[#2d7dd2]/15" />

        <div className="relative z-10 mx-auto max-w-7xl px-5 py-12 sm:py-16 lg:px-8">

          <div className="grid gap-9 sm:gap-12 md:grid-cols-2 lg:grid-cols-4">

            {/* =================================================
                COMPANY
            ================================================= */}

            <div className="lg:col-span-2">

              <div className="flex items-center gap-3.5">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#1455a0] to-[#2d7dd2] text-xl font-bold text-white shadow-lg">
                  K
                </div>

                <div>

                  <div className="text-xl font-bold tracking-tight">
                    KRUPALI
                  </div>

                  <div className="-mt-0.5 text-[10px] font-semibold tracking-[0.10em] text-[#d8b45b]">
                    TRADERS PRIVATE LIMITED
                  </div>

                </div>

              </div>

              <p className="mt-6 max-w-xl text-sm leading-7 text-white/60">
                Krupali Traders Private Limited connects trusted products,
                reliable suppliers and international markets through
                professional import and export solutions.
              </p>

              {/* =================================================
                  CTA
              ================================================= */}

              <Link
                href="/contact"
                className="gradient-button mt-7 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white"
              >
                Start a Conversation
                <ArrowUpRight size={16} />
              </Link>

              {/* =================================================
                  FOLLOW US
              ================================================= */}

              <div className="mt-8">

                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">
                  Follow Us
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3">

                  {socialLinks.map((social) => {
                    const Icon = social.icon;

                    return (
                      <a
                        key={`footer-${social.name}`}
                        href={social.href}
                        aria-label={social.name}
                        title={social.name}
                        target={
                          social.href === "#"
                            ? undefined
                            : "_blank"
                        }
                        rel={
                          social.href === "#"
                            ? undefined
                            : "noopener noreferrer"
                        }
                        className={`
                          group
                          flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-white/10
                          bg-white/[0.06]
                          shadow-sm
                          transition-all
                          duration-300
                          hover:-translate-y-1
                          hover:shadow-lg
                          ${social.hoverBorder}
                          ${social.hoverBg}
                          ${social.shadow}
                        `}
                      >
                        <Icon
                          size={17}
                          className={`
                            transition-transform
                            duration-300
                            group-hover:scale-110
                            ${social.color}
                          `}
                        />
                      </a>
                    );
                  })}

                </div>

              </div>

            </div>

            {/* =================================================
                QUICK LINKS
            ================================================= */}

            <div>

              <h3 className="font-semibold text-white">
                Quick Links
              </h3>

              <div className="mt-5 flex flex-col gap-3 text-sm text-white/55">

                <Link
                  href="/"
                  className="transition hover:text-[#8fc4ff]"
                >
                  Home
                </Link>

                <Link
                  href="/about"
                  className="transition hover:text-[#8fc4ff]"
                >
                  About Us
                </Link>

                <Link
                  href="/products/export"
                  className="transition hover:text-[#8fc4ff]"
                >
                  Export Products
                </Link>

                <Link
                  href="/products/import"
                  className="transition hover:text-[#8fc4ff]"
                >
                  Import Products
                </Link>

                <Link
                  href="/services"
                  className="transition hover:text-[#8fc4ff]"
                >
                  Services
                </Link>

                <Link
                  href="/contact"
                  className="transition hover:text-[#8fc4ff]"
                >
                  Contact
                </Link>

              </div>

            </div>

            {/* =================================================
                CONTACT
            ================================================= */}

            <div>

              <h3 className="font-semibold text-white">
                Contact
              </h3>

              <div className="mt-5 space-y-4 text-sm text-white/55">

                <div className="flex gap-3">

                  <MapPin
                    size={18}
                    className="mt-0.5 shrink-0 text-[#8fc4ff]"
                  />

                  <span>
                    207, 2nd Floor, White House Complex,
                    Sector 11, Gandhinagar, Gujarat -382010.
                    <br />
                    India
                  </span>

                </div>

                <div className="flex gap-3">

                  <Phone
                    size={18}
                    className="shrink-0 text-[#8fc4ff]"
                  />

                  <span>
                    +91 96010 90109
                  </span>

                </div>

                <div className="flex gap-3">

                  <Mail
                    size={18}
                    className="shrink-0 text-[#8fc4ff]"
                  />

                  <span>
                    krupalitraderss@gmail.com
                  </span>

                </div>

              </div>

            </div>

          </div>

          {/* =====================================================
              COPYRIGHT
          ===================================================== */}

          <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-7 text-sm text-white/40 sm:flex-row sm:items-center sm:justify-between">

            <p>
              © {new Date().getFullYear()} Krupali Traders Private Limited.
              All rights reserved.
            </p>

            <p className="text-xs text-white/30">
              Import • Export • Global Trade
            </p>

          </div>

        </div>

      </footer>
    </>
  );
}