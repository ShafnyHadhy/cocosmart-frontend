import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "../../components/Modal.jsx";

// --- Category → UOM options ---
const CATEGORY_UOMS = {
  Fertilizer: ["kg", "g", "bag", "tonne"],
  Packaging: ["piece", "bundle", "box", "roll"],
  Tools: ["piece", "set", "box"],
  Chemicals: ["L", "mL", "kg", "drum"],
  Machinery: ["unit", "set", "piece"],
};

// --- Money helpers + validation ---
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

// Item name helpers
const sanitizeItemName = (val) => val.replace(/[^A-Za-z\s\-_]/g, "");
const validateItemName = (val) => {
  if (!val) return "Item name is required.";
  const ok = /^[A-Za-z\s\-_]+$/.test(val);
  return ok ? "" : "Item name can only contain letters, spaces, dash (-), and underscore (_).";
};

const toDateInput = (val) => {
  if (!val) return "";
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};

export default function UpdatePurchasedItemModal({ open, onClose, item, onUpdated }) {
  const [inputs, setInputs] = useState({
    item_id: "",
    item_name: "",
    category: "",
    item_unit: "",
    unit_cost: "",
    ROL: "",
    quantity: "",
    expire_date: "",
    supplier: "",
  });

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!item) return;
    setInputs({
      item_id: item.item_id ?? "",
      item_name: item.item_name ?? "",
      category: item.category ?? "",
      item_unit: item.item_unit ?? "",
      unit_cost:
        item.unit_cost === null || item.unit_cost === undefined ? "" : formatMoney(Number(item.unit_cost)),
      ROL: String(item.ROL ?? ""),
      quantity: String(item.quantity ?? ""),
      expire_date: toDateInput(item.expire_date),
      supplier: item.supplier ?? "",
    });
    setErr("");
    setFieldErrors({});
    setSubmitted(false);
  }, [item, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "item_name") {
      const clean = sanitizeItemName(value);
      setInputs((p) => ({ ...p, item_name: clean }));
      if (submitted) setFieldErrors((fe) => ({ ...fe, item_name: validateItemName(clean) }));
      return;
    }

    if (name === "category") {
      setInputs((p) => ({ ...p, category: value, item_unit: "" }));
      return;
    }

    if (name === "unit_cost") {
      const cleaned = cleanMoneyInput(value);
      if (cleaned === "") {
        setInputs((p) => ({ ...p, unit_cost: "" }));
        setFieldErrors((fe) => ({ ...fe, unit_cost: "" }));
        return;
      }
      const num = parseMoney(cleaned);
      if (Number.isFinite(num) && num > MONEY_LIMITS.max) {
        setFieldErrors((fe) => ({ ...fe, unit_cost: `Unit cost must be at most ${formatMoney(MONEY_LIMITS.max)}.` }));
        return;
      }
      setFieldErrors((fe) => ({ ...fe, unit_cost: "" }));
      setInputs((p) => ({ ...p, unit_cost: cleaned }));
      return;
    }

    if (name === "ROL") {
      let v = value.replace(/\D/g, "");
      if (v !== "" && Number(v) > 1000) v = "1000";
      setInputs((p) => ({ ...p, ROL: v }));
      return;
    }

    if (name === "quantity") {
      let v = value.replace(/\D/g, "");
      if (v !== "" && Number(v) > 10000) v = "10000";
      setInputs((p) => ({ ...p, quantity: v }));
      return;
    }

    setInputs((p) => ({ ...p, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setErr("");

    const itemNameError = validateItemName(inputs.item_name);
    const unitCostError = validateUnitCost(inputs.unit_cost);
    const newErrors = { item_name: itemNameError, unit_cost: unitCostError };
    setFieldErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) return;

    try {
      setSaving(true);
      await axios.put(`http://localhost:5000/api/purchasedItems/${item._id}`, {
        item_name: String(inputs.item_name),
        category: String(inputs.category),
        item_unit: String(inputs.item_unit),
        unit_cost: parseMoney(inputs.unit_cost),
        ROL: Number(inputs.ROL || 0),
        quantity: Number(inputs.quantity || 0),
        expire_date: inputs.expire_date || null,
        supplier: String(inputs.supplier),
      });
      onUpdated?.();
      onClose?.();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to update item.");
    } finally {
      setSaving(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <Modal open={open} onClose={onClose} title={`Update ${inputs.item_id} (ID locked)`}>
      <form onSubmit={submit} className="space-y-5">
        {/* Item ID (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Item ID</label>
          <input
            value={inputs.item_id}
            readOnly
            className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-600"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Item Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Item Name</label>
            <input
              type="text"
              name="item_name"
              value={inputs.item_name}
              onChange={handleChange}
              required
              onBeforeInput={(e) => { if (e.data && /[^A-Za-z\s\-_]/.test(e.data)) e.preventDefault(); }}
              onPaste={(e) => {
                const pasted = (e.clipboardData || window.clipboardData).getData("text");
                if (/[^A-Za-z\s\-_]/.test(pasted)) {
                  e.preventDefault();
                  const t = e.target, start = t.selectionStart, end = t.selectionEnd;
                  const clean = sanitizeItemName(pasted);
                  const newVal = inputs.item_name.slice(0, start) + clean + inputs.item_name.slice(end);
                  setInputs((p) => ({ ...p, item_name: newVal }));
                }
              }}
              className={`w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 ${
                submitted && fieldErrors.item_name
                  ? "border-red-400 focus:ring-red-500"
                  : "border-gray-200 focus:ring-[color:#2a5540]"
              }`}
            />
            {submitted && fieldErrors.item_name && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.item_name}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
            <select
              name="category"
              value={inputs.category}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[color:#2a5540]"
            >
              <option value="">-- Select Category --</option>
              <option value="Fertilizer">Fertilizer</option>
              <option value="Packaging">Packaging</option>
              <option value="Tools">Tools</option>
              <option value="Chemicals">Chemicals</option>
              <option value="Machinery">Machinery</option>
            </select>
          </div>

          {/* Unit (UOM) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Unit (UOM)</label>
            <select
              name="item_unit"
              value={inputs.item_unit}
              onChange={handleChange}
              required
              disabled={!inputs.category}
              className={`w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 ${
                inputs.category
                  ? "border-gray-200 bg-white focus:ring-[color:#2a5540]"
                  : "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              {!inputs.category ? (
                <option value="">-- Select category first --</option>
              ) : (
                <>
                  <option value="">-- Select UOM --</option>
                  {CATEGORY_UOMS[inputs.category]?.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </>
              )}
            </select>
          </div>

          {/* Unit Cost */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Unit Cost</label>
            <input
              type="text"
              name="unit_cost"
              value={inputs.unit_cost}
              inputMode="decimal"
              placeholder="e.g. 1,000.00"
              onChange={handleChange}
              onFocus={(e) => {
                const raw = String(e.target.value || "").replace(/,/g, "");
                setInputs((p) => ({ ...p, unit_cost: raw }));
              }}
              onBlur={(e) => {
                let num = parseMoney(e.target.value);
                if (!Number.isFinite(num)) { setFieldErrors((p) => ({ ...p, unit_cost: "Unit cost is required." })); return; }
                if (num < MONEY_LIMITS.min) num = MONEY_LIMITS.min;
                if (num > MONEY_LIMITS.max) {
                  setFieldErrors((p) => ({ ...p, unit_cost: `Unit cost must be at most ${formatMoney(MONEY_LIMITS.max)}.` }));
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

          {/* ROL */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Re-order Level (ROL)</label>
            <input
              type="text"
              name="ROL"
              value={inputs.ROL}
              onChange={handleChange}
              required
              inputMode="numeric"
              pattern="\d*"
              placeholder="max 1000"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-[color:#2a5540]"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="text"
              name="quantity"
              value={inputs.quantity}
              onChange={handleChange}
              required
              inputMode="numeric"
              pattern="\d*"
              placeholder="max 10000"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-[color:#2a5540]"
            />
          </div>

          {/* Expire Date */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Expire Date (optional)</label>
            <input
              type="date"
              name="expire_date"
              value={inputs.expire_date}
              onChange={handleChange}
              min={today}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-[color:#2a5540]"
            />
          </div>

          {/* Supplier */}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Supplier</label>
            <select
              name="supplier"
              value={inputs.supplier}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[color:#2a5540]"
            >
              <option value="">-- Select Supplier --</option>
              <option value="Green Agro Ltd">Green Agro Ltd</option>
              <option value="Ceylon Fertilizers">Ceylon Fertilizers</option>
              <option value="Tropical Packaging">Tropical Packaging</option>
              <option value="Agro Tools & Machinery">Agro Tools & Machinery</option>
              <option value="Island Chemicals">Island Chemicals</option>
            </select>
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
