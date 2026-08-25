"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";

type ShareProductButtonProps = {
  productName: string;
  productType: "IMPORT" | "EXPORT";
  productDescription?: string;
};

export default function ShareProductButton({
  productName,
  productType,
  productDescription,
}: ShareProductButtonProps) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    const typeLabel =
      productType === "IMPORT"
        ? "Import Product"
        : "Export Product";

    const text = [
      `KRUPALI TRADERS - ${typeLabel}`,
      "",
      productName,
      productDescription?.trim() || "",
      "",
      `View product catalogue: ${url}`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      setSharing(true);

      if (typeof navigator.share === "function") {
        await navigator.share({
          title: `${productName} | Krupali Traders`,
          text,
          url,
        });

        return;
      }

      await navigator.clipboard.writeText(text);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      try {
        await navigator.clipboard.writeText(text);

        setCopied(true);

        window.setTimeout(() => {
          setCopied(false);
        }, 2500);
      } catch {
        // Clipboard may be unavailable.
      }
    } finally {
      setSharing(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={sharing}
      aria-label={`Share ${productName}`}
      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-3.5 text-sm font-bold text-[var(--foreground)] shadow-sm transition hover:-translate-y-0.5 hover:border-[#c9a24d]/50 hover:bg-[#c9a24d]/10 hover:text-[#a17b2d] disabled:cursor-wait disabled:opacity-60 dark:hover:text-[#d8b45b]"
    >
      {copied ? (
        <Check className="h-4 w-4" />
      ) : (
        <Share2 className="h-4 w-4" />
      )}

      {sharing
        ? "Sharing..."
        : copied
          ? "Link Copied"
          : "Share Product"}
    </button>
  );
}