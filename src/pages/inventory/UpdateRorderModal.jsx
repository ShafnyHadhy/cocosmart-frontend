// src/pages/rorders/UpdateRorderModal.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "../../components/Modal.jsx";

// --- Money helpers ---
const MONEY_LIMITS = { min: 10, max: 1_000_000 };

const cleanMoneyInput = (s) => {
  let v = String(s || "").replace(/,/g, "");
  v = v.replace(/[^\d.]/g, "");
  const parts = v.split(".");
  if (parts.length > 2) v = parts[0] + "." + parts.slice(1).join("");
  const [intPart, decPart = ""] = v.split(".");
  return decPart ? `${intPart}.${decPart.slice(0, 2)}` : intPart;
};

const parseMoney = (s) => {
  const n = Number(String(s || "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : NaN;
};

const formatMoney = (n) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const validateUnitCost = (val) => {
  if (val === "" || val === null || val === undefined) return "Unit cost is required.";
  const num = parseMoney(val);
  if (!Number.isFinite(num)) return "Unit cost must be a number.";
  if (num <= 0) return "Unit cost must be positive.";
  if (num < MONEY_LIMITS.min) return `Unit cost must be at least ${formatMoney(MONEY_LIMITS.min)}.`;
  if (num > MONEY_LIMITS.max) return `Unit cost must be at most ${formatMoney(MONEY_LIMITS.max)}.`;
  if (/\.\d{3,}$/.test(String(val).replace(/,/g, ""))) return "Unit cost can have at most 2 decimal places.";
  return "";
};

export default function UpdateRorderModal({ open, onClose, item, onUpdated }) {
  const [inputs, setInputs] = useState({
    order_id: "",
    item_id: "",
    unit_cost: "",
    qty: "",
    tot_value: "",
    requested_by: "",
  });

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!item) return;
    const unit = Number(item.unit_cost) || 0;
    const qty = Number(item.qty) || 0;
    const total = unit * qty;

    setInputs({
      order_id: item.order_id ?? "",
      item_id: item.item_id ?? "",
      unit_cost: unit ? formatMoney(unit) : "",
      qty: qty ? String(qty) : "",
      tot_value: total ? formatMoney(total) : "",
      requested_by: item.requested_by ?? "",
    });
    setErr("");
    setFieldErrors({});
    setSubmitted(false);
  }, [item, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "unit_cost") {
      const cleaned = cleanMoneyInput(value);
      if (cleaned === "") {
        setInputs((p) => ({ ...p, unit_cost: "" }));
        setFieldErrors((fe) => ({ ...fe, unit_cost: "" }));
        return;
      }
      const num = parseMoney(cleaned);
      if (Number.isFinite(num) && num > MONEY_LIMITS.max) {
        setFieldErrors((fe) => ({
          ...fe,
          unit_cost: `Unit cost must be at most ${formatMoney(MONEY_LIMITS.max)}.`,
        }));
        return;
      }
      setFieldErrors((fe) => ({ ...fe, unit_cost: "" }));
      setInputs((p) => ({ ...p, unit_cost: cleaned }));
      return;
    }

    if (name === "qty") {
      let v = value.replace(/\D/g, "");
      if (v !== "" && Number(v) > 10000) v = "10000";
      const num = Number(v) || 0;
      const cost = parseMoney(inputs.unit_cost) || 0;
      const total = num * cost;
      setInputs((p) => ({ ...p, qty: v, tot_value: total ? formatMoney(total) : "" }));
      return;
    }

    setInputs((p) => ({ ...p, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setErr("");

    const unitCostError = validateUnitCost(inputs.unit_cost);
    const newErrors = { unit_cost: unitCostError };
    setFieldErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) return;

    try {
      setSaving(true);
      await axios.put(`http://localhost:5000/api/rorders/${item._id}`, {
        item_id: String(inputs.item_id).trim(),
        unit_cost: parseMoney(inputs.unit_cost),
        qty: Number(inputs.qty),
        requested_by: String(inputs.requested_by).trim(),
      });
      onUpdated?.();
      onClose?.();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to update reorder.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Update ${inputs.order_id} (ID locked)`}>
      <form onSubmit={submit} className="space-y-5">
        {/* Order ID (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Order ID</label>
          <input
            value={inputs.order_id}
            readOnly
            className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-600"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Item ID */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Item ID</label>
            <input
              type="text"
              name="item_id"
              value={inputs.item_id}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-[color:#2a5540]"
            />
          </div>

          {/* Unit Cost */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Unit Cost (LKR)</label>
            <input
              type="text"
              name="unit_cost"
              value={inputs.unit_cost}
              onChange={handleChange}
              onFocus={(e) => {
                const raw = String(e.target.value || "").replace(/,/g, "");
                setInputs((p) => ({ ...p, unit_cost: raw }));
              }}
              onBlur={(e) => {
                let num = parseMoney(e.target.value);
                if (!Number.isFinite(num)) {
                  setFieldErrors((p) => ({ ...p, unit_cost: "Unit cost is required." }));
                  return;
                }
                if (num < MONEY_LIMITS.min) num = MONEY_LIMITS.min;
                if (num > MONEY_LIMITS.max) {
                  setFieldErrors((p) => ({
                    ...p,
                    unit_cost: `Unit cost must be at most ${formatMoney(MONEY_LIMITS.max)}.`,
                  }));
                  return;
                }
                setInputs((p) => ({ ...p, unit_cost: formatMoney(num) }));
                setFieldErrors((p) => ({ ...p, unit_cost: "" }));
              }}
              required
              className={`w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 ${
                submitted && fieldErrors.unit_cost
                  ? "border-red-400 focus:ring-red-500"
                  : "border-gray-200 focus:ring-[color:#2a5540]"
              }`}
            />
            {submitted && fieldErrors.unit_cost && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.unit_cost}</p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="text"
              name="qty"
              value={inputs.qty}
              onChange={handleChange}
              required
              inputMode="numeric"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-[color:#2a5540]"
            />
          </div>

          {/* Total Value (read-only) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Total Value (LKR)</label>
            <input
              type="text"
              name="tot_value"
              value={inputs.tot_value}
              readOnly
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-600"
            />
          </div>

          {/* Requested By */}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Requested By</label>
            <input
              type="text"
              name="requested_by"
              value={inputs.requested_by}
              onChange={handleChange}
              required
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
