import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

/* --- helpers & constants (match AddCocoProduct) --- */
const MONEY_MIN = 0.01;
const MONEY_MAX = 10000;
const QTY_MAX = 1_000_000;

const CATEGORIES = [
  "Fresh",
  "Milk & Cream",
  "Oil",
  "Desiccated",
  "Flour & Sugar",
  "Snacks & Drinks",
];
const UPDATED_BY_OPTIONS = ["inv-mgr-001", "inv-mgr-002", "inv-mgr-003"];

function toTodayLocalISODate() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}
const formatInt = (n) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
const cleanQty = (s) => {
  const v = String(s || "").replace(/[^\d]/g, "");
  if (!v) return "";
  const n = Math.min(QTY_MAX, Number(v));
  return String(n);
};
const formatMoney = (n) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
const cleanMoneyInput = (s) => {
  let v = String(s || "").replace(/,/g, "");
  v = v.replace(/[^\d.]/g, "");
  const firstDot = v.indexOf(".");
  if (firstDot !== -1)
    v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, "");
  if (v.startsWith(".")) v = "0" + v;
  if (/^0\d/.test(v)) v = v.replace(/^0+(?=\d)/, "");
  if (v.includes(".")) {
    const [i, d] = v.split(".");
    v = `${i}.${d.slice(0, 2)}`;
  }
  const n = Number(v);
  if (!Number.isNaN(n) && n > MONEY_MAX) v = String(MONEY_MAX);
  return v;
};

