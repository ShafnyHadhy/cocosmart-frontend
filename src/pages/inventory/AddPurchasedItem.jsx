import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

const validateUnitCost = (val) => {
  if (val === "" || val === null || val === undefined)
    return "Unit cost is required.";
  const num = parseMoney(val);
  if (!Number.isFinite(num)) return "Unit cost must be a number.";
  if (num <= 0) return "Unit cost must be positive.";
  if (num < MONEY_LIMITS.min)
    return `Unit cost must be at least ${formatMoney(MONEY_LIMITS.min)}.`;
  if (num > MONEY_LIMITS.max)
    return `Unit cost must be at most ${formatMoney(MONEY_LIMITS.max)}.`;
  const s = String(val).replace(/,/g, "");
  if (/\.\d{3,}$/.test(s)) return "Unit cost can have at most 2 decimal places.";
  return "";
};

export default function AddPurchasedItem() {
  const navigate = useNavigate();

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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const sanitizeItemName = (val) => val.replace(/[^A-Za-z\s\-_]/g, "");

  const validateItemName = (val) => {
    if (!val) return "Item name is required.";
    const ok = /^[A-Za-z\s\-_]+$/.test(val);
    return ok ? "" : "Item name can only contain letters, spaces, dash (-), and underscore (_).";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "item_name") {
      const clean = sanitizeItemName(value);
      setInputs((prev) => ({ ...prev, item_name: clean }));
      return;
    }

    if (name === "category") {
      setInputs((prev) => ({ ...prev, category: value, item_unit: "" }));
      return;
    }

    if (name === "unit_cost") {
      const cleaned = cleanMoneyInput(value);
      if (cleaned === "") {
        setInputs((prev) => ({ ...prev, unit_cost: "" }));
        setFieldErrors((p) => ({ ...p, unit_cost: "" }));
        return;
      }
      const num = parseMoney(cleaned);
      if (Number.isFinite(num) && num > MONEY_LIMITS.max) {
        setFieldErrors((p) => ({
          ...p,
          unit_cost: `Unit cost must be at most ${formatMoney(MONEY_LIMITS.max)}.`,
        }));
        return;
      }
      setFieldErrors((p) => ({ ...p, unit_cost: "" }));
      setInputs((prev) => ({ ...prev, unit_cost: cleaned }));
      return;
    }

    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const sendRequest = async () => {
    const body = {
      item_id: String(inputs.item_id),
      item_name: String(inputs.item_name),
      category: String(inputs.category),
      item_unit: String(inputs.item_unit),
      unit_cost: parseMoney(inputs.unit_cost),
      ROL: Number(inputs.ROL),
      quantity: Number(inputs.quantity),
      supplier: String(inputs.supplier),
      expire_date: inputs.expire_date || null,
    };
    const res = await axios.post("http://localhost:5000/api/purchasedItems", body);
    return res.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitted(true);

    const itemNameError = validateItemName(inputs.item_name);
    const unitCostError = validateUnitCost(inputs.unit_cost);
    const newErrors = { item_name: itemNameError, unit_cost: unitCostError };
    setFieldErrors(newErrors);

    if (Object.values(newErrors).some((msg) => msg)) {
      setError("Please fix the highlighted fields and try again.");
      return;
    }

    try {
      setSaving(true);
      await sendRequest();
      setSuccess("Purchased item added successfully.");
      setTimeout(() => navigate("/inventory/purchasedItemDetails"), 600);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add purchased item.");
    } finally {
      setSaving(false);
    }
  };

  const disableSubmit = saving;

  return (
    <div 
      className="min-h-screen p-6" 
      style={{ backgroundColor: '#f7f9f9' }}
    >
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: '#2a5540' }}>
              Add Purchased Item 📦
            </h1>
            <p className="mt-2" style={{ color: '#a4ac86' }}>
              Add a new item to your inventory
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{ 
              color: '#a4ac86',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#e7e9e9';
              e.target.style.color = '#2D3748';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#a4ac86';
            }}
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto">
        {/* Alerts */}
        {error && (
          <div 
            className="mb-6 p-4 rounded-xl border text-sm"
            style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderColor: '#ef4444',
              color: '#ef4444'
            }}
          >
            {error}
          </div>
        )}
        {success && (
          <div 
            className="mb-6 p-4 rounded-xl border text-sm"
            style={{ 
              backgroundColor: 'rgba(42, 85, 64, 0.1)',
              borderColor: '#2a5540',
              color: '#2a5540'
            }}
          >
            {success}
          </div>
        )}

        {/* Form Card */}
        <div 
          className="rounded-2xl shadow-sm border p-8"
          style={{ 
            backgroundColor: '#fcfaf6',
            borderColor: '#e7e9e9'
          }}
        >
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Item ID */}
              <div className="md:col-span-2">
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: '#2D3748' }}
                >
                  Item ID *
                </label>
                <input
                  type="text"
                  name="item_id"
                  onChange={handleChange}
                  value={inputs.item_id}
                  placeholder="Enter unique item identifier (e.g., ITM001)"
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
                  style={{ 
                    borderColor: '#e7e9e9',
                    backgroundColor: '#f5f3f1'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2a5540';
                    e.target.style.boxShadow = '0 0 0 2px rgba(42, 85, 64, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e7e9e9';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Item Name */}
              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: '#2D3748' }}
                >
                  Item Name *
                </label>
                <input
                  type="text"
                  name="item_name"
                  onChange={handleChange}
                  value={inputs.item_name}
                  placeholder="Enter descriptive item name"
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
                  style={{ 
                    borderColor: submitted && fieldErrors.item_name ? '#ef4444' : '#e7e9e9',
                    backgroundColor: '#f5f3f1'
                  }}
                  onFocus={(e) => {
                    const borderColor = submitted && fieldErrors.item_name ? '#ef4444' : '#2a5540';
                    e.target.style.borderColor = borderColor;
                    e.target.style.boxShadow = `0 0 0 2px ${submitted && fieldErrors.item_name ? 'rgba(239, 68, 68, 0.1)' : 'rgba(42, 85, 64, 0.1)'}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = submitted && fieldErrors.item_name ? '#ef4444' : '#e7e9e9';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {submitted && fieldErrors.item_name && (
                  <p className="mt-2 text-sm" style={{ color: '#ef4444' }}>
                    {fieldErrors.item_name}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: '#2D3748' }}
                >
                  Category *
                </label>
                <select
                  name="category"
                  onChange={handleChange}
                  value={inputs.category}
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
                  style={{ 
                    borderColor: '#e7e9e9',
                    backgroundColor: '#f5f3f1'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2a5540';
                    e.target.style.boxShadow = '0 0 0 2px rgba(42, 85, 64, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e7e9e9';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">Choose item category</option>
                  <option value="Fertilizer">Fertilizer</option>
                  <option value="Packaging">Packaging</option>
                  <option value="Tools">Tools</option>
                  <option value="Chemicals">Chemicals</option>
                  <option value="Machinery">Machinery</option>
                </select>
              </div>

              {/* Unit */}
              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: '#2D3748' }}
                >
                  Unit of Measurement *
                </label>
                <select
                  name="item_unit"
                  onChange={handleChange}
                  value={inputs.item_unit}
                  required
                  disabled={!inputs.category}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
                  style={{ 
                    borderColor: '#e7e9e9',
                    backgroundColor: inputs.category ? '#f5f3f1' : '#e7e9e9',
                    color: inputs.category ? '#2D3748' : '#a4ac86',
                    cursor: inputs.category ? 'pointer' : 'not-allowed'
                  }}
                  onFocus={(e) => {
                    if (inputs.category) {
                      e.target.style.borderColor = '#2a5540';
                      e.target.style.boxShadow = '0 0 0 2px rgba(42, 85, 64, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e7e9e9';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {!inputs.category ? (
                    <option value="">Select category first</option>
                  ) : (
                    <>
                      <option value="">Choose unit of measurement</option>
                      {CATEGORY_UOMS[inputs.category]?.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Unit Cost */}
              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: '#2D3748' }}
                >
                  Unit Cost (LKR) *
                </label>
                <input
                  type="text"
                  name="unit_cost"
                  value={inputs.unit_cost}
                  placeholder="Enter cost per unit (e.g., 1,250.00)"
                  onChange={handleChange}
                  onFocus={(e) => {
                    const raw = String(e.target.value || "").replace(/,/g, "");
                    setInputs((p) => ({ ...p, unit_cost: raw }));
                    const borderColor = submitted && fieldErrors.unit_cost ? '#ef4444' : '#2a5540';
                    e.target.style.borderColor = borderColor;
                    e.target.style.boxShadow = `0 0 0 2px ${submitted && fieldErrors.unit_cost ? 'rgba(239, 68, 68, 0.1)' : 'rgba(42, 85, 64, 0.1)'}`;
                  }}
                  onBlur={(e) => {
                    let num = parseMoney(e.target.value);
                    if (!Number.isFinite(num)) {
                      setFieldErrors((p) => ({ ...p, unit_cost: "Unit cost is required." }));
                      e.target.style.borderColor = '#ef4444';
                      e.target.style.boxShadow = 'none';
                      return;
                    }
                    if (num < MONEY_LIMITS.min) num = MONEY_LIMITS.min;
                    if (num > MONEY_LIMITS.max) {
                      setFieldErrors((p) => ({
                        ...p,
                        unit_cost: `Unit cost must be at most ${formatMoney(MONEY_LIMITS.max)}.`,
                      }));
                      e.target.style.borderColor = '#ef4444';
                      e.target.style.boxShadow = 'none';
                      return;
                    }
                    setInputs((p) => ({ ...p, unit_cost: formatMoney(num) }));
                    setFieldErrors((p) => ({ ...p, unit_cost: "" }));
                    e.target.style.borderColor = '#e7e9e9';
                    e.target.style.boxShadow = 'none';
                  }}
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
                  style={{ 
                    borderColor: submitted && fieldErrors.unit_cost ? '#ef4444' : '#e7e9e9',
                    backgroundColor: '#f5f3f1'
                  }}
                />
                {submitted && fieldErrors.unit_cost && (
                  <p className="mt-2 text-sm" style={{ color: '#ef4444' }}>
                    {fieldErrors.unit_cost}
                  </p>
                )}
              </div>

              {/* ROL */}
              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: '#2D3748' }}
                >
                  Re-order Level (ROL) *
                </label>
                <input
                  type="text"
                  name="ROL"
                  value={inputs.ROL}
                  onChange={(e) => {
                    let v = e.target.value.replace(/\D/g, "");
                    if (v !== "" && Number(v) > 1000) v = "1000";
                    setInputs((prev) => ({ ...prev, ROL: v }));
                  }}
                  placeholder="Minimum stock level (max 1000)"
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
                  style={{ 
                    borderColor: '#e7e9e9',
                    backgroundColor: '#f5f3f1'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2a5540';
                    e.target.style.boxShadow = '0 0 0 2px rgba(42, 85, 64, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e7e9e9';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Quantity */}
              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: '#2D3748' }}
                >
                  Initial Quantity *
                </label>
                <input
                  type="text"
                  name="quantity"
                  value={inputs.quantity}
                  onChange={(e) => {
                    let v = e.target.value.replace(/\D/g, "");
                    if (v !== "" && Number(v) > 10000) v = "10000";
                    setInputs((prev) => ({ ...prev, quantity: v }));
                  }}
                  placeholder="Starting inventory quantity (max 10,000)"
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
                  style={{ 
                    borderColor: '#e7e9e9',
                    backgroundColor: '#f5f3f1'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2a5540';
                    e.target.style.boxShadow = '0 0 0 2px rgba(42, 85, 64, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e7e9e9';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Expire Date */}
              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: '#2D3748' }}
                >
                  Expiry Date{" "}
                  <span style={{ color: '#a4ac86', fontWeight: 'normal' }}>
                    (optional)
                  </span>
                </label>
                <input
                  type="date"
                  name="expire_date"
                  value={inputs.expire_date}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
                  style={{ 
                    borderColor: '#e7e9e9',
                    backgroundColor: '#f5f3f1'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2a5540';
                    e.target.style.boxShadow = '0 0 0 2px rgba(42, 85, 64, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e7e9e9';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Supplier */}
              <div className="md:col-span-2">
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: '#2D3748' }}
                >
                  Supplier *
                </label>
                <select
                  name="supplier"
                  onChange={handleChange}
                  value={inputs.supplier}
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
                  style={{ 
                    borderColor: '#e7e9e9',
                    backgroundColor: '#f5f3f1'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2a5540';
                    e.target.style.boxShadow = '0 0 0 2px rgba(42, 85, 64, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e7e9e9';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">Choose your supplier</option>
                  <option value="Green Agro Ltd">Green Agro Ltd</option>
                  <option value="Ceylon Fertilizers">Ceylon Fertilizers</option>
                  <option value="Tropical Packaging">Tropical Packaging</option>
                  <option value="Agro Tools & Machinery">Agro Tools & Machinery</option>
                  <option value="Island Chemicals">Island Chemicals</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate("/inventory/purchasedItems")}
                className="px-6 py-3 rounded-xl transition-colors font-medium"
                style={{ 
                  color: '#a4ac86',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#e7e9e9';
                  e.target.style.color = '#2D3748';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#a4ac86';
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={disableSubmit}
                className="px-8 py-3 rounded-xl font-semibold transition-all"
                style={{
                  backgroundColor: disableSubmit ? '#e7e9e9' : '#2a5540',
                  color: disableSubmit ? '#a4ac86' : 'white',
                  cursor: disableSubmit ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!disableSubmit) {
                    e.target.style.backgroundColor = 'rgba(42, 85, 64, 0.9)';
                    e.target.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!disableSubmit) {
                    e.target.style.backgroundColor = '#2a5540';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                {saving ? (
                  <span className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 border-2 rounded-full animate-spin"
                      style={{ 
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        borderTopColor: 'white'
                      }}
                    ></div>
                    <span>Adding...</span>
                  </span>
                ) : (
                  "Add to Inventory"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}