// src/pages/inventory/AddRorder.jsx
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

//validate re order id
const validateOrderId = (val) => {
  if (!val || !String(val).trim()) return "Order ID is required.";
  if (String(val).length < 3) return "Order ID is too short.";

  // ✅ Block special characters (allow only A–Z, a–z, 0–9, -, _)
  if (!/^[A-Za-z0-9-_]+$/.test(val)) {
    return "Order ID can only contain letters, numbers, hyphens, and underscores.";
  }

  return "";
};

//validate item id
const validateItemId = (val) => {
  if (!val || !String(val).trim()) return "Item ID is required.";
  if (String(val).length < 3) return "Item ID is too short.";

  // ✅ Allow only letters, numbers, hyphen (-), and underscore (_)
  if (!/^[A-Za-z0-9-_]+$/.test(val)) {
    return "Item ID can only contain letters, numbers, hyphens, and underscores.";
  }

  return "";
};


const validateUnitCost = (val) => {
  if (!val) return "Unit cost is required.";
  const num = parseMoney(val);

  // ✅ Allow only numbers and optional decimal
  if (!/^\d+(\.\d{1,2})?$/.test(String(val).replace(/,/g, ""))) {
    return "Unit cost must be a valid number.";
  }

  if (!Number.isFinite(num)) return "Unit cost must be a number.";
  if (num <= 0) return "Unit cost must be positive.";
  return "";
};


const validateQty = (val) => {
  if (val === "" || val === null || val === undefined) return "Quantity is required.";

  // strip commas/spaces just in case
  const s = String(val).replace(/[\s,]/g, "");

  // ✅ only digits, at least 1
  if (!/^\d+$/.test(s)) return "Quantity must be a whole number.";

  const num = Number(s);
  if (!Number.isFinite(num)) return "Quantity must be a number.";
  if (num <= 0) return "Quantity must be positive.";
  return "";
};


