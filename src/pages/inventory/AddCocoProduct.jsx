import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/* --- helpers --- */
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

export default function AddCocoProduct() {
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({
    pro_id: "",
    pro_name: "",
    pro_category: "",
    pro_uom: "",
    std_cost: "",
    qty_on_hand: "",
    qty_reserved: "",
    expire_date: "",
    updated_at: toTodayLocalISODate(),
    updated_by: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Product ID uniqueness (debounced)
  const [proIdError, setProIdError] = useState("");
  const [checkingProId, setCheckingProId] = useState(false);
  const lastChecked = useRef("");

  useEffect(() => {
    const v = inputs.pro_id.trim();
    if (!v) {
      setProIdError("");
      setCheckingProId(false);
      return;
    }
    const t = setTimeout(async () => {
      try {
        setCheckingProId(true);
        lastChecked.current = v;
        const { data } = await axios.get(
          "http://localhost:5000/api/cocoProducts/check-pro-id",
          { params: { pro_id: v } }
        );
        if (lastChecked.current !== v) return; // stale response
        setProIdError(data?.exists ? "This Product ID already exists." : "");
      } catch {
        setProIdError("Could not verify Product ID.");
      } finally {
        if (lastChecked.current === v) setCheckingProId(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [inputs.pro_id]);

  // qty_reserved must be ≤ qty_on_hand
  const qtyError = (() => {
    const onHand = Number(String(inputs.qty_on_hand).replace(/,/g, ""));
    const reserved = Number(inputs.qty_reserved);
    if (
      inputs.qty_on_hand !== "" &&
      inputs.qty_reserved !== "" &&
      !Number.isNaN(onHand) &&
      !Number.isNaN(reserved) &&
      reserved > onHand
    ) {
      return "Qty Reserved must be ≤ Qty on Hand.";
    }
    return "";
  })();

  // generic change handler (+ clamp reserved as you type, block past dates, sanitize name)
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "pro_name") {
      const cleaned = value.replace(/[^A-Za-z ]+/g, "");
      setInputs((prev) => ({ ...prev, pro_name: cleaned }));
      return;
    }

    if (name === "qty_reserved") {
      const n = Number(value);
      const onHand =
        Number(String(inputs.qty_on_hand).replace(/,/g, "")) || 0;
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

  // Qty on Hand (formatted integer with commas)
  const handleQtyOnHandChange = (e) => {
    setInputs((prev) => ({ ...prev, qty_on_hand: cleanQty(e.target.value) }));
  };
  const handleQtyOnHandFocus = (e) => {
    e.target.style.borderColor = "#2a5540";
    e.target.style.boxShadow = "0 0 0 2px rgba(42, 85, 64, 0.1)";
    setInputs((prev) => ({
      ...prev,
      qty_on_hand: String(prev.qty_on_hand || "").replace(/,/g, ""),
    }));
  };
  const handleQtyOnHandBlur = (e) => {
    e.target.style.borderColor = "#e7e9e9";
    e.target.style.boxShadow = "none";
    const raw = String(inputs.qty_on_hand || "").replace(/,/g, "");
    if (!raw) return;
    const n = Math.min(QTY_MAX, Number(raw.replace(/[^\d]/g, "") || 0));
    setInputs((prev) => ({ ...prev, qty_on_hand: formatInt(n) }));
  };
  const blockQtyBadKeys = (e) => {
    if (["e", "E", "-", "+"].includes(e.key)) e.preventDefault();
  };

  // Std cost (money, cap ≤ 10,000; 2dp; commas on blur)
  const handleStdCostChange = (e) => {
    const cleaned = cleanMoneyInput(e.target.value);
    setInputs((prev) => ({ ...prev, std_cost: cleaned }));
  };
  const handleStdCostFocus = (e) => {
    e.target.style.borderColor = "#2a5540";
    e.target.style.boxShadow = "0 0 0 2px rgba(42, 85, 64, 0.1)";
    setInputs((prev) => ({
      ...prev,
      std_cost: String(prev.std_cost || "").replace(/,/g, ""),
    }));
  };
  const handleStdCostBlur = (e) => {
    e.target.style.borderColor = "#e7e9e9";
    e.target.style.boxShadow = "none";
    const raw = String(inputs.std_cost || "").replace(/,/g, "");
    if (raw === "") return;
    let n = Number(raw);
    if (Number.isNaN(n)) return;
    if (n < MONEY_MIN) n = MONEY_MIN;
    if (n > MONEY_MAX) n = MONEY_MAX;
    setInputs((prev) => ({ ...prev, std_cost: formatMoney(n) }));
  };

  // Name hard-block typing to letters + spaces
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

  const stopWheel = (e) => e.currentTarget.blur();

  const sendRequest = async () => {
    const body = {
      pro_id: inputs.pro_id.trim(),
      pro_name: inputs.pro_name.trim(),
      pro_category: inputs.pro_category.trim(),
      pro_uom: inputs.pro_uom,
      std_cost: Number(String(inputs.std_cost).replace(/,/g, "")),
      qty_on_hand: Number(String(inputs.qty_on_hand).replace(/,/g, "")),
      qty_reserved: Number(inputs.qty_reserved),
      expire_date: inputs.expire_date || null,
      updated_at: inputs.updated_at || undefined,
      updated_by: inputs.updated_by.trim(),
    };
    const res = await axios.post("http://localhost:5000/api/cocoProducts", body);
    return res.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (qtyError) return setError(qtyError);
    if (proIdError || checkingProId)
      return setError(proIdError || "Checking Product ID…");

    try {
      setSaving(true);
      await sendRequest();
      setSuccess("Product added successfully.");
      setTimeout(() => navigate("/inventory/cocoProductDetails"), 600);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add product.");
    } finally {
      setSaving(false);
    }
  };

  const disableSubmit =
    saving ||
    !!qtyError ||
    !!proIdError ||
    checkingProId ||
    !inputs.pro_id ||
    !inputs.pro_name ||
    !inputs.pro_category ||
    !inputs.pro_uom ||
    !inputs.std_cost ||
    inputs.qty_on_hand === "" ||
    inputs.qty_reserved === "" ||
    !inputs.expire_date ||
    !inputs.updated_by;

  return (
    <div
      className="min-h-screen p-6"
      style={{ backgroundColor: "#f7f9f9" }}
    >
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-3xl font-bold flex items-center gap-3"
              style={{ color: "#2a5540" }}
            >
              Add Coco Product
            </h1>
            <p className="mt-2" style={{ color: "#a4ac86" }}>
              Add a new product to your inventory
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              color: "#a4ac86",
              backgroundColor: "transparent",
            }}
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

      {/* Alerts */}
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
      </div>

      {/* Form Card */}
      <div className="max-w-4xl mx-auto">
        <div
          className="rounded-2xl shadow-sm border p-8"
          style={{ backgroundColor: "#fcfaf6", borderColor: "#e7e9e9" }}
        >
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product ID */}
              <div className="md:col-span-2">
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "#2D3748" }}
                >
                  Product ID *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    name="pro_id"
                    value={inputs.pro_id}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
                    style={{
                      borderColor: proIdError ? "#ef4444" : "#e7e9e9",
                      backgroundColor: "#f5f3f1",
                    }}
                    onFocus={(e) => {
                      const c = proIdError ? "#ef4444" : "#2a5540";
                      e.target.style.borderColor = c;
                      e.target.style.boxShadow = `0 0 0 2px ${
                        proIdError
                          ? "rgba(239, 68, 68, 0.1)"
                          : "rgba(42, 85, 64, 0.1)"
                      }`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = proIdError
                        ? "#ef4444"
                        : "#e7e9e9";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  {checkingProId && (
                    <span
                      className="w-5 h-5 border-2 rounded-full animate-spin"
                      style={{
                        borderColor: "#e7e9e9",
                        borderTopColor: "#2a5540",
                      }}
                    />
                  )}
                </div>
                {proIdError && (
                  <p className="mt-2 text-sm" style={{ color: "#ef4444" }}>
                    {proIdError}
                  </p>
                )}
              </div>

              {/* Product Name */}
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "#2D3748" }}
                >
                  Product Name *
                </label>
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
                  title="Letters and spaces only"
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
                  style={{ borderColor: "#e7e9e9", backgroundColor: "#f5f3f1" }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#2a5540";
                    e.target.style.boxShadow =
                      "0 0 0 2px rgba(42, 85, 64, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e7e9e9";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Category */}
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "#2D3748" }}
                >
                  Category *
                </label>
                <select
                  name="pro_category"
                  value={inputs.pro_category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
                  style={{ borderColor: "#e7e9e9", backgroundColor: "#f5f3f1" }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#2a5540";
                    e.target.style.boxShadow =
                      "0 0 0 2px rgba(42, 85, 64, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e7e9e9";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option value="" disabled>
                    Select category
                  </option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* UOM */}
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "#2D3748" }}
                >
                  Unit of Measurement *
                </label>
                <select
                  name="pro_uom"
                  value={inputs.pro_uom}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
                  style={{ borderColor: "#e7e9e9", backgroundColor: "#f5f3f1" }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#2a5540";
                    e.target.style.boxShadow =
                      "0 0 0 2px rgba(42, 85, 64, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e7e9e9";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option value="">Select unit</option>
                  <option value="Pieces (pcs)">Pieces (pcs)</option>
                  <option value="Bunches (bch)">Bunches (bch)</option>
                  <option value="Bags (bag)">Bags (bag)</option>
                  <option value="Liters (L)">Liters (L)</option>
                  <option value="Milliliters (mL)">Milliliters (mL)</option>
                  <option value="Kilograms (kg)">Kilograms (kg)</option>
                  <option value="Metric Tons (t / MT)">
                    Metric Tons (t / MT)
                  </option>
                </select>
              </div>

              {/* Standard Cost */}
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "#2D3748" }}
                >
                  Standard Cost (LKR) *
                </label>
                <input
                  type="text"
                  name="std_cost"
                  value={inputs.std_cost}
                  placeholder="150.25"
                  onChange={handleStdCostChange}
                  onFocus={handleStdCostFocus}
                  onBlur={handleStdCostBlur}
                  inputMode="decimal"
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
                  style={{ borderColor: "#e7e9e9", backgroundColor: "#f5f3f1" }}
                />
                <p className="mt-2 text-sm" style={{ color: "#a4ac86" }}>
                 
                </p>
              </div>

              {/* Qty on Hand */}
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "#2D3748" }}
                >
                  Qty on Hand *
                </label>
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
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
                  style={{ borderColor: "#e7e9e9", backgroundColor: "#f5f3f1" }}
                />
              </div>

              {/* Qty Reserved */}
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "#2D3748" }}
                >
                  Qty Reserved *
                </label>
                <input
                  type="number"
                  name="qty_reserved"
                  value={inputs.qty_reserved}
                  onChange={handleChange}
                  onWheel={stopWheel}
                  min="0"
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
                  style={{
                    borderColor: qtyError ? "#ef4444" : "#e7e9e9",
                    backgroundColor: "#f5f3f1",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = qtyError ? "#ef4444" : "#2a5540";
                    e.target.style.boxShadow = `0 0 0 2px ${
                      qtyError
                        ? "rgba(239, 68, 68, 0.1)"
                        : "rgba(42, 85, 64, 0.1)"
                    }`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = qtyError ? "#ef4444" : "#e7e9e9";
                    e.target.style.boxShadow = "none";
                  }}
                />
                {qtyError && (
                  <p className="mt-2 text-sm" style={{ color: "#ef4444" }}>
                    {qtyError}
                  </p>
                )}
              </div>

              {/* Expire Date */}
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "#2D3748" }}
                >
                  Expiry Date *
                </label>
                <input
                  type="date"
                  name="expire_date"
                  value={inputs.expire_date}
                  min={toTodayLocalISODate()}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
                  style={{ borderColor: "#e7e9e9", backgroundColor: "#f5f3f1" }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#2a5540";
                    e.target.style.boxShadow =
                      "0 0 0 2px rgba(42, 85, 64, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e7e9e9";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <p className="mt-2 text-sm" style={{ color: "#a4ac86" }}>
                 
                </p>
              </div>

              {/* Updated At (read-only) */}
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "#2D3748" }}
                >
                  Updated At
                </label>
                <input
                  type="date"
                  name="updated_at"
                  value={inputs.updated_at}
                  readOnly
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none"
                  style={{
                    borderColor: "#e7e9e9",
                    backgroundColor: "#f5f3f1",
                    color: "#718096",
                  }}
                />
              </div>

              {/* Updated By */}
              <div className="md:col-span-2">
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "#2D3748" }}
                >
                  Updated By *
                </label>
                <select
                  name="updated_by"
                  value={inputs.updated_by}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
                  style={{ borderColor: "#e7e9e9", backgroundColor: "#f5f3f1" }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#2a5540";
                    e.target.style.boxShadow =
                      "0 0 0 2px rgba(42, 85, 64, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e7e9e9";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option value="" disabled>
                    Select manager
                  </option>
                  {UPDATED_BY_OPTIONS.map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate("/inventory/cocoProductDetails")}
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
                  backgroundColor: disableSubmit ? "#e7e9e9" : "#2a5540",
                  color: disableSubmit ? "#a4ac86" : "white",
                  cursor: disableSubmit ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!disableSubmit) {
                    e.target.style.backgroundColor = "rgba(42, 85, 64, 0.9)";
                    e.target.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!disableSubmit) {
                    e.target.style.backgroundColor = "#2a5540";
                    e.target.style.transform = "translateY(0)";
                  }
                }}
              >
                {saving ? (
                  <span className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 border-2 rounded-full animate-spin"
                      style={{
                        borderColor: "rgba(255, 255, 255, 0.3)",
                        borderTopColor: "white",
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
 