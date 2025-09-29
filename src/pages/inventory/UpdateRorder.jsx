// src/pages/rorders/UpdateRorder.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

/* -------- money helpers ---------- */
const formatMoney = (n) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

const parseMoney = (s) => {
  const n = Number(String(s || "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

/* -------- validations ---------- */
const validateUnitCost = (val) => {
  if (!val && val !== 0) return "Unit cost is required.";
  const num = parseMoney(val);
  if (!Number.isFinite(num)) return "Unit cost must be a number.";
  if (num <= 0) return "Unit cost must be positive.";
  return "";
};

const validateQty = (val) => {
  if (val === "" || val === null || val === undefined) return "Quantity is required.";
  const num = Number(val);
  if (!Number.isInteger(num) || num <= 0) return "Quantity must be a positive whole number.";
  return "";
};

export default function UpdateRorder() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [inputs, setInputs] = useState({
    order_id: "",
    item_id: "",
    unit_cost: "",
    qty: "",
    tot_value: "",
    requested_by: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  /* -------- fetch existing reorder ---------- */
  useEffect(() => {
    const fetchRorder = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`http://localhost:5000/api/rorders/${id}`);
        const r = data?.rorder;
        if (!r) throw new Error("Not found");

        const unit = Number(r.unit_cost) || 0;
        const qty = Number(r.qty) || 0;
        const total = unit * qty;

        setInputs({
          order_id: r.order_id ?? "",
          item_id: r.item_id ?? "",
          unit_cost: unit ? formatMoney(unit) : "",
          qty: qty ? String(qty) : "",
          tot_value: total ? formatMoney(total) : "",
          requested_by: r.requested_by ?? "",
        });
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load reorder.");
      } finally {
        setLoading(false);
      }
    };
    fetchRorder();
  }, [id]);

  /* -------- change handlers ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // auto compute total when qty or unit_cost changes
    if (name === "qty" || name === "unit_cost") {
      const next = { ...inputs, [name]: value };
      const qty = Number(next.qty) || 0;
      const cost = parseMoney(next.unit_cost) || 0;
      const total = qty * cost;
      next.tot_value = total ? formatMoney(total) : "";
      setInputs(next);
      return;
    }

    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  /* -------- save ---------- */
  const sendRequest = async () => {
    const body = {
      // order_id is immutable on backend; do not send it
      item_id: String(inputs.item_id).trim(),
      unit_cost: parseMoney(inputs.unit_cost),
      qty: Number(inputs.qty),
      tot_value: parseMoney(inputs.tot_value),
      requested_by: String(inputs.requested_by).trim(),
      // no status here (by your request)
    };
    const res = await axios.put(`http://localhost:5000/api/rorders/${id}`, body);
    return res.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitted(true);

    const unitCostError = validateUnitCost(inputs.unit_cost);
    const qtyError = validateQty(inputs.qty);

    const newErrors = {
      unit_cost: unitCostError,
      qty: qtyError,
    };
    setFieldErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      setError("Please fix the highlighted fields and try again.");
      return;
    }

    try {
      setSaving(true);
      await sendRequest();
      setSuccess("Reorder updated successfully.");
      setTimeout(() => navigate("/rorders"), 600);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update reorder.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="flex items-center gap-3 text-gray-600">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
          <span>Loading reorder…</span>
        </div>
      </div>
    );
  }

  const disableSubmit = saving;

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#f7f9f9" }}>
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: "#2a5540" }}>
              Update Reorder 🧾
            </h1>
            <p className="mt-2" style={{ color: "#a4ac86" }}>
              Edit supplier reorder details
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
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              borderColor: "#ef4444",
              color: "#ef4444",
            }}
          >
            {error}
          </div>
        )}
        {success && (
          <div
            className="mb-6 p-4 rounded-xl border text-sm"
            style={{
              backgroundColor: "rgba(42, 85, 64, 0.1)",
              borderColor: "#2a5540",
              color: "#2a5540",
            }}
          >
            {success}
          </div>
        )}

        <div
          className="rounded-2xl shadow-sm border p-8"
          style={{ backgroundColor: "#fcfaf6", borderColor: "#e7e9e9" }}
        >
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order ID (read-only) */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#2D3748" }}>
                  Order ID *
                </label>
                <input
                  type="text"
                  name="order_id"
                  value={inputs.order_id}
                  readOnly
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none"
                  style={{
                    borderColor: "#e7e9e9",
                    backgroundColor: "#e7e9e9",
                    color: "#4a5568",
                    cursor: "not-allowed",
                  }}
                />
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
                  onFocus={(e) => {
                    e.target.style.borderColor = "#2a5540";
                    e.target.style.boxShadow = "0 0 0 2px rgba(42, 85, 64, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e7e9e9";
                    e.target.style.boxShadow = "none";
                  }}
                />
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
                    const borderColor = submitted && fieldErrors.unit_cost ? "#ef4444" : "#2a5540";
                    e.target.style.borderColor = borderColor;
                    e.target.style.boxShadow = `0 0 0 2px ${
                      submitted && fieldErrors.unit_cost
                        ? "rgba(239, 68, 68, 0.1)"
                        : "rgba(42, 85, 64, 0.1)"
                    }`;
                  }}
                  onBlur={(e) => {
                    const msg = validateUnitCost(e.target.value);
                    if (msg) {
                      setFieldErrors((p) => ({ ...p, unit_cost: msg }));
                      e.target.style.borderColor = "#ef4444";
                      e.target.style.boxShadow = "none";
                      return;
                    }
                    const num = parseMoney(e.target.value);
                    setInputs((prev) => ({ ...prev, unit_cost: formatMoney(num) }));
                    setFieldErrors((p) => ({ ...p, unit_cost: "" }));
                    e.target.style.borderColor = "#e7e9e9";
                    e.target.style.boxShadow = "none";
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
                  onFocus={(e) => {
                    const borderColor = submitted && fieldErrors.qty ? "#ef4444" : "#2a5540";
                    e.target.style.borderColor = borderColor;
                    e.target.style.boxShadow = `0 0 0 2px ${
                      submitted && fieldErrors.qty
                        ? "rgba(239, 68, 68, 0.1)"
                        : "rgba(42, 85, 64, 0.1)"
                    }`;
                  }}
                  onBlur={(e) => {
                    const msg = validateQty(e.target.value);
                    setFieldErrors((p) => ({ ...p, qty: msg }));
                    e.target.style.borderColor = "#e7e9e9";
                    e.target.style.boxShadow = "none";
                  }}
                />
                {submitted && fieldErrors.qty && (
                  <p className="mt-2 text-sm" style={{ color: "#ef4444" }}>
                    {fieldErrors.qty}
                  </p>
                )}
              </div>

              {/* Total Value (auto) */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#2D3748" }}>
                  Total Value (LKR)
                </label>
                <input
                  type="text"
                  name="tot_value"
                  value={inputs.tot_value}
                  readOnly
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none"
                  style={{ borderColor: "#e7e9e9", backgroundColor: "#f5f3f1" }}
                />
              </div>

              {/* Requested By */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#2D3748" }}>
                  Requested By *
                </label>
                <input
                  type="text"
                  name="requested_by"
                  onChange={handleChange}
                  value={inputs.requested_by}
                  placeholder="Manager name or ID"
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
                  style={{ borderColor: "#e7e9e9", backgroundColor: "#f5f3f1" }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#2a5540";
                    e.target.style.boxShadow = "0 0 0 2px rgba(42, 85, 64, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e7e9e9";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate("/rorders")}
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
                {saving ? "Updating..." : "Update Reorder"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