export default function AddRorder() {
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({
    order_id: "",
    item_id: "",
    unit_cost: "",
    qty: "",
    tot_value: "",
    requested_by: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // optional: live uniqueness check on blur
  const checkOrderIdUnique = async (id) => {
    if (!id) return;
    try {
      const { data } = await axios.get("http://localhost:5000/api/rorders/check-id", {
        params: { order_id: id },
      });
      if (data?.exists) {
        setFieldErrors((p) => ({ ...p, order_id: "This Order ID is already in use." }));
      } else {
        setFieldErrors((p) => ({ ...p, order_id: "" }));
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
      order_id: String(inputs.order_id).trim(),
      item_id: String(inputs.item_id).trim(),
      unit_cost: parseMoney(inputs.unit_cost),
      qty: Number(inputs.qty),
      tot_value: parseMoney(inputs.tot_value),
      requested_by: String(inputs.requested_by).trim() || "Manager1",
    };
    const res = await axios.post("http://localhost:5000/api/rorders", body);
    return res.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitted(true);

    const orderIdError = validateOrderId(inputs.order_id);
    const itemIdError = validateItemId(inputs.item_id);
    const unitCostError = validateUnitCost(inputs.unit_cost);
    const qtyError = validateQty(inputs.qty);

    const newErrors = {
      order_id: orderIdError,
      item_id: itemIdError,
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
      setSuccess("Reorder added successfully.");
      setTimeout(() => navigate("/inventory/rorderDetails"), 600);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add reorder.");
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
              Add Reorder 🧾
            </h1>
            <p className="mt-2" style={{ color: "#a4ac86" }}>
              Create a new supplier reorder request
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
              {/* Order ID ✅ */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#2D3748" }}>
                  Order ID *
                </label>
               <input
  type="text"
  name="order_id"
  value={inputs.order_id}
  onChange={(e) => {
    const cleaned = e.target.value.replace(/[^A-Za-z0-9-_]/g, ""); // remove bad chars
    setInputs((p) => ({ ...p, order_id: cleaned }));
  }}
  onBlur={(e) => {
    const msg = validateOrderId(e.target.value);
    setFieldErrors((p) => ({ ...p, order_id: msg }));
    if (!msg) checkOrderIdUnique(e.target.value.trim());
  }}
  placeholder="e.g., ro001"
  required
  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
  style={{
    borderColor: submitted && fieldErrors.order_id ? "#ef4444" : "#e7e9e9",
    backgroundColor: "#f5f3f1",
  }}
/>

                {submitted && fieldErrors.order_id && (
                  <p className="mt-2 text-sm" style={{ color: "#ef4444" }}>
                    {fieldErrors.order_id}
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
  value={inputs.item_id}
  onChange={(e) => {
    // strip out invalid characters as user types
    const cleaned = e.target.value.replace(/[^A-Za-z0-9-_]/g, "");
    setInputs((p) => ({ ...p, item_id: cleaned }));
  }}
  onBlur={(e) => {
    const msg = validateItemId(e.target.value);
    setFieldErrors((p) => ({ ...p, item_id: msg }));
  }}
  placeholder="Enter item ID"
  required
  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
  style={{
    borderColor: submitted && fieldErrors.item_id ? "#ef4444" : "#e7e9e9",
    backgroundColor: "#f5f3f1",
  }}
/>
{submitted && fieldErrors.item_id && (
  <p className="mt-2 text-sm" style={{ color: "#ef4444" }}>
    {fieldErrors.item_id}
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
  placeholder="150.25"
  onChange={(e) => {
    // ✅ allow only digits and decimal point
    const cleaned = e.target.value.replace(/[^0-9.]/g, "");

    // prevent multiple decimals like "12.3.4"
    const parts = cleaned.split(".");
    const safe = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : cleaned;

    setInputs((prev) => ({ ...prev, unit_cost: safe }));
  }}
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

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#2D3748" }}>
                  Quantity *
                </label>
                <input
  type="text"                 // keep as text to control typing
  name="qty"
  value={inputs.qty}
  placeholder="Enter quantity"
  required
  onChange={(e) => {
    // ✅ allow digits only
    const cleaned = e.target.value.replace(/[^0-9]/g, "");
    // keep state
    const newInputs = { ...inputs, qty: cleaned };

    // recompute total with current unit_cost
    const qty = Number(cleaned || 0);
    const cost = parseMoney(newInputs.unit_cost) || 0;
    const total = qty * cost;
    newInputs.tot_value = total ? formatMoney(total) : "";

    setInputs(newInputs);
  }}
  onBlur={(e) => {
    const msg = validateQty(e.target.value);
    setFieldErrors((p) => ({ ...p, qty: msg }));
  }}
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

              {/* Total Value */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#2D3748" }}>
                  Total Value (LKR) *
                </label>
                <input
                  type="text"
                  name="tot_value"
                  onChange={handleChange}
                  value={inputs.tot_value}
                  readOnly
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
                  style={{ borderColor: "#e7e9e9", backgroundColor: "#f5f3f1" }}
                />
              </div>

             {/* Requested By */}
<div>
  <label className="block text-sm font-semibold mb-2" style={{ color: "#2D3748" }}>
    Requested By *
  </label>
  <select
    name="requested_by"
    value={inputs.requested_by}
    onChange={handleChange}
    required
    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
    style={{ borderColor: "#e7e9e9", backgroundColor: "#f5f3f1" }}
  >
    <option value="">-- Select Manager --</option>
    <option value="inv-mgr-001">inv-mgr-001</option>
    <option value="inv-mgr-002">inv-mgr-002</option>
    <option value="inv-mgr-003">inv-mgr-003</option>
  </select>
</div>

            </div>

            {/* Actions */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate("/inventory/rorderDetails")}
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
                disabled={disableSubmit}
                className="px-8 py-3 rounded-xl font-semibold transition-all"
                style={{
                  backgroundColor: saving ? "#e7e9e9" : "#2a5540",
                  color: saving ? "#a4ac86" : "white",
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Adding..." : "Add Reorder"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
