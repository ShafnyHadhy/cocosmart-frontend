import { useEffect } from "react";

export default function Modal({ open, onClose, title, children, widthClass = "max-w-2xl" }) {
  // Lock background scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      {/* Dialog */}
      <div className={`relative w-full ${widthClass} rounded-2xl bg-white p-4 sm:p-6 shadow-xl`}>
        <div className="mb-4 flex items-start justify-between">
          <h2 id="modal-title" className="text-lg font-semibold" style={{ color: "#2a5540" }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-2 hover:bg-gray-100"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
