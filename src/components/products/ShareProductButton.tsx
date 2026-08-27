"use client";

import { Loader2, Share2 } from "lucide-react";
import { useState } from "react";
import { jsPDF } from "jspdf";

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

function cleanText(value?: string | null) {
  return String(value || "").trim();
}

function safeFileName(value?: string | null) {
  const safeValue = String(value || "product").trim();

  return (
    safeValue
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "product"
  );
}

/**
 * Convert an image URL to a browser data URL.
 * Works with same-origin images and Cloudinary images
 * when CORS permits the request.
 */
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

      reader.onerror = () => resolve(null);

      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("PDF_IMAGE_ERROR", error);
    return null;
  }
}

function getImageFormat(
  dataUrl: string
): "PNG" | "JPEG" {
  if (dataUrl.startsWith("data:image/png")) {
    return "PNG";
  }

  return "JPEG";
}

function addWrappedText(
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  width: number,
  lineHeight = 4.5
) {
  if (!text) {
    return y;
  }

  const lines = pdf.splitTextToSize(text, width);

  pdf.text(lines, x, y);

  return y + lines.length * lineHeight;
}

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
  const [loading, setLoading] = useState(false);

  async function handleShare() {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      /*
       * ==========================================================
       * A4 ONE-PAGE PDF
       * ==========================================================
       */

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      const margin = 14;

      const contentWidth =
        pageWidth - margin * 2;

      /*
       * ==========================================================
       * COLORS
       * ==========================================================
       */

      const NAVY = {
        r: 7,
        g: 29,
        b: 53,
      };

      const GOLD = {
        r: 201,
        g: 164,
        b: 74,
      };

      const LIGHT = {
        r: 246,
        g: 247,
        b: 249,
      };

      const CREAM = {
        r: 249,
        g: 246,
        b: 238,
      };

      const TEXT = {
        r: 31,
        g: 38,
        b: 45,
      };

      const MUTED = {
        r: 103,
        g: 113,
        b: 124,
      };

      const BORDER = {
        r: 220,
        g: 226,
        b: 232,
      };

      /*
       * ==========================================================
       * WHITE PAGE
       * ==========================================================
       */

      pdf.setFillColor(255, 255, 255);
      pdf.rect(
        0,
        0,
        pageWidth,
        pageHeight,
        "F"
      );

      /*
       * ==========================================================
       * TOP NAVY + GOLD ACCENT
       * ==========================================================
       */

      pdf.setFillColor(
        NAVY.r,
        NAVY.g,
        NAVY.b
      );

      pdf.rect(
        0,
        0,
        pageWidth,
        5,
        "F"
      );

      pdf.setFillColor(
        GOLD.r,
        GOLD.g,
        GOLD.b
      );

      pdf.rect(
        0,
        5,
        pageWidth,
        1.2,
        "F"
      );

      /*
       * ==========================================================
       * LOGO
       * ==========================================================
       */

      const logoData = await imageToDataUrl(
        "/images/Krupali-Traders-Logo.png"
      );

      if (logoData) {
        try {
          pdf.addImage(
            logoData,
            getImageFormat(logoData),
            margin,
            10,
            23,
            23,
            undefined,
            "MEDIUM"
          );
        } catch (error) {
          console.error(
            "PDF_LOGO_ERROR",
            error
          );
        }
      }

      /*
       * ==========================================================
       * COMPANY BRANDING
       * ==========================================================
       */

      pdf.setTextColor(
        NAVY.r,
        NAVY.g,
        NAVY.b
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(12);

      pdf.text(
        "KRUPALI TRADERS",
        margin + 28,
        16
      );

      pdf.setTextColor(
        GOLD.r,
        GOLD.g,
        GOLD.b
      );

      pdf.setFontSize(7);

      pdf.text(
        "PRIVATE LIMITED",
        margin + 28,
        21
      );

      pdf.setTextColor(
        MUTED.r,
        MUTED.g,
        MUTED.b
      );

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(6.5);

      pdf.text(
        "IMPORT • EXPORT • GLOBAL TRADE",
        margin + 28,
        26
      );

      /*
       * ==========================================================
       * PRODUCT PROFILE LABEL
       * ==========================================================
       */

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(7);

      pdf.setTextColor(
        NAVY.r,
        NAVY.g,
        NAVY.b
      );

      pdf.text(
        "PRODUCT PROFILE",
        pageWidth - margin,
        16,
        {
          align: "right",
        }
      );

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(6.5);

      pdf.setTextColor(
        MUTED.r,
        MUTED.g,
        MUTED.b
      );

      pdf.text(
        "International Trade",
        pageWidth - margin,
        21,
        {
          align: "right",
        }
      );

      /*
       * ==========================================================
       * HERO PRODUCT HEADER
       * ==========================================================
       */

      let y = 38;

      pdf.setFillColor(
        NAVY.r,
        NAVY.g,
        NAVY.b
      );

      pdf.roundedRect(
        margin,
        y,
        contentWidth,
        37,
        4,
        4,
        "F"
      );

      pdf.setTextColor(
        GOLD.r,
        GOLD.g,
        GOLD.b
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(7);

      pdf.text(
        type === "EXPORT"
          ? "EXPORT PRODUCT"
          : "IMPORT PRODUCT",
        margin + 8,
        y + 9
      );

      /*
       * Product title
       */

      pdf.setTextColor(
        255,
        255,
        255
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(20);

      const titleLines =
        pdf.splitTextToSize(
          cleanText(name) ||
            "Product",
          contentWidth - 16
        );

      pdf.text(
        titleLines.slice(0, 2),
        margin + 8,
        y + 19
      );

      /*
       * Category
       */

      if (category) {
        pdf.setTextColor(
          218,
          226,
          234
        );

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(7);

        pdf.text(
          `Category: ${cleanText(category)}`,
          margin + 8,
          y + 31
        );
      }

      y += 42;

      /*
       * ==========================================================
       * PRODUCT IMAGE + QUICK INFORMATION
       * ==========================================================
       */

      const imageWidth = 88;
      const imageHeight = 62;

      const imageBoxX = margin;
      const imageBoxY = y;

      /*
       * Image background
       */

      pdf.setFillColor(
        CREAM.r,
        CREAM.g,
        CREAM.b
      );

      pdf.roundedRect(
        imageBoxX,
        imageBoxY,
        imageWidth,
        imageHeight,
        3,
        3,
        "F"
      );

      pdf.setDrawColor(
        227,
        217,
        191
      );

      pdf.setLineWidth(0.35);

      pdf.roundedRect(
        imageBoxX,
        imageBoxY,
        imageWidth,
        imageHeight,
        3,
        3,
        "S"
      );

      const firstImage =
        images.find(
          (image) =>
            Boolean(
              cleanText(image.url)
            )
        );

      if (firstImage) {
        const imageData =
          await imageToDataUrl(
            firstImage.url
          );

        if (imageData) {
          try {
            /*
             * Keep image inside a clean
             * 88 x 62 mm product frame.
             */

            pdf.addImage(
              imageData,
              getImageFormat(
                imageData
              ),
              imageBoxX + 2,
              imageBoxY + 2,
              imageWidth - 4,
              imageHeight - 4,
              undefined,
              "MEDIUM"
            );
          } catch (error) {
            console.error(
              "PDF_PRODUCT_IMAGE_ERROR",
              error
            );
          }
        }
      } else {
        pdf.setTextColor(
          MUTED.r,
          MUTED.g,
          MUTED.b
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(7);

        pdf.text(
          "PRODUCT IMAGE",
          imageBoxX +
            imageWidth / 2,
          imageBoxY +
            imageHeight / 2,
          {
            align: "center",
          }
        );
      }

      /*
       * ==========================================================
       * QUICK DETAILS CARD
       * ==========================================================
       */

      const cardX =
        margin + imageWidth + 5;

      const cardWidth =
        contentWidth -
        imageWidth -
        5;

      pdf.setFillColor(
        LIGHT.r,
        LIGHT.g,
        LIGHT.b
      );

      pdf.roundedRect(
        cardX,
        y,
        cardWidth,
        imageHeight,
        3,
        3,
        "F"
      );

      pdf.setDrawColor(
        BORDER.r,
        BORDER.g,
        BORDER.b
      );

      pdf.roundedRect(
        cardX,
        y,
        cardWidth,
        imageHeight,
        3,
        3,
        "S"
      );

      const quickDetails = [
        [
          "TRADE TYPE",
          type === "EXPORT"
            ? "Export"
            : "Import",
        ],
        [
          "CATEGORY",
          cleanText(category) ||
            "—",
        ],
        [
          "COUNTRY OF ORIGIN",
          cleanText(
            countryOfOrigin
          ) || "—",
        ],
        [
          "PACKAGING",
          cleanText(packaging) ||
            "—",
        ],
        [
          "MINIMUM ORDER",
          cleanText(
            minimumOrderQuantity
          ) || "—",
        ],
      ];

      let detailY = y + 9;

      quickDetails.forEach(
        ([label, value]) => {
          pdf.setFont(
            "helvetica",
            "bold"
          );

          pdf.setFontSize(6);

          pdf.setTextColor(
            NAVY.r,
            NAVY.g,
            NAVY.b
          );

          pdf.text(
            label,
            cardX + 6,
            detailY
          );

          pdf.setFont(
            "helvetica",
            "normal"
          );

          pdf.setFontSize(7);

          pdf.setTextColor(
            TEXT.r,
            TEXT.g,
            TEXT.b
          );

          const valueLines =
            pdf.splitTextToSize(
              value,
              cardWidth - 43
            );

          pdf.text(
            valueLines.slice(0, 2),
            cardX + 42,
            detailY
          );

          detailY += 10;
        }
      );

      y += imageHeight + 5;

      /*
       * ==========================================================
       * DESCRIPTION + BUYER HIGHLIGHTS
       * ==========================================================
       */

      const halfWidth =
        (contentWidth - 5) / 2;

      /*
       * LEFT — OVERVIEW
       */

      pdf.setFillColor(
        LIGHT.r,
        LIGHT.g,
        LIGHT.b
      );

      pdf.roundedRect(
        margin,
        y,
        halfWidth,
        40,
        3,
        3,
        "F"
      );

      pdf.setTextColor(
        NAVY.r,
        NAVY.g,
        NAVY.b
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(9);

      pdf.text(
        "PRODUCT OVERVIEW",
        margin + 5,
        y + 8
      );

      const summary =
        cleanText(
          shortDescription
        ) ||
        cleanText(description) ||
        "Product information available on request.";

      pdf.setTextColor(
        MUTED.r,
        MUTED.g,
        MUTED.b
      );

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(7.2);

      const summaryLines =
        pdf.splitTextToSize(
          summary,
          halfWidth - 10
        );

      pdf.text(
        summaryLines.slice(0, 6),
        margin + 5,
        y + 16
      );

      /*
       * RIGHT — BUYER HIGHLIGHTS
       */

      const highlightsX =
        margin +
        halfWidth +
        5;

      pdf.setFillColor(
        CREAM.r,
        CREAM.g,
        CREAM.b
      );

      pdf.roundedRect(
        highlightsX,
        y,
        halfWidth,
        40,
        3,
        3,
        "F"
      );

      pdf.setTextColor(
        NAVY.r,
        NAVY.g,
        NAVY.b
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(9);

      pdf.text(
        "BUYER HIGHLIGHTS",
        highlightsX + 5,
        y + 8
      );

      const highlights = [
        "Professional sourcing support",
        "Flexible packaging options",
        "Buyer-specific quantities",
        "RFQ / enquiry assistance",
      ];

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(7.2);

      pdf.setTextColor(
        TEXT.r,
        TEXT.g,
        TEXT.b
      );

      highlights.forEach(
        (item, index) => {
          pdf.text(
            `• ${item}`,
            highlightsX + 5,
            y + 16 + index * 5.5
          );
        }
      );

      y += 45;

      /*
       * ==========================================================
       * SPECIFICATIONS
       * ==========================================================
       */

      pdf.setTextColor(
        NAVY.r,
        NAVY.g,
        NAVY.b
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(10);

      pdf.text(
        "SPECIFICATION",
        margin,
        y + 5
      );

      y += 9;

      const specificationText =
        cleanText(
          specifications
        );

      /*
       * Two-column specification
       */

      const specItems = [
        [
          "PRODUCT",
          cleanText(name) || "—",
        ],
        [
          "CATEGORY",
          cleanText(category) || "—",
        ],
        [
          "COUNTRY",
          cleanText(
            countryOfOrigin
          ) || "—",
        ],
        [
          "PACKAGING",
          cleanText(packaging) || "—",
        ],
        [
          "MOQ",
          cleanText(
            minimumOrderQuantity
          ) || "—",
        ],
        [
          "TYPE",
          type === "EXPORT"
            ? "EXPORT"
            : "IMPORT",
        ],
      ];

      const columnWidth =
        contentWidth / 2;

      const rowHeight = 9;

      for (
        let i = 0;
        i < specItems.length;
        i += 2
      ) {
        const left =
          specItems[i];

        const right =
          specItems[i + 1];

        /*
         * Left cell
         */

        pdf.setFillColor(
          LIGHT.r,
          LIGHT.g,
          LIGHT.b
        );

        pdf.rect(
          margin,
          y,
          columnWidth,
          rowHeight,
          "F"
        );

        pdf.setFillColor(
          CREAM.r,
          CREAM.g,
          CREAM.b
        );

        pdf.rect(
          margin +
            columnWidth,
          y,
          columnWidth,
          rowHeight,
          "F"
        );

        pdf.setDrawColor(
          BORDER.r,
          BORDER.g,
          BORDER.b
        );

        pdf.rect(
          margin,
          y,
          columnWidth,
          rowHeight,
          "S"
        );

        pdf.rect(
          margin +
            columnWidth,
          y,
          columnWidth,
          rowHeight,
          "S"
        );

        /*
         * Labels
         */

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(5.7);

        pdf.setTextColor(
          NAVY.r,
          NAVY.g,
          NAVY.b
        );

        pdf.text(
          left[0],
          margin + 3,
          y + 5.8
        );

        pdf.text(
          right[0],
          margin +
            columnWidth +
            3,
          y + 5.8
        );

        /*
         * Values
         */

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(6.5);

        pdf.setTextColor(
          TEXT.r,
          TEXT.g,
          TEXT.b
        );

        const leftValue =
          pdf.splitTextToSize(
            left[1],
            columnWidth - 38
          );

        const rightValue =
          pdf.splitTextToSize(
            right[1],
            columnWidth - 38
          );

        pdf.text(
          leftValue.slice(0, 1),
          margin + 25,
          y + 5.8
        );

        pdf.text(
          rightValue.slice(0, 1),
          margin +
            columnWidth +
            25,
          y + 5.8
        );

        y += rowHeight;
      }

      /*
       * ==========================================================
       * ADDITIONAL SPECIFICATIONS
       * ==========================================================
       */

      if (specificationText) {
        y += 3;

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(7);

        pdf.setTextColor(
          NAVY.r,
          NAVY.g,
          NAVY.b
        );

        pdf.text(
          "PRODUCT SPECIFICATIONS",
          margin,
          y
        );

        y += 4;

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(6.5);

        pdf.setTextColor(
          MUTED.r,
          MUTED.g,
          MUTED.b
        );

        const specLines =
          pdf.splitTextToSize(
            specificationText,
            contentWidth
          );

        pdf.text(
          specLines.slice(0, 3),
          margin,
          y
        );

        y += Math.min(
          specLines.length,
          3
        ) * 3.8;
      }

      /*
       * ==========================================================
       * REQUEST QUOTE CTA
       * ==========================================================
       */

      const ctaY =
        Math.min(
          y + 4,
          pageHeight - 39
        );

      pdf.setFillColor(
        NAVY.r,
        NAVY.g,
        NAVY.b
      );

      pdf.roundedRect(
        margin,
        ctaY,
        contentWidth,
        19,
        3,
        3,
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

      pdf.setFontSize(8);

      pdf.text(
        "READY TO SOURCE?",
        margin + 6,
        ctaY + 8
      );

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(6.2);

      pdf.setTextColor(
        220,
        228,
        236
      );

      pdf.text(
        "Request pricing, availability, packaging, quantity and commercial terms.",
        margin + 6,
        ctaY + 13
      );

      pdf.setTextColor(
        GOLD.r,
        GOLD.g,
        GOLD.b
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(8);

      pdf.text(
        "REQUEST A QUOTE  →",
        pageWidth - margin - 6,
        ctaY + 10,
        {
          align: "right",
        }
      );

      /*
       * ==========================================================
       * FOOTER
       * ==========================================================
       */

      const footerY =
        pageHeight - 9;

      pdf.setDrawColor(
        BORDER.r,
        BORDER.g,
        BORDER.b
      );

      pdf.setLineWidth(0.3);

      pdf.line(
        margin,
        footerY - 5,
        pageWidth - margin,
        footerY - 5
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(6.5);

      pdf.setTextColor(
        GOLD.r,
        GOLD.g,
        GOLD.b
      );

      pdf.text(
        "KRUPALI TRADERS PRIVATE LIMITED",
        margin,
        footerY
      );

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(5.8);

      pdf.setTextColor(
        MUTED.r,
        MUTED.g,
        MUTED.b
      );

      pdf.text(
        "IMPORT • EXPORT • GLOBAL TRADE",
        pageWidth - margin,
        footerY,
        {
          align: "right",
        }
      );

      /*
       * ==========================================================
       * GENERATE FILE
       * ==========================================================
       */

      const pdfBlob =
        pdf.output("blob");

      const fileName =
        `${safeFileName(name)}-krupali-traders.pdf`;

      const file = new File(
        [pdfBlob],
        fileName,
        {
          type: "application/pdf",
        }
      );

      /*
       * ==========================================================
       * MOBILE / SUPPORTED FILE SHARE
       * ==========================================================
       */

      if (
        typeof navigator !== "undefined" &&
        typeof navigator.share ===
          "function" &&
        typeof navigator.canShare ===
          "function" &&
        navigator.canShare({
          files: [file],
        })
      ) {
        await navigator.share({
          title: `${name} | Krupali Traders`,
          text: `Product profile for ${name} from Krupali Traders Private Limited.`,
          files: [file],
        });

        return;
      }

      /*
       * ==========================================================
       * DESKTOP FALLBACK — DOWNLOAD PDF
       * ==========================================================
       */

      const downloadUrl =
        URL.createObjectURL(pdfBlob);

      const anchor =
        document.createElement("a");

      anchor.href = downloadUrl;
      anchor.download = fileName;

      document.body.appendChild(anchor);

      anchor.click();

      anchor.remove();

      URL.revokeObjectURL(
        downloadUrl
      );

      alert(
        "Product PDF generated successfully and downloaded."
      );
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
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

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={loading}
      aria-label={`Share ${name}`}
      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
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