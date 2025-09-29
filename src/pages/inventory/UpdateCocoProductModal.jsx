// src/pages/inventory/UpdateCocoProductModal.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "../../components/Modal.jsx";

/* --- constants / helpers --- */
const MONEY_LIMITS = { min: 0.01, max: 10_000 };
const QTY_MAX = 1_000_000;

const CATEGORIES = [
  "Fresh",
  "Milk & Cream",
  "Oil",
  "Desiccated",
  "Flour & Sugar",
  "Snacks & Drinks",
];

// Optional: keep UOM independent of category (matches your current page)
const UOMS = [
  "Pieces (pcs)",
  "Bunches (bch)",
  "Bags (bag)",
  "Liters (L)",
  "Milliliters (mL)",
  "Kilograms (kg)",
  "Metric Tons (t / MT)",
];

const UPDATED_BY_OPTIONS = ["inv-mgr-001", "inv-mgr-002", "inv-mgr-003"];

const toDateInput = (val) => {
  if (!val) return "";
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};
const todayISO = () => new Date().toISOString().slice(0, 10);

const formatMoney = (n) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

const parseMoney = (s) => {
  const n = Number(String(s || "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : NaN;
};

const cleanMoneyInput = (s) => {
  // keep digits and one dot; max 2dp; clamp max later
  let v = String(s || "").replace(/,/g, "").replace(/[^\d.]/g, "");
  const firstDot = v.indexOf(".");
  if (firstDot !== -1) v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, "");
  if (v.startsWith(".")) v = "0" + v;
  if (/^0\d/.test(v)) v = v.replace(/^0+(?=\d)/, "");
  if (v.includes(".")) {
    const [i, d] = v.split(".");
    v = `${i}.${d.slice(0, 2)}`;
  }
  return v;
};

const formatInt = (n) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);

const cleanQty = (s) => {
  const v = String(s || "").replace(/[^\d]/g, "");
  if (!v) return "";
  const n = Math.min(QTY_MAX, Number(v));
  return String(n);
};

const sanitizeName = (val) => val.replace(/[^A-Za-z ]+/g, "");
const validateName = (val) => {
  if (!val) return "Product name is required.";
  return /^[A-Za-z ]+$/.test(val) ? "" : "Only letters and spaces are allowed.";
};

const validateStdCost = (val) => {
  if (val === "" || val === null || val === undefined) return "Standard cost is required.";
  const num = parseMoney(val);
  if (!Number.isFinite(num)) return "Standard cost must be a number.";
  if (num < MONEY_LIMITS.min) return `Standard cost must be at least ${formatMoney(MONEY_LIMITS.min)}.`;
  if (num > MONEY_LIMITS.max) return `Standard cost must be at most ${formatMoney(MONEY_LIMITS.max)}.`;
  if (/\.\d{3,}$/.test(String(val).replace(/,/g, ""))) return "Standard cost can have at most 2 decimal places.";
  return "";
};

