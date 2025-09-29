// src/pages/inventory/UpdateStockModal.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Modal from "../../components/Modal.jsx";

// ---- API base (works in Vite & CRA) ----
const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_URL) ||
  (typeof process !== "undefined" && process.env && process.env.VITE_API_URL) ||
  "http://localhost:5000";

const STOCKS_API = `${API_BASE}/api/stocks`;

// ---- money helpers ----
const formatMoney = (n) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n ?? 0);

const parseMoney = (s) => {
  const n = Number(String(s || "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const cleanMoneyInput = (s) => {
  let v = String(s || "").replace(/,/g, "");
  v = v.replace(/[^\d.]/g, "");
  const parts = v.split(".");
  if (parts.length > 2) v = parts[0] + "." + parts.slice(1).join("");
  const [intPart, decPart = ""] = v.split(".");
  return decPart ? `${intPart}.${decPart.slice(0, 2)}` : intPart;
};

// ---- basic validations ----
const validateQty = (val) => {
  if (val === "" || val === null || val === undefined) return "Quantity is required.";
  const n = Number(val);
  if (!Number.isInteger(n) || n <= 0) return "Quantity must be a positive whole number.";
  return "";
};

const validateTotValue = (val) => {
  const n = parseMoney(val);
  if (!Number.isFinite(n) || n < 0) return "Total value must be a valid number.";
  return "";
};

const toDateInput = (val) => {
  if (!val) return "";
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};

const toYMD = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default function UpdateStockModal({ open, onClose, stockId, onUpdated }) {
  // if you already pass the whole stock doc, accept it here too:
  // export default function UpdateStockModal({ open, onClose, stock, onUpdated }) { ... }

  const [inputs, setInputs] = useState({
    stock_id: "",
    item_id: "",
    category: "",
    type: "",
    reason: "",
    qty: "",
    // tot_value is stored in DB; we also expose a helper unit_cost to recompute it
    unit_cost: "",
    tot_value: "",
    date: "",
    enter_by: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // limit date to last 7 days → today (like your AddStock)
  const todayLocal = new Date();
  const maxDate = toYMD(todayLocal);
  const minDate = toYMD(
    new Date(todayLocal.getFullYear(), todayLocal.getMonth(), todayLocal.getDate() - 7)
  );

  // fetch on open/stockId change
  useEffect(() => {
    if (!open || !stockId) return;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const { data } = await axios.get(`${STOCKS_API}/${stockId}`);
        const s = data?.stock || data;
        if (!s) throw new Error("Stock record not found.");

        // derive helper unit_cost from tot_value/qty (won’t be saved; only tot_value is sent)
        const qtyNum = Number(s.qty ?? 0);
        const unitCostNum =
          qtyNum > 0 ? Number(s.tot_value ?? 0) / qtyNum : 0;

        setInputs({
          stock_id: s.stock_id ?? "",
          item_id: s.item_id ?? "",
          category: s.category ?? "",
          type: (s.type ?? "").toString().toLowerCase() === "out" ? "Out" : "In",
          reason: s.reason ?? "",
          qty: String(s.qty ?? ""),
          unit_cost: unitCostNum ? formatMoney(unitCostNum) : "",
          tot_value:
            s.tot_value === null || s.tot_value === undefined
              ? ""
              : formatMoney(Number(s.tot_value)),
          date: toDateInput(s.date),
          enter_by: s.enter_by ?? "",
        });
        setSubmitted(false);
        setFieldErrors({});
      } catch (e) {
        setErr(e?.response?.data?.message || e.message || "Failed to load stock record.");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, stockId]);

  // recompute total when qty or unit_cost changes
  useEffect(() => {
    const q = Number(inputs.qty || 0);
    const uc = parseMoney(inputs.unit_cost);
    if (q > 0 && Number.isFinite(uc)) {
      const total = q * uc;
      setInputs((p) => ({ ...p, tot_value: total ? formatMoney(total) : "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs.qty, inputs.unit_cost]);

  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "qty") {
      let v = value.replace(/\D/g, "");
      if (v !== "" && Number(v) > 100000000) v = "100000000"; // hard cap just in case
      setInputs((p) => ({ ...p, qty: v }));
      if (submitted) setFieldErrors((fe) => ({ ...fe, qty: validateQty(v) }));
      return;
    }

    if (name === "unit_cost") {
      const cleaned = cleanMoneyInput(value);
      setInputs((p) => ({ ...p, unit_cost: cleaned }));
      return;
    }

    if (name === "tot_value") {
      const cleaned = cleanMoneyInput(value);
      setInputs((p) => ({ ...p, tot_value: cleaned }));
      if (submitted) setFieldErrors((fe) => ({ ...fe, tot_value: validateTotValue(cleaned) }));
      return;
    }

    setInputs((p) => ({ ...p, [name]: value }));
  };

  const disableSave = useMemo(() => {
    if (!inputs.item_id || !inputs.category || !inputs.type || !inputs.reason || !inputs.date) return true;
    if (validateQty(inputs.qty)) return true;
    if (validateTotValue(inputs.tot_value)) return true;
    return false || saving || loading;
  }, [inputs, saving, loading]);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setErr("");

    const newErrors = {
      qty: validateQty(inputs.qty),
      tot_value: validateTotValue(inputs.tot_value),
    };
    setFieldErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    try {
      setSaving(true);
      await axios.put(`${STOCKS_API}/${encodeURIComponent(stockId)}`, {
        // stock_id is immutable on server
        item_id: String(inputs.item_id).trim(),
        category: String(inputs.category),
        type: String(inputs.type).toLowerCase(), // "in" | "out"
        reason: String(inputs.reason).trim(),
        qty: Number(inputs.qty),
        tot_value: parseMoney(inputs.tot_value),
        date: inputs.date, // YYYY-MM-DD
        enter_by: String(inputs.enter_by || "Manager1"),
      });
      onUpdated?.();
      onClose?.();
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed to update stock record.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Update ${inputs.stock_id || "Stock"} (ID locked)`}
    >
      {loading ? (
        <div className="py-8 grid place-items-center text-gray-600">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-transparent mr-2" />
          Loading…
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          {/* Stock ID (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock ID</label>
            <input
              value={inputs.stock_id}
              readOnly
              className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-600"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Item ID */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Item ID</label>
              <input
                name="item_id"
                value={inputs.item_id}
                onChange={onChange}
                required
                className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-[color:#2a5540]"
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
              <select
                name="category"
                value={inputs.category}
                onChange={onChange}
                required
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[color:#2a5540]"
              >
                <option value="">-- Select Category --</option>
                <option value="Product">Product</option>
                <option value="Purchased">Purchased</option>
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
              <select
                name="type"
                value={inputs.type}
                onChange={onChange}
                required
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[color:#2a5540]"
              >
                <option value="">-- Select Type --</option>
                <option value="In">In</option>
                <option value="Out">Out</option>
              </select>
            </div>

            {/* Reason */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Reason</label>
              <input
                name="reason"
                value={inputs.reason}
                onChange={onChange}
                placeholder="e.g., Purchase, Sale, Wastage, Adjustment"
                required
                className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-[color:#2a5540]"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Quantity</label>
              <input
                name="qty"
                value={inputs.qty}
                onChange={onChange}
                inputMode="numeric"
                pattern="\d*"
                required
                className={`w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 ${
                  submitted && fieldErrors.qty
                    ? "border-red-400 focus:ring-red-500"
                    : "border-gray-200 focus:ring-[color:#2a5540]"
                }`}
              />
              {submitted && fieldErrors.qty && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.qty}</p>
              )}
            </div>

            {/* Unit Cost (helper only; not stored) */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Unit Cost (helper)
              </label>
              <input
                name="unit_cost"
                value={inputs.unit_cost}
                onChange={onChange}
                onFocus={(e) =>
                  setInputs((p) => ({
                    ...p,
                    unit_cost: String(e.target.value || "").replace(/,/g, ""),
                  }))
                }
                placeholder="e.g., 1,000.00"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-[color:#2a5540]"
              />
              <p className="mt-1 text-xs text-gray-500">
                Used to auto-calc Total Value (not saved separately).
              </p>
            </div>

            {/* Total Value */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Total Value (LKR)
              </label>
              <input
                name="tot_value"
                value={inputs.tot_value}
                onChange={onChange}
                onFocus={(e) =>
                  setInputs((p) => ({
                    ...p,
                    tot_value: String(e.target.value || "").replace(/,/g, ""),
                  }))
                }
                required
                className={`w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 ${
                  submitted && fieldErrors.tot_value
                    ? "border-red-400 focus:ring-red-500"
                    : "border-gray-200 focus:ring-[color:#2a5540]"
                }`}
              />
              {submitted && fieldErrors.tot_value && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.tot_value}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                name="date"
                value={inputs.date}
                onChange={onChange}
                min={minDate}
                max={maxDate}
                required
                className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-[color:#2a5540]"
              />
            </div>

            {/* Entered by */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Entered By</label>
              <input
                name="enter_by"
                value={inputs.enter_by}
                onChange={onChange}
                placeholder="e.g., Manager1"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-[color:#2a5540]"
              />
            </div>
          </div>

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
              disabled={disableSave}
              className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${
                disableSave ? "bg-gray-400" : "transition-colors"
              }`}
              style={{ backgroundColor: disableSave ? undefined : "#2a5540" }}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
