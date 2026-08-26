"use client";

import { useState } from "react";
import { Share2, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";

/* =========================================================
   TYPES
========================================================= */

type ProductImage = {
  url: string;
  alt?: string | null;
};

type ShareProductButtonProps = {
  name: string;
  type: "IMPORT" | "EXPORT";

  category?: string | null;

  shortDescription?: string | null;
  description?: string | null;
  specifications?: string | null;

  countryOfOrigin?: string | null;
  packaging?: string | null;
  minimumOrderQuantity?: string | null;

  slug?: string;

  images?: ProductImage[];
};

/* =========================================================
   HELPERS
========================================================= */

function safeFileName(value?: string | null) {
  const safeValue =
    String(value || "product").trim();

  return (
    safeValue
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "product"
  );
}

function cleanText(value?: string | null) {
  return value?.trim() || "";
}

/* =========================================================
   IMAGE → DATA URL
========================================================= */

async function imageToDataUrl(
  url: string
): Promise<string | null> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();

    return await new Promise((resolve) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        resolve(
          typeof reader.result === "string"
            ? reader.result
            : null
        );
      };

      reader.onerror = () => {
        resolve(null);
      };

      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(
      "PDF_IMAGE_ERROR",
      error
    );

    return null;
  }
}

/* =========================================================
   WRAPPED TEXT
========================================================= */