export default function UpdateCocoProductModal({ open, onClose, item, onUpdated }) {
  const [inputs, setInputs] = useState({
    pro_id: "",
    pro_name: "",
    pro_category: "",
    pro_uom: "",
    std_cost: "",
    qty_on_hand: "",
    qty_reserved: "",
    expire_date: "",
    updated_by: "",
    updated_at: "", // read-only display
  });

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // load item into form on open
  useEffect(() => {
    if (!item) return;
    const onHandNum = Number(item.qty_on_hand ?? 0);
    const stdCostNum = Number(item.std_cost ?? 0);

    setInputs({
      pro_id: item.pro_id ?? "",
      pro_name: item.pro_name ?? "",
      pro_category: item.pro_category ?? "",
      pro_uom: item.pro_uom && item.pro_uom !== "undefined" ? item.pro_uom : "",
      std_cost:
        Number.isFinite(stdCostNum)
          ? formatMoney(Math.min(MONEY_LIMITS.max, Math.max(MONEY_LIMITS.min, stdCostNum)))
          : "",
      qty_on_hand:
        Number.isFinite(onHandNum) ? formatInt(Math.min(QTY_MAX, Math.max(0, onHandNum))) : "",
      qty_reserved: String(item.qty_reserved ?? ""),
      expire_date: toDateInput(item.expire_date) || "",
      updated_by: item.updated_by ?? "",
      updated_at: toDateInput(item.updated_at || item.updatedAt) || todayISO(),
    });
    setErr("");
    setFieldErrors({});
    setSubmitted(false);
  }, [item, open]);

  // live validation: reserved ≤ on-hand
  const reservedError = (() => {
    const onHand = Number(String(inputs.qty_on_hand || "").replace(/,/g, ""));
    const reserved = Number(inputs.qty_reserved);
    if (
      inputs.qty_reserved !== "" &&
      Number.isFinite(onHand) &&
      Number.isFinite(reserved) &&
      reserved > onHand
    ) {
      return "Qty Reserved must be ≤ Qty on Hand.";
    }
    return "";
  })();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "pro_name") {
      const clean = sanitizeName(value);
      setInputs((p) => ({ ...p, pro_name: clean }));
      if (submitted) {
        setFieldErrors((fe) => ({ ...fe, pro_name: validateName(clean) }));
      }
      return;
    }

    if (name === "std_cost") {
      const cleaned = cleanMoneyInput(value);
      if (cleaned === "") {
        setInputs((p) => ({ ...p, std_cost: "" }));
        setFieldErrors((fe) => ({ ...fe, std_cost: "" }));
        return;
      }
      const num = parseMoney(cleaned);
      if (Number.isFinite(num) && num > MONEY_LIMITS.max) {
        setFieldErrors((fe) => ({
          ...fe,
          std_cost: `Standard cost must be at most ${formatMoney(MONEY_LIMITS.max)}.`,
        }));
        return;
      }
      setFieldErrors((fe) => ({ ...fe, std_cost: "" }));
      setInputs((p) => ({ ...p, std_cost: cleaned }));
      return;
    }

    if (name === "qty_on_hand") {
      setInputs((p) => ({ ...p, qty_on_hand: cleanQty(value) }));
      return;
    }

    if (name === "qty_reserved") {
      // numeric only, cap by on-hand via UI trim here
      let v = value.replace(/\D/g, "");
      const onHand = Number(String(inputs.qty_on_hand || "").replace(/,/g, "")) || 0;
      if (v !== "" && Number(v) > onHand) v = String(onHand);
      setInputs((p) => ({ ...p, qty_reserved: v }));
      return;
    }

    if (name === "expire_date") {
      const today = todayISO();
      setInputs((p) => ({ ...p, expire_date: value && value < today ? today : value }));
      return;
    }

    setInputs((p) => ({ ...p, [name]: value }));
  };

  const onStdCostFocus = (e) => {
    const raw = String(e.target.value || "").replace(/,/g, "");
    setInputs((p) => ({ ...p, std_cost: raw }));
  };

  const onStdCostBlur = (e) => {
    let num = parseMoney(e.target.value);
    if (!Number.isFinite(num)) {
      setFieldErrors((p) => ({ ...p, std_cost: "Standard cost is required." }));
      return;
    }
    if (num < MONEY_LIMITS.min) num = MONEY_LIMITS.min;
    if (num > MONEY_LIMITS.max) {
      setFieldErrors((p) => ({
        ...p,
        std_cost: `Standard cost must be at most ${formatMoney(MONEY_LIMITS.max)}.`,
      }));
      return;
    }
    setInputs((p) => ({ ...p, std_cost: formatMoney(num) }));
    setFieldErrors((p) => ({ ...p, std_cost: "" }));
  };

  const onQtyOnHandFocus = () => {
    setInputs((p) => ({ ...p, qty_on_hand: String(p.qty_on_hand || "").replace(/,/g, "") }));
  };
  const onQtyOnHandBlur = () => {
    const raw = String(inputs.qty_on_hand || "").replace(/,/g, "");
    if (raw === "") return;
    const n = Math.min(QTY_MAX, Number(raw.replace(/[^\d]/g, "") || 0));
    setInputs((p) => ({ ...p, qty_on_hand: formatInt(n) }));
    // also trim reserved if it now exceeds on-hand
    const reserved = Number(inputs.qty_reserved || 0);
    if (reserved > n) {
      setInputs((p) => ({ ...p, qty_reserved: String(n) }));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setErr("");

    const errors = {
      pro_name: validateName(inputs.pro_name),
      std_cost: validateStdCost(inputs.std_cost),
      qty_reserved: reservedError,
    };
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    try {
      setSaving(true);
      await axios.put(`http://localhost:5000/api/cocoProducts/${item._id}`, {
        pro_name: String(inputs.pro_name).trim(),
        pro_category: String(inputs.pro_category),
        pro_uom: String(inputs.pro_uom),
        std_cost: parseMoney(inputs.std_cost),
        qty_on_hand: Number(String(inputs.qty_on_hand || "").replace(/,/g, "")) || 0,
        qty_reserved: Number(inputs.qty_reserved || 0),
        expire_date: inputs.expire_date || null,
        updated_by: String(inputs.updated_by),
      });
      onUpdated?.();
      onClose?.();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  const today = todayISO();

  return (
    <Modal open={open} onClose={onClose} title={`Update ${inputs.pro_id} (ID locked)`}>
      <form onSubmit={submit} className="space-y-5">
        {/* Product ID (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Product ID</label>
          <input
            value={inputs.pro_id}
            readOnly
            className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-600"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Product Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Product Name</label>
            <input
              type="text"
              name="pro_name"
              value={inputs.pro_name}
              onChange={handleChange}
              required
              onBeforeInput={(e) => {
                if (e.data && /[^A-Za-z ]/.test(e.data)) e.preventDefault();
              }}
              onPaste={(e) => {
                const pasted = (e.clipboardData || window.clipboardData).getData("text") || "";
                if (/[^A-Za-z ]/.test(pasted)) {
                  e.preventDefault();
                  const t = e.target;
                  const start = t.selectionStart ?? inputs.pro_name.length;
                  const end = t.selectionEnd ?? inputs.pro_name.length;
                  const clean = sanitizeName(pasted);
                  const newVal = inputs.pro_name.slice(0, start) + clean + inputs.pro_name.slice(end);
                  setInputs((p) => ({ ...p, pro_name: newVal }));
                }
              }}
              className={`w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 ${
                submitted && fieldErrors.pro_name
                  ? "border-red-400 focus:ring-red-500"
                  : "border-gray-200 focus:ring-[color:#2a5540]"
              }`}
            />
            {submitted && fieldErrors.pro_name && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.pro_name}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
            <select
              name="pro_category"
              value={inputs.pro_category}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[color:#2a5540]"
            >
              <option value="">-- Select Category --</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* UOM */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Unit of Measurement (UOM)</label>
            <select
              name="pro_uom"
              value={inputs.pro_uom}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[color:#2a5540]"
            >
              <option value="">-- Select Unit --</option>
              {UOMS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Standard Cost */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Standard Cost</label>
            <input
              type="text"
              name="std_cost"
              value={inputs.std_cost}
              inputMode="decimal"
              placeholder="e.g. 1,000.00"
              onChange={handleChange}
              onFocus={onStdCostFocus}
              onBlur={onStdCostBlur}
              required
              className={`w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 ${
                submitted && fieldErrors.std_cost
                  ? "border-red-400 focus:ring-red-500"
                  : "border-gray-200 focus:ring-[color:#2a5540]"
              }`}
            />
            {submitted && fieldErrors.std_cost && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.std_cost}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">Min {formatMoney(MONEY_LIMITS.min)} • Max {formatMoney(MONEY_LIMITS.max)}</p>
          </div>

          {/* Qty on Hand */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Qty on Hand</label>
            <input
              type="text"
              name="qty_on_hand"
              value={inputs.qty_on_hand}
              onChange={handleChange}
              onFocus={onQtyOnHandFocus}
              onBlur={onQtyOnHandBlur}
              inputMode="numeric"
              pattern="\d*"
              required
              placeholder={`max ${formatInt(QTY_MAX)}`}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-[color:#2a5540]"
            />
          </div>

          {/* Qty Reserved (≤ on-hand) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Qty Reserved</label>
            <input
              type="text"
              name="qty_reserved"
              value={inputs.qty_reserved}
              onChange={handleChange}
              inputMode="numeric"
              pattern="\d*"
              required
              className={`w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 ${
                (submitted && reservedError)
                  ? "border-red-400 focus:ring-red-500"
                  : "border-gray-200 focus:ring-[color:#2a5540]"
              }`}
            />
            {(submitted && reservedError) && (
              <p className="mt-1 text-sm text-red-600">{reservedError}</p>
            )}
          </div>

          {/* Expire Date (no past dates) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Expire Date</label>
            <input
              type="date"
              name="expire_date"
              value={inputs.expire_date || ""}
              min={today}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-[color:#2a5540]"
            />
            <p className="mt-1 text-xs text-gray-500">Past dates are blocked.</p>
          </div>

          {/* Updated By */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Updated By</label>
            <select
              name="updated_by"
              value={inputs.updated_by}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[color:#2a5540]"
            >
              <option value="">-- Select manager --</option>
              {UPDATED_BY_OPTIONS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Updated At (read-only display) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Updated At</label>
            <input
              type="date"
              value={inputs.updated_at || today}
              readOnly
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-600"
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
            onClick={submit}
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
