import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const formatMoney = (n) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

const parseMoney = (s) => {
  const n = Number(String(s || "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

// ---- validations ----
const validateStockId = (val) => {
  if (!val || !String(val).trim()) return "Stock ID is required.";
  // Optional: simple format guard; tweak/remove if you like
  if (String(val).length < 3) return "Stock ID is too short.";
  return "";
};

const validateUnitCost = (val) => {
  if (!val) return "Unit cost is required.";
  const num = parseMoney(val);
  if (!Number.isFinite(num)) return "Unit cost must be a number.";
  if (num <= 0) return "Unit cost must be positive.";
  return "";
};

const validateQty = (val) => {
  if (!val) return "Quantity is required.";
  const num = Number(val);
  if (!Number.isInteger(num) || num <= 0) return "Quantity must be a positive whole number.";
  return "";
};

export default function AddStock() {
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({
    stock_id: "",          // ✅ added
    item_id: "",
    category: "",
    type: "",
    reason: "",
    qty: "",
    unit_cost: "",
    tot_value: "",
    date: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
const toYMD = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const todayLocal = new Date();
const maxDate = toYMD(todayLocal);
const minDate = toYMD(new Date(todayLocal.getFullYear(), todayLocal.getMonth(), todayLocal.getDate() - 7));

  // optional: live uniqueness check on blur
  const checkStockIdUnique = async (id) => {
    if (!id) return;
    try {
      const { data } = await axios.get("http://localhost:5000/api/stocks/check/stockid", {
        params: { stock_id: id },
      });
      if (data?.exists) {
        setFieldErrors((p) => ({ ...p, stock_id: "This Stock ID is already in use." }));
      } else {
        setFieldErrors((p) => ({ ...p, stock_id: "" }));
      }
    } catch {
      // ignore network errors here; server-side will still validate
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // auto compute total
    if (name === "qty" || name === "unit_cost") {
      const newInputs = { ...inputs, [name]: value };
      const qty = parseMoney(newInputs.qty) || 0;
      const cost = parseMoney(newInputs.unit_cost) || 0;
      const total = qty * cost;
      newInputs.tot_value = total ? formatMoney(total) : "";
      setInputs(newInputs);
      return;
    }

    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const sendRequest = async () => {
    const body = {
      stock_id: String(inputs.stock_id).trim(), // ✅ include stock_id
      item_id: String(inputs.item_id).trim(),
      category: String(inputs.category),
      type: String(inputs.type).toLowerCase(), // send "in"/"out"
      reason: String(inputs.reason).trim(),
      qty: Number(inputs.qty),
      tot_value: parseMoney(inputs.tot_value),
      date: inputs.date, // "YYYY-MM-DD"
      enter_by: "Manager1",
    };
    const res = await axios.post("http://localhost:5000/api/stocks", body);
    return res.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitted(true);

    const stockIdError = validateStockId(inputs.stock_id);
    const unitCostError = validateUnitCost(inputs.unit_cost);
    const qtyError = validateQty(inputs.qty);

    const newErrors = {
      stock_id: stockIdError,
      unit_cost: unitCostError,
      qty: qtyError,
    };
    setFieldErrors(newErrors);

    if (Object.values(newErrors).some((msg) => msg)) {
      setError("Please fix the highlighted fields and try again.");
      return;
    }

    try {
      setSaving(true);
      await sendRequest();
      setSuccess("Stock record added successfully.");
      setTimeout(() => navigate("/inventory/stockDetails"), 600);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add stock record.");
    } finally {
      setSaving(false);
    }
  };

  const disableSubmit = saving;

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#f7f9f9" }}>
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: "#2a5540" }}>
              Add Stock 📦
            </h1>
            <p className="mt-2" style={{ color: "#a4ac86" }}>
              Record a new stock movement
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{ color: "#a4ac86", backgroundColor: "transparent" }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#e7e9e9";
              e.target.style.color = "#2D3748";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "#a4ac86";
            }}
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto">
        {error && (
          <div
            className="mb-6 p-4 rounded-xl border text-sm"
            style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", borderColor: "#ef4444", color: "#ef4444" }}
          >
            {error}
          </div>
        )}
        {success && (
          <div
            className="mb-6 p-4 rounded-xl border text-sm"
            style={{ backgroundColor: "rgba(42, 85, 64, 0.1)", borderColor: "#2a5540", color: "#2a5540" }}
          >
            {success}
          </div>
        )}

        <div className="rounded-2xl shadow-sm border p-8" style={{ backgroundColor: "#fcfaf6", borderColor: "#e7e9e9" }}>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stock ID ✅ */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#2D3748" }}>
                  Stock ID *
                </label>
                <input
                  type="text"
                  name="stock_id"
                  value={inputs.stock_id}
                  onChange={handleChange}
                  onBlur={(e) => {
                    const msg = validateStockId(e.target.value);
                    setFieldErrors((p) => ({ ...p, stock_id: msg }));
                    if (!msg) checkStockIdUnique(e.target.value.trim());
                  }}
                  placeholder="STK001"
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
                  style={{
                    borderColor: submitted && fieldErrors.stock_id ? "#ef4444" : "#e7e9e9",
                    backgroundColor: "#f5f3f1",
                  }}
                />
                {submitted && fieldErrors.stock_id && (
                  <p className="mt-2 text-sm" style={{ color: "#ef4444" }}>
                    {fieldErrors.stock_id}
                  </p>
                )}
              </div>

              {/* Item ID */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#2D3748" }}>
                  Item ID *
                </label>
                <input
                  type="text"
                  name="item_id"
                  onChange={handleChange}
                  value={inputs.item_id}
                  placeholder="Enter item ID"
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
                  style={{ borderColor: "#e7e9e9", backgroundColor: "#f5f3f1" }}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#2D3748" }}>
                  Category *
                </label>
                <select
                  name="category"
                  onChange={handleChange}
                  value={inputs.category}
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
                  style={{ borderColor: "#e7e9e9", backgroundColor: "#f5f3f1" }}
                >
                  <option value="">Choose category</option>
                  <option value="Product">Product</option>
                  <option value="Purchased">Purchased</option>
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#2D3748" }}>
                  Type *
                </label>
                <select
                  name="type"
                  onChange={handleChange}
                  value={inputs.type}
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
                  style={{ borderColor: "#e7e9e9", backgroundColor: "#f5f3f1" }}
                >
                  <option value="">Select type</option>
                  <option value="In">In</option>
                  <option value="Out">Out</option>
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#2D3748" }}>
                  Reason *
                </label>
                <input
                  type="text"
                  name="reason"
                  onChange={handleChange}
                  value={inputs.reason}
                  placeholder="e.g., Purchase, Sale, Wastage"
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
                  style={{ borderColor: "#e7e9e9", backgroundColor: "#f5f3f1" }}
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#2D3748" }}>
                  Quantity *
                </label>
                <input
                  type="number"
                  name="qty"
                  min="0"
                  onChange={handleChange}
                  value={inputs.qty}
                  placeholder="Enter quantity"
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
                  style={{
                    borderColor: submitted && fieldErrors.qty ? "#ef4444" : "#e7e9e9",
                    backgroundColor: "#f5f3f1",
                  }}
                />
                {submitted && fieldErrors.qty && (
                  <p className="mt-2 text-sm" style={{ color: "#ef4444" }}>
                    {fieldErrors.qty}
                  </p>
                )}
              </div>

              {/* Unit Cost */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#2D3748" }}>
                  Unit Cost (LKR) *
                </label>
                <input
                  type="text"
                  name="unit_cost"
                  value={inputs.unit_cost}
                  placeholder="Enter unit cost"
                  onChange={handleChange}
                  onFocus={(e) => {
                    const raw = String(e.target.value || "").replace(/,/g, "");
                    setInputs((prev) => ({ ...prev, unit_cost: raw }));
                  }}
                  onBlur={(e) => {
                    let num = parseMoney(e.target.value);
                    const msg = validateUnitCost(e.target.value);
                    if (msg) {
                      setFieldErrors((p) => ({ ...p, unit_cost: msg }));
                      return;
                    }
                    setInputs((prev) => ({ ...prev, unit_cost: formatMoney(num) }));
                    setFieldErrors((p) => ({ ...p, unit_cost: "" }));
                  }}
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
                  style={{
                    borderColor: submitted && fieldErrors.unit_cost ? "#ef4444" : "#e7e9e9",
                    backgroundColor: "#f5f3f1",
                  }}
                />
                {submitted && fieldErrors.unit_cost && (
                  <p className="mt-2 text-sm" style={{ color: "#ef4444" }}>
                    {fieldErrors.unit_cost}
                  </p>
                )}
              </div>

              {/* Total Value */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#2D3748" }}>
                  Total Value (LKR) *
                </label>
                <input
                  type="text"
                  name="tot_value"
                  min="0"
                  onChange={handleChange}
                  value={inputs.tot_value}
                  readOnly
                  // placeholder="Enter total value"
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
                  style={{ borderColor: "#e7e9e9", backgroundColor: "#f5f3f1" }}
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#2D3748" }}>
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={inputs.date}
                  onChange={handleChange}
                 min={minDate} 
                 max={maxDate} 
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
                  style={{ borderColor: "#e7e9e9", backgroundColor: "#f5f3f1" }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate("/inventory/stocks")}
                className="px-6 py-3 rounded-xl transition-colors font-medium"
                style={{ color: "#a4ac86", backgroundColor: "transparent" }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#e7e9e9";
                  e.target.style.color = "#2D3748";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "#a4ac86";
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 rounded-xl font-semibold transition-all"
                style={{
                  backgroundColor: saving ? "#e7e9e9" : "#2a5540",
                  color: saving ? "#a4ac86" : "white",
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Adding..." : "Add Stock"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