export default function UpdateCocoProduct() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [inputs, setInputs] = useState({
    pro_id: "",
    pro_name: "",
    pro_category: "",
    pro_uom: "",
    std_cost: "",
    qty_on_hand: "",
    qty_reserved: "",
    expire_date: "",
    updated_at: "",
    updated_by: "",
  });

  const [qtyError, setQtyError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Name field guards (match AddCocoProduct)
  const isAllowedNameChar = (ch) => /^[A-Za-z ]$/.test(ch);
  const handleNameKeyDown = (e) => {
    const k = e.key;
    if (
      k === "Backspace" ||
      k === "Delete" ||
      k === "Tab" ||
      k === "ArrowLeft" ||
      k === "ArrowRight" ||
      k === "Home" ||
      k === "End" ||
      e.ctrlKey ||
      e.metaKey
    )
      return;
    if (k.length === 1 && !isAllowedNameChar(k)) e.preventDefault();
  };
  const handleNameBeforeInput = (e) => {
    if (e.data && !/^[A-Za-z ]+$/.test(e.data)) e.preventDefault();
  };
  const handleNamePaste = (e) => {
    const text = (e.clipboardData || window.clipboardData).getData("text") || "";
    if (!/^[A-Za-z ]+$/.test(text)) {
      e.preventDefault();
      const cleaned = text.replace(/[^A-Za-z ]+/g, "");
      const target = e.target;
      const start = target.selectionStart ?? target.value.length;
      const end = target.selectionEnd ?? target.value.length;
      const next = target.value.slice(0, start) + cleaned + target.value.slice(end);
      setInputs((prev) => ({ ...prev, pro_name: next }));
    }
  };
  const handleNameDrop = (e) => e.preventDefault();

  // Qty on Hand handlers (commas in UI, cap ≤ 1,000,000)
  const blockQtyBadKeys = (e) => {
    if (["e", "E", "-", "+"].includes(e.key)) e.preventDefault();
  };
  const handleQtyOnHandChange = (e) => {
    setInputs((prev) => ({ ...prev, qty_on_hand: cleanQty(e.target.value) }));
  };
  const handleQtyOnHandFocus = () => {
    setInputs((prev) => ({
      ...prev,
      qty_on_hand: String(prev.qty_on_hand || "").replace(/,/g, ""),
    }));
  };
  const handleQtyOnHandBlur = () => {
    const raw = String(inputs.qty_on_hand || "").replace(/,/g, "");
    if (!raw) return;
    const n = Math.min(QTY_MAX, Number(raw.replace(/[^\d]/g, "") || 0));
    setInputs((prev) => ({ ...prev, qty_on_hand: formatInt(n) }));
  };

  // Money handlers for std_cost (cap ≤ 10,000; show commas + 2dp on blur)
  const handleStdCostChange = (e) => {
    const cleaned = cleanMoneyInput(e.target.value);
    setInputs((prev) => ({ ...prev, std_cost: cleaned }));
  };
  const handleStdCostFocus = () => {
    setInputs((prev) => ({
      ...prev,
      std_cost: String(prev.std_cost || "").replace(/,/g, ""),
    }));
  };
  const handleStdCostBlur = () => {
    const raw = String(inputs.std_cost || "").replace(/,/g, "");
    if (raw === "") return;
    let n = Number(raw);
    if (Number.isNaN(n)) return;
    if (n < MONEY_MIN) n = MONEY_MIN;
    if (n > MONEY_MAX) n = MONEY_MAX;
    setInputs((prev) => ({ ...prev, std_cost: formatMoney(n) }));
  };

  // Derived error: reserved ≤ on-hand (parse on-hand stripping commas)
  useEffect(() => {
    const onHand = Number(String(inputs.qty_on_hand).replace(/,/g, ""));
    const reserved = Number(inputs.qty_reserved);
    const typed =
      inputs.qty_reserved !== "" &&
      !Number.isNaN(onHand) &&
      !Number.isNaN(reserved);
    if (typed && reserved > onHand) {
      setQtyError("Qty Reserved must be ≤ Qty on Hand.");
    } else {
      setQtyError("");
    }
  }, [inputs.qty_on_hand, inputs.qty_reserved]);

  // Fetch product to edit
  useEffect(() => {
    const fetchHandler = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`http://localhost:5000/api/cocoProducts/${id}`);
        const item = data?.cocoProducts;
        if (!item) throw new Error("Not found");

        const onHandNum = Number(item.qty_on_hand ?? 0);
        const stdCostNum = Number(item.std_cost ?? 0);

        setInputs({
          pro_id: item.pro_id ?? "",
          pro_name: item.pro_name ?? "",
          pro_category: item.pro_category ?? "",
          pro_uom: item.pro_uom && item.pro_uom !== "undefined" ? item.pro_uom : "",
          std_cost: Number.isFinite(stdCostNum) ? formatMoney(Math.min(MONEY_MAX, Math.max(MONEY_MIN, stdCostNum))) : "",
          qty_on_hand: Number.isFinite(onHandNum) ? formatInt(Math.min(QTY_MAX, Math.max(0, onHandNum))) : "",
          qty_reserved: item.qty_reserved ?? "",
          expire_date: item.expire_date ? toTodayLocalISODate(new Date(item.expire_date)) : "",
          updated_at: item.updated_at || item.updatedAt ? toTodayLocalISODate(new Date(item.updated_at || item.updatedAt)) : toTodayLocalISODate(),
          updated_by: item.updated_by ?? "",
        });
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load product.");
      } finally {
        setLoading(false);
      }
    };
    fetchHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Generic change handler (match AddCocoProduct)
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "pro_name") {
      const cleaned = value.replace(/[^A-Za-z ]+/g, "");
      setInputs((prev) => ({ ...prev, pro_name: cleaned }));
      return;
    }

    if (name === "qty_reserved") {
      const n = Number(value);
      const onHand = Number(String(inputs.qty_on_hand).replace(/,/g, "")) || 0;
      if (!Number.isNaN(n) && n > onHand) {
        setInputs((prev) => ({ ...prev, qty_reserved: String(onHand) }));
        return;
      }
    }

    if (name === "expire_date") {
      const today = toTodayLocalISODate();
      setInputs((prev) => ({
        ...prev,
        expire_date: value && value < today ? today : value,
      }));
      return;
    }

    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const sendRequest = async () => {
    const body = {
      pro_name: inputs.pro_name.trim(),
      pro_category: inputs.pro_category.trim(),
      pro_uom: inputs.pro_uom,
      std_cost: Number(String(inputs.std_cost).replace(/,/g, "")),
      qty_on_hand: Number(String(inputs.qty_on_hand).replace(/,/g, "")),
      qty_reserved: Number(inputs.qty_reserved),
      expire_date: inputs.expire_date || null,
      updated_by: inputs.updated_by.trim(),
    };
    const res = await axios.put(`http://localhost:5000/api/cocoProducts/${id}`, body);
    return res.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    if (qtyError) return;

    try {
      setSaving(true);
      await sendRequest();
      setSuccess("Product updated successfully.");
      setTimeout(() => navigate("/inventory/cocoProductDetails"), 600);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  const disableSubmit =
    saving ||
    !!qtyError ||
    !inputs.pro_name ||
    !inputs.pro_category ||
    !inputs.pro_uom ||
    !inputs.std_cost ||
    inputs.qty_on_hand === "" ||
    inputs.qty_reserved === "" ||
    !inputs.expire_date ||
    !inputs.updated_by;

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="flex items-center gap-3 text-gray-600">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
          <span>Loading product…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Update Coco Product</h1>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-50 active:scale-[0.99]"
        >
          ← Back
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Product ID (read-only) */}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Product ID</label>
            <input
              type="text"
              name="pro_id"
              value={inputs.pro_id}
              readOnly
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-600 outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          {/* Product Name (letters + spaces only) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Product Name</label>
            <input
              type="text"
              name="pro_name"
              value={inputs.pro_name}
              onChange={handleChange}
              onKeyDown={handleNameKeyDown}
              onBeforeInput={handleNameBeforeInput}
              onPaste={handleNamePaste}
              onDrop={handleNameDrop}
              inputMode="text"
              autoComplete="off"
              pattern="[A-Za-z ]*"
              required
              title="Letters and spaces only"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category (dropdown) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
            <select
              name="pro_category"
              value={inputs.pro_category}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" disabled>Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
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
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select unit</option>
              <option value="Pieces (pcs)">Pieces (pcs)</option>
              <option value="Bunches (bch)">Bunches (bch)</option>
              <option value="Bags (bag)">Bags (bag)</option>
              <option value="Liters (L)">Liters (L)</option>
              <option value="Milliliters (mL)">Milliliters (mL)</option>
              <option value="Kilograms (kg)">Kilograms (kg)</option>
              <option value="Metric Tons (t / MT)">Metric Tons (t / MT)</option>
            </select>
          </div>

          {/* Standard Cost (money formatting) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Standard Cost</label>
            <input
              type="text"
              name="std_cost"
              value={inputs.std_cost}
              onChange={handleStdCostChange}
              onFocus={handleStdCostFocus}
              onBlur={handleStdCostBlur}
              inputMode="decimal"
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-500">Max 10,000.00 • formats as 1,000.00 on blur.</p>
          </div>

          {/* Qty on Hand (formatted integer with commas) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Qty on Hand</label>
            <input
              type="text"
              name="qty_on_hand"
              value={inputs.qty_on_hand}
              onChange={handleQtyOnHandChange}
              onFocus={handleQtyOnHandFocus}
              onBlur={handleQtyOnHandBlur}
              onKeyDown={blockQtyBadKeys}
              inputMode="numeric"
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Qty Reserved (must be ≤ on-hand) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Qty Reserved</label>
            <input
              type="number"
              name="qty_reserved"
              value={inputs.qty_reserved}
              onChange={handleChange}
              min="0"
              required
              className={`w-full rounded-xl border px-3 py-2 outline-none focus:border-transparent focus:ring-2 ${
                qtyError ? "border-red-300 focus:ring-red-500" : "border-gray-200 focus:ring-indigo-500"
              }`}
            />
            {qtyError && <p className="mt-1 text-sm text-red-600">{qtyError}</p>}
          </div>

          {/* Expire Date (no past dates) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Expire Date</label>
            <input
              type="date"
              name="expire_date"
              value={inputs.expire_date || ""}
              min={toTodayLocalISODate()}
              required
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-500">Past dates are blocked.</p>
          </div>

          {/* Updated At (read-only) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Updated At</label>
            <input
              type="date"
              name="updated_at"
              value={inputs.updated_at || toTodayLocalISODate()}
              readOnly
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-600 outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          {/* Updated By (dropdown) */}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Updated By</label>
            <select
              name="updated_by"
              value={inputs.updated_by}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" disabled>Select manager</option>
              {UPDATED_BY_OPTIONS.map((id) => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={disableSubmit}
            className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-white transition active:scale-[0.99] ${
              disableSubmit ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                Saving…
              </span>
            ) : (
              "Submit"
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate("/inventory/cocoProductDetails")}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
