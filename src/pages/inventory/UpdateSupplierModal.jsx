import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "../../components/Modal.jsx"; // ← adjust path if needed

// --- Validators / sanitizers ---
const sanitizeSupName = (v) => v.replace(/[^A-Za-z\s\-_]/g, "");
const validateSupName = (v) => {
  if (!v) return "Supplier name is required.";
  return /^[A-Za-z\s\-_]+$/.test(v)
    ? ""
    : "Only letters, spaces, dash (-) and underscore (_) are allowed.";
};

const isValidEmail = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || "").trim());

const sanitizeContact = (v) => v.replace(/\D/g, "").slice(0, 10);

// allow letters, numbers, spaces and these: , . / - #
const sanitizeAddress = (v) => v.replace(/[^A-Za-z0-9\s,.\-/#]/g, "");

export default function UpdateSupplierModal({
  open,
  onClose,
  supplier,
  onUpdated,
}) {
  const [inputs, setInputs] = useState({
    sup_id: "",
    sup_name: "",
    email: "",
    contact: "",
    address: "",
  });

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    sup_name: "",
    email: "",
  });
  const [touched, setTouched] = useState({
    email: false,
  });

  // preload when supplier changes
  useEffect(() => {
    if (!supplier) return;
    setInputs({
      sup_id: supplier.sup_id ?? "",
      sup_name: supplier.sup_name ?? "",
      email: supplier.email ?? "",
      contact: supplier.contact ?? "",
      address: supplier.address ?? "",
    });
    setErr("");
    setFieldErrors({ sup_name: "", email: "" });
    setTouched({ email: false });
  }, [supplier, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "sup_name") {
      const clean = sanitizeSupName(value);
      setInputs((p) => ({ ...p, sup_name: clean }));
      const msg = validateSupName(clean);
      setFieldErrors((fe) => ({ ...fe, sup_name: msg }));
      return;
    }

    if (name === "email") {
      setInputs((p) => ({ ...p, email: value }));
      if (touched.email) {
        setFieldErrors((fe) => ({
          ...fe,
          email: isValidEmail(value) ? "" : "Enter a valid email.",
        }));
      }
      return;
    }

    if (name === "contact") {
      const digits = sanitizeContact(value);
      setInputs((p) => ({ ...p, contact: digits }));
      return;
    }

    if (name === "address") {
      setInputs((p) => ({ ...p, address: sanitizeAddress(value) }));
      return;
    }

    setInputs((p) => ({ ...p, [name]: value }));
  };

  const onEmailBlur = () => {
    setTouched((t) => ({ ...t, email: true }));
    setFieldErrors((fe) => ({
      ...fe,
      email: isValidEmail(inputs.email) ? "" : "Enter a valid email.",
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    // final validations
    const nameErr = validateSupName(inputs.sup_name);
    const emailErr = isValidEmail(inputs.email) ? "" : "Enter a valid email.";
    const contactErr =
      inputs.contact.length === 10 ? "" : "Contact must be 10 digits.";

    const newErrors = {
      sup_name: nameErr,
      email: emailErr,
      contact: contactErr,
    };
    setFieldErrors((fe) => ({ ...fe, ...newErrors }));
    setTouched((t) => ({ ...t, email: true }));

    if (nameErr || emailErr || contactErr) return;

    try {
      setSaving(true);
      await axios.put(`http://localhost:5000/api/suppliers/${supplier._id}`, {
        sup_name: String(inputs.sup_name).trim(),
        email: String(inputs.email).trim(),
        contact: String(inputs.contact),
        address: String(inputs.address).trim(),
        // sup_id is immutable (read-only)
      });
      onUpdated?.();
      onClose?.();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to update supplier.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Update ${inputs.sup_id} (ID locked)`}
    >
      <form onSubmit={submit} className="space-y-5">
        {/* ID (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Supplier ID
          </label>
          <input
            value={inputs.sup_id}
            readOnly
            className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-600"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Supplier Name
            </label>
            <input
              type="text"
              name="sup_name"
              value={inputs.sup_name}
              onChange={handleChange}
              required
              onBeforeInput={(e) => {
                if (e.data && /[^A-Za-z\s\-_]/.test(e.data)) e.preventDefault();
              }}
              onPaste={(e) => {
                const pasted = (
                  e.clipboardData || window.clipboardData
                ).getData("text");
                if (/[^A-Za-z\s\-_]/.test(pasted)) {
                  e.preventDefault();
                  const t = e.target,
                    start = t.selectionStart,
                    end = t.selectionEnd;
                  const clean = sanitizeSupName(pasted);
                  const newVal =
                    inputs.sup_name.slice(0, start) +
                    clean +
                    inputs.sup_name.slice(end);
                  setInputs((p) => ({ ...p, sup_name: newVal }));
                }
              }}
              className={`w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 ${
                fieldErrors.sup_name
                  ? "border-red-400 focus:ring-red-500"
                  : "border-gray-200 focus:ring-[color:#2a5540]"
              }`}
            />
            {fieldErrors.sup_name && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.sup_name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={inputs.email}
              onChange={handleChange}
              onBlur={onEmailBlur}
              required
              placeholder="name@example.com"
              className={`w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 ${
                fieldErrors.email
                  ? "border-red-400 focus:ring-red-500"
                  : "border-gray-200 focus:ring-[color:#2a5540]"
              }`}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          {/* Contact */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Contact
            </label>
            <input
              type="text"
              name="contact"
              value={inputs.contact}
              onChange={handleChange}
              required
              inputMode="numeric"
              pattern="\d*"
              placeholder="10 digits"
              className={`w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 ${
                fieldErrors.contact
                  ? "border-red-400 focus:ring-red-500"
                  : "border-gray-200 focus:ring-[color:#2a5540]"
              }`}
            />
            {fieldErrors.contact && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.contact}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Address
            </label>
            <textarea
              name="address"
              rows={3}
              value={inputs.address}
              onChange={handleChange}
              required
              placeholder="Street, City, Province"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-[color:#2a5540]"
            />
          </div>
        </div>

        {/* Footer */}
        {err && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {err}
          </div>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${
              saving ? "bg-gray-400" : "transition-colors"
            }`}
            style={{ backgroundColor: saving ? undefined : "#2a5540" }}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
