import React, { useMemo } from "react";
import { QRCodeCanvas } from "qrcode.react";

/**
 * Choose ONE of these approaches for the QR destination:
 *
 * A) GOOGLE SITES (recommended for your presentation)
 *    - Create a page per product, e.g.:
 *      https://sites.google.com/view/cocsmart/products/PRD001
 *    - Set VITE_PUBLIC_QR_BASE to: https://sites.google.com/view/cocsmart/products
 *
 * B) APPS SCRIPT (dynamic from Google Sheet)
 *    - Deploy your Web App and use the /exec URL.
 *    - Set VITE_PUBLIC_QR_BASE to your exec URL (without query), e.g.:
 *      https://script.google.com/macros/s/XXXX/exec
 *    - The code will append ?id=PRD001 automatically.
 */

// Set this in your .env.local (Vite) or change the fallback here:
const PUBLIC_QR_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_PUBLIC_QR_BASE) ||
  // Fallback (edit to your Google Sites base path):
  "https://sites.google.com/view/cocsmart/products";

// If PUBLIC_QR_BASE looks like an Apps Script exec URL, we’ll use ?id=...
const looksLikeAppsScript = /script\.google\.com\/macros\/s\/.+\/exec$/i.test(
  PUBLIC_QR_BASE
);

function buildPublicUrl(product) {
  const id = encodeURIComponent(product.pro_id || "");
  if (looksLikeAppsScript) {
    // Apps Script mode: https://.../exec?id=PRD001
    return `${PUBLIC_QR_BASE}?id=${id}`;
  }
  // Google Sites (or any path-style): https://.../products/PRD001
  return `${PUBLIC_QR_BASE}/${id}`;
}

export default function QrCodeModal({ open, onClose, product }) {
  if (!open || !product) return null;

  const url = useMemo(() => buildPublicUrl(product), [product]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl text-center max-w-[380px] w-[90vw]">
        <h2 className="text-xl font-bold mb-3">{product.pro_name}</h2>

        {/* Bigger, high-contrast QR for reliable scanning */}
        <div className="mx-auto inline-block p-2 bg-white rounded-xl border">
          <QRCodeCanvas value={url} size={320} includeMargin bgColor="#ffffff" fgColor="#000000" />
        </div>

        {/* Show the URL below so people can tap it if needed */}
        <p className="text-xs text-gray-600 mt-3 break-all">
          <a href={url} target="_blank" rel="noreferrer">{url}</a>
        </p>

        <button
          onClick={onClose}
          className="mt-4 px-5 py-2 rounded-lg text-white font-semibold"
          style={{ backgroundColor: "#2a5540" }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