function addWrappedText(
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  width: number,
  lineHeight = 6
) {
  if (!text) {
    return y;
  }

  const lines =
    pdf.splitTextToSize(
      text,
      width
    );

  pdf.text(
    lines,
    x,
    y
  );

  return (
    y +
    lines.length *
      lineHeight
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function ShareProductButton({
  name,
  type,
  category,
  shortDescription,
  description,
  specifications,
  countryOfOrigin,
  packaging,
  minimumOrderQuantity,
  slug,
  images = [],
}: ShareProductButtonProps) {
  const [loading, setLoading] =
    useState(false);

  /* =======================================================
     GENERATE + SHARE PDF
  ======================================================= */

  async function handleShare() {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      /* =====================================================
         CREATE PDF
      ===================================================== */

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      const margin = 18;

      const contentWidth =
        pageWidth -
        margin * 2;

      /* =====================================================
         HEADER
      ===================================================== */

      pdf.setFillColor(
        8,
        31,
        58
      );

      pdf.rect(
        0,
        0,
        pageWidth,
        38,
        "F"
      );

      pdf.setTextColor(
        255,
        255,
        255
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(19);

      pdf.text(
        "KRUPALI TRADERS",
        margin,
        16
      );

      pdf.setFontSize(9);

      pdf.setTextColor(
        201,
        162,
        77
      );

      pdf.text(
        "PRIVATE LIMITED",
        margin,
        23
      );

      pdf.setFontSize(8);

      pdf.setTextColor(
        225,
        235,
        245
      );

      pdf.text(
        "Import • Export • Global Trade",
        margin,
        30
      );

      /* =====================================================
         PRODUCT TITLE
      ===================================================== */

      let y = 51;

      pdf.setTextColor(
        8,
        31,
        58
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(23);

      const title =
        cleanText(name) ||
        "Product";

      const titleLines =
        pdf.splitTextToSize(
          title,
          contentWidth
        );

      pdf.text(
        titleLines,
        margin,
        y
      );

      y +=
        titleLines.length *
        9;

      /* =====================================================
         PRODUCT TYPE
      ===================================================== */

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(9);

      if (type === "EXPORT") {
        pdf.setTextColor(
          24,
          120,
          55
        );
      } else {
        pdf.setTextColor(
          180,
          100,
          60
        );
      }

      pdf.text(
        type === "EXPORT"
          ? "EXPORT PRODUCT"
          : "IMPORT PRODUCT",
        margin,
        y + 3
      );

      /* =====================================================
         CATEGORY
      ===================================================== */

      if (category) {
        pdf.setTextColor(
          90,
          100,
          110
        );

        pdf.text(
          `Category: ${category}`,
          margin + 45,
          y + 3
        );
      }

      y += 14;

      /* =====================================================
         PRODUCT IMAGE
      ===================================================== */

      const firstImage =
        images.find(
          (image) =>
            Boolean(image.url)
        );

      if (firstImage) {
        const imageData =
          await imageToDataUrl(
            firstImage.url
          );

        if (imageData) {
          try {
            const imageWidth =
              174;

            const imageHeight =
              82;

            const imageX =
              (pageWidth -
                imageWidth) /
              2;

            /*
             * Cloudinary may return
             * JPG, PNG or WEBP.
             *
             * AUTO lets jsPDF determine
             * the image type.
             */

            pdf.addImage(
              imageData,
              "JPEG",
              imageX,
              y,
              imageWidth,
              imageHeight,
              undefined,
              "MEDIUM"
            );

            y +=
              imageHeight +
              10;
          } catch (error) {
            console.error(
              "PDF_ADD_IMAGE_ERROR",
              error
            );
          }
        }
      }

      /* =====================================================
         PRODUCT OVERVIEW
      ===================================================== */

      const summary =
        cleanText(
          shortDescription
        ) ||
        cleanText(description);

      if (summary) {
        if (
          y >
          pageHeight - 65
        ) {
          pdf.addPage();

          y = 22;
        }

        pdf.setTextColor(
          8,
          31,
          58
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(12);

        pdf.text(
          "Product Overview",
          margin,
          y
        );

        y += 7;

        pdf.setTextColor(
          70,
          80,
          90
        );

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(
          9.5
        );

        y =
          addWrappedText(
            pdf,
            summary,
            margin,
            y,
            contentWidth,
            5
          );

        y += 7;
      }

      /* =====================================================
         PRODUCT DETAILS
      ===================================================== */

      const details = [
        [
          "Product Type",
          type === "EXPORT"
            ? "Export"
            : "Import",
        ],
        [
          "Category",
          cleanText(category),
        ],
        [
          "Country of Origin",
          cleanText(
            countryOfOrigin
          ),
        ],
        [
          "Packaging",
          cleanText(packaging),
        ],
        [
          "Minimum Order Quantity",
          cleanText(
            minimumOrderQuantity
          ),
        ],
      ].filter(
        (
          item
        ): item is [
          string,
          string
        ] => Boolean(item[1])
      );

      if (
        details.length > 0
      ) {
        if (
          y >
          pageHeight - 80
        ) {
          pdf.addPage();

          y = 22;
        }

        pdf.setTextColor(
          8,
          31,
          58
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(12);

        pdf.text(
          "Product Details",
          margin,
          y
        );

        y += 8;

        details.forEach(
          ([label, value]) => {
            pdf.setFont(
              "helvetica",
              "bold"
            );

            pdf.setFontSize(9);

            pdf.setTextColor(
              70,
              80,
              90
            );

            pdf.text(
              `${label}:`,
              margin,
              y
            );

            pdf.setFont(
              "helvetica",
              "normal"
            );

            pdf.setTextColor(
              25,
              35,
              45
            );

            const valueLines =
              pdf.splitTextToSize(
                value,
                contentWidth -
                  48
              );

            pdf.text(
              valueLines,
              margin + 48,
              y
            );

            y += Math.max(
              6,
              valueLines.length *
                5
            );
          }
        );

        y += 6;
      }

      /* =====================================================
         SPECIFICATIONS
      ===================================================== */

      if (
        cleanText(
          specifications
        )
      ) {
        if (
          y >
          pageHeight - 80
        ) {
          pdf.addPage();

          y = 22;
        }

        pdf.setTextColor(
          8,
          31,
          58
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(12);

        pdf.text(
          "Specifications",
          margin,
          y
        );

        y += 7;

        pdf.setTextColor(
          70,
          80,
          90
        );

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(
          9.5
        );

        y =
          addWrappedText(
            pdf,
            cleanText(
              specifications
            ),
            margin,
            y,
            contentWidth,
            5
          );
      }

      /* =====================================================
         WEBSITE / PRODUCT URL
      ===================================================== */

      if (slug) {
        if (
          y >
          pageHeight - 45
        ) {
          pdf.addPage();

          y = 22;
        }

        y += 8;

        pdf.setTextColor(
          8,
          31,
          58
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(10);

        pdf.text(
          "Product Page",
          margin,
          y
        );

        y += 6;

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(8);

        pdf.setTextColor(
          70,
          80,
          90
        );

        /*
         * Use the current website
         * origin when generated.
         */

        const productUrl =
          typeof window !==
          "undefined"
            ? `${window.location.origin}/products/${type.toLowerCase()}/${encodeURIComponent(
                slug
              )}`
            : "";

        if (productUrl) {
          const urlLines =
            pdf.splitTextToSize(
              productUrl,
              contentWidth
            );

          pdf.text(
            urlLines,
            margin,
            y
          );
        }
      }

      /* =====================================================
         FOOTER
      ===================================================== */

      const totalPages =
        pdf.getNumberOfPages();

      for (
        let page = 1;
        page <= totalPages;
        page++
      ) {
        pdf.setPage(page);

        pdf.setDrawColor(
          220,
          225,
          230
        );

        pdf.line(
          margin,
          pageHeight - 17,
          pageWidth - margin,
          pageHeight - 17
        );

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(
          7.5
        );

        pdf.setTextColor(
          110,
          120,
          130
        );

        pdf.text(
          "Krupali Traders Private Limited",
          margin,
          pageHeight - 10
        );

        pdf.text(
          `Page ${page} of ${totalPages}`,
          pageWidth - margin,
          pageHeight - 10,
          {
            align: "right",
          }
        );
      }

      /* =====================================================
         CREATE PDF BLOB
      ===================================================== */

      const pdfBlob =
        pdf.output("blob");

      const fileName =
        `${safeFileName(name)}-krupali-traders.pdf`;

      const file =
        new File(
          [pdfBlob],
          fileName,
          {
            type: "application/pdf",
          }
        );

      /* =====================================================
         MOBILE / NATIVE SHARE
      ===================================================== */

      const shareData = {
        title:
          cleanText(name) ||
          "Krupali Traders Product",

        text:
          `Check this product from Krupali Traders Private Limited: ${
            cleanText(name) ||
            "Product"
          }`,

        files: [file],
      };

      if (
        typeof navigator !==
          "undefined" &&
        typeof navigator.share ===
          "function" &&
        typeof navigator.canShare ===
          "function" &&
        navigator.canShare({
          files: [file],
        })
      ) {
        await navigator.share(
          shareData
        );

        return;
      }

      /* =====================================================
         DESKTOP FALLBACK
      ===================================================== */

      const url =
        URL.createObjectURL(
          pdfBlob
        );

      const anchor =
        document.createElement(
          "a"
        );

      anchor.href = url;

      anchor.download =
        fileName;

      document.body.appendChild(
        anchor
      );

      anchor.click();

      anchor.remove();

      window.setTimeout(() => {
        URL.revokeObjectURL(
          url
        );
      }, 1000);

      alert(
        "PDF generated successfully. It has been downloaded because file sharing is not supported by this browser."
      );
    } catch (error) {
      /* =====================================================
         USER CANCELLED SHARE
      ===================================================== */

      if (
        error instanceof
          DOMException &&
        error.name ===
          "AbortError"
      ) {
        return;
      }

      console.error(
        "PRODUCT_PDF_SHARE_ERROR",
        error
      );

      alert(
        "Unable to generate the product PDF. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     BUTTON
  ========================================================= */

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <>
          <Loader2
            size={17}
            className="animate-spin"
          />

          Preparing PDF...
        </>
      ) : (
        <>
          <Share2 size={17} />

          Share Product
        </>
      )}
    </button>
  );
}