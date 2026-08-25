"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

type ProductGalleryImage = {
  id: string;
  url: string;
  alt?: string | null;
};

type ProductGalleryProps = {
  images: ProductGalleryImage[];
  productName: string;
  productType: "IMPORT" | "EXPORT";
};

export default function ProductGallery({
  images,
  productName,
  productType,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const hasImages = images.length > 0;
  const activeImage = images[activeIndex];

  function showPrevious() {
    if (!hasImages) return;

    setActiveIndex((current) =>
      current === 0
        ? images.length - 1
        : current - 1
    );
  }

  function showNext() {
    if (!hasImages) return;

    setActiveIndex((current) =>
      current === images.length - 1
        ? 0
        : current + 1
    );
  }

  return (
    <div className="w-full">

      {/* =====================================================
          MAIN IMAGE
      ===================================================== */}

      <div className="gradient-card gradient-border overflow-hidden rounded-[2rem]">

        <div className="relative aspect-square overflow-hidden bg-[var(--primary-light)]">

          {activeImage ? (
            <Image
              key={activeImage.id}
              src={activeImage.url}
              alt={
                activeImage.alt ||
                productName
              }
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover transition duration-500"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/50 dark:bg-black/10">
                <ImageIcon
                  size={36}
                  className="text-[#1455a0] dark:text-[#68b0ff]"
                />
              </div>
            </div>
          )}

          {/* Image overlay */}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/45 to-transparent" />

          {/* Product Type */}

          <div className="absolute left-5 top-5 rounded-full border border-white/30 bg-black/25 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-lg backdrop-blur-md">
            {productType}
          </div>

          {/* Image Counter */}

          {images.length > 1 && (
            <div className="absolute right-5 top-5 rounded-full border border-white/30 bg-black/25 px-3 py-2 text-xs font-bold text-white shadow-lg backdrop-blur-md">
              {activeIndex + 1} / {images.length}
            </div>
          )}

          {/* Previous */}

          {images.length > 1 && (
            <button
              type="button"
              onClick={showPrevious}
              aria-label="Previous product image"
              className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white shadow-lg backdrop-blur-md transition duration-300 hover:scale-110 hover:bg-black/55"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {/* Next */}

          {images.length > 1 && (
            <button
              type="button"
              onClick={showNext}
              aria-label="Next product image"
              className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white shadow-lg backdrop-blur-md transition duration-300 hover:scale-110 hover:bg-black/55"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

        </div>

        {/* ===================================================
            THUMBNAILS
        =================================================== */}

        {images.length > 1 && (
          <div className="overflow-x-auto p-4">
            <div className="flex min-w-max gap-3">

              {images.map((image, index) => {
                const isActive =
                  index === activeIndex;

                return (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() =>
                      setActiveIndex(index)
                    }
                    aria-label={`View image ${index + 1}`}
                    aria-current={
                      isActive
                        ? "true"
                        : undefined
                    }
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 sm:h-24 sm:w-24 ${
                      isActive
                        ? "border-[#1455a0] shadow-lg shadow-blue-600/20 dark:border-[#68b0ff]"
                        : "border-[var(--border)] opacity-70 hover:-translate-y-0.5 hover:border-[#1455a0]/50 hover:opacity-100 dark:hover:border-[#68b0ff]/50"
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={
                        image.alt ||
                        `${productName} image ${index + 1}`
                      }
                      fill
                      sizes="96px"
                      className="object-cover"
                    />

                    {isActive && (
                      <span className="absolute inset-0 bg-[#1455a0]/10" />
                    )}
                  </button>
                );
              })}

            </div>
          </div>
        )}

      </div>

    </div>
  );
}