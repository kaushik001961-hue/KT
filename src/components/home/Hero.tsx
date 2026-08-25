"use client";

import { motion } from "framer-motion";
import { Globe2 } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-transparent">

      {/* =====================================================
          BACKGROUND VIDEO
      ===================================================== */}

      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-100"
      >
        <source
          src="/videos/hero-trade.mp4"
          type="video/mp4"
        />
      </video>

      {/* =====================================================
          HERO CONTENT — BOTTOM CENTER
      ===================================================== */}

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl items-end justify-center px-4 pb-20 pt-28 sm:px-5 sm:pb-24 sm:pt-32 lg:px-8 lg:pb-28 lg:pt-36">

        <motion.div
          initial={{
            opacity: 0,
            y: 28,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
          className="flex w-full flex-col items-center justify-end text-center"
        >

          {/* =================================================
              GLOBAL TRADING PARTNER
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              delay: 0.1,
            }}
            className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-black/20 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white shadow-lg shadow-black/10 backdrop-blur-md sm:mb-6 sm:px-4 sm:text-xs sm:tracking-[0.18em]"
          >
            <Globe2 size={15} />

            <span>
              Global Trading Partner
            </span>
          </motion.div>

          {/* =================================================
              STATS
          ================================================= */}

          <div className="grid w-full max-w-xl grid-cols-3 border-t border-white/30 pt-5 text-center sm:pt-6">

            {/* GLOBAL */}

            <div className="pr-3">

              <div className="text-lg font-bold text-white drop-shadow-lg sm:text-2xl">
                Global
              </div>

              <div className="mt-1 text-[10px] leading-4 text-white/80 drop-shadow-md sm:text-xs">
                Trading Network
              </div>

            </div>

            {/* QUALITY */}

            <div className="border-l border-white/30 px-3 sm:px-5">

              <div className="text-lg font-bold text-white drop-shadow-lg sm:text-2xl">
                Quality
              </div>

              <div className="mt-1 text-[10px] leading-4 text-white/80 drop-shadow-md sm:text-xs">
                Focused Sourcing
              </div>

            </div>

            {/* RELIABLE */}

            <div className="border-l border-white/30 pl-3 sm:pl-5">

              <div className="text-lg font-bold text-white drop-shadow-lg sm:text-2xl">
                Reliable
              </div>

              <div className="mt-1 text-[10px] leading-4 text-white/80 drop-shadow-md sm:text-xs">
                Trade Support
              </div>

            </div>

          </div>

        </motion.div>

      </div>

      {/* =====================================================
          DISCOVER INDICATOR — BOTTOM
      ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 1,
          delay: 1,
        }}
        className="absolute bottom-5 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/65 drop-shadow-lg md:flex"
      >

        <span className="h-px w-10 bg-white/40" />

        Discover Krupali Traders Private Limited

        <span className="h-px w-10 bg-white/40" />

      </motion.div>

    </section>
  );
}