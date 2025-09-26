import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AddCocoProduct() {
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({
    pro_id: "",
    pro_name: "",
    pro_category: "",
    pro_uom: "",
    pro_description: "",
    std_cost: "",
    sell_price: "",
    qty_on_hand: "",
    qty_reserved: "",
    expire_date: "",
    updated_at: "",
    updated_by: "",
  });

  // Validation + UI state
  const [proIdError, setProIdError] = useState("");
  const [checkingProId, setCheckingProId] = useState(false);
  const lastCheckedProId = useRef("");
  const [qtyError, setQtyError] = useState("");
  const [wasClamped, setWasClamped] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Helpers
  const todayLocal = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  };

  // Prefill updated_at with today on first mount
  useEffect(() => {
    setInputs((prev) => ({ ...prev, updated_at: todayLocal() }));
  }, []);

  // Live pro_id uniqueness check (debounced)
  // useEffect(() => {
  //   const value = inputs.pro_id?.trim();
  //   if (!value) {
  //     setProIdError("");
  //     return;
  //   }

  //   const t = setTimeout(async () => {
  //     try {
  //       setCheckingProId(true);
  //       lastCheckedProId.current = value;
  //       const { data } = await axios.get(
  //         "http://localhost:5000/api/cocoProducts/check-pro-id",
  //         { params: { pro_id: value } }
  //       );
  //       if (lastCheckedProId.current !== value) return; // stale
  //       setProIdError(
  //         data?.exists ? "This Product ID already exists. Please use a unique ID." : ""
  //       );
  //     } catch {
  //       setProIdError("Could not verify Product ID. Check your connection.");
  //     } finally {
  //       if (lastCheckedProId.current === value) setCheckingProId(false);
  //     }
  //   }, 400);

  //   return () => clearTimeout(t);
  // }, [inputs.pro_id]);

  // Re-clamp reserved if on-hand drops
  useEffect(() => {
    const onHand = Number(inputs.qty_on_hand) || 0;
    const reserved = Number(inputs.qty_reserved);
    if (inputs.qty_reserved !== "" && !Number.isNaN(reserved) && reserved > onHand) {
      setWasClamped(true);
      setInputs((prev) => ({ ...prev, qty_reserved: String(onHand) }));
    } else {
      setWasClamped(false);
    }
  }, [inputs.qty_on_hand]);

  // Live qty error message
  useEffect(() => {
    const onHand = Number(inputs.qty_on_hand);
    const reserved = Number(inputs.qty_reserved);

    const typedSomething =
      inputs.qty_reserved !== "" && !Number.isNaN(onHand) && !Number.isNaN(reserved);

    if (typedSomething && (reserved > onHand || wasClamped)) {
      setQtyError("Enter a value less than or equal to Qty on Hand.");
    } else {
      setQtyError("");
    }
  }, [inputs.qty_on_hand, inputs.qty_reserved, wasClamped]);

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const sendRequest = async () => {
    const body = {
      pro_id: String(inputs.pro_id),
      pro_name: String(inputs.pro_name),
      pro_category: String(inputs.pro_category),
      pro_uom: String(inputs.pro_uom),
      pro_description: String(inputs.pro_description),
      std_cost: Number(inputs.std_cost),
      sell_price: Number(inputs.sell_price),
      qty_on_hand: Number(inputs.qty_on_hand),
      qty_reserved: Number(inputs.qty_reserved),
      expire_date: inputs.expire_date || null,
      updated_by: String(inputs.updated_by),
    };
    const res = await axios.post("http://localhost:5000/api/cocoProducts", body);
    return res.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (proIdError || checkingProId || qtyError) return;
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

  const disableRest = !!proIdError || checkingProId;
  const disableSubmit = !!proIdError || checkingProId || !!qtyError || saving;

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Add Coco Product</h1>
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
          {/* Product ID */}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Product ID</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                name="pro_id"
                onChange={handleChange}
                value={inputs.pro_id}
                required
                className={`w-full rounded-xl border px-3 py-2 outline-none focus:border-transparent focus:ring-2 ${
                  proIdError
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-200 focus:ring-indigo-500"
                }`}
              />
              {checkingProId && (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
              )}
            </div>
            {proIdError && (
              <p className="mt-1 text-sm text-red-600">{proIdError}</p>
            )}
          </div>

          {/* Product Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Product Name</label>
            <input
              type="text"
              name="pro_name"
              onChange={handleChange}
              value={inputs.pro_name}
              required
              disabled={disableRest}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none disabled:bg-gray-50 disabled:text-gray-500 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
            <input
              type="text"
              name="pro_category"
              onChange={handleChange}
              value={inputs.pro_category}
              required
              disabled={disableRest}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none disabled:bg-gray-50 disabled:text-gray-500 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* UOM */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Unit of Measurement (UOM)</label>
            <select
              name="pro_uom"
              value={inputs.pro_uom}
              onChange={handleChange}
              required
              disabled={disableRest}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none disabled:bg-gray-50 disabled:text-gray-500 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" disabled>
                Select unit
              </option>
              <option value="Pieces (pcs)">Pieces (pcs)</option>
              <option value="Bunches (bch)">Bunches (bch)</option>
              <option value="Bags (bag)">Bags (bag)</option>
              <option value="Liters (L)">Liters (L)</option>
              <option value="Milliliters (mL)">Milliliters (mL)</option>
              <option value="Kilograms (kg)">Kilograms (kg)</option>
              <option value="Metric Tons (t / MT)">Metric Tons (t / MT)</option>
            </select>
          </div>

          {/* Description (optional) */}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="pro_description"
              onChange={handleChange}
              value={inputs.pro_description}
              rows={3}
              disabled={disableRest}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none disabled:bg-gray-50 disabled:text-gray-500 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              placeholder="Optional"
            />
          </div>

          {/* Standard Cost */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Standard Cost</label>
            <input
              type="number"
              name="std_cost"
              value={inputs.std_cost}
              step="0.01"
              min="0.01"
              max="100000"
              required
              disabled={disableRest}
              onWheel={(e) => e.currentTarget.blur()}
              onKeyDown={(e) => {
                if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
              }}
              onChange={(e) => {
                let v = e.target.value;
                if (v === "") {
                  setInputs((prev) => ({ ...prev, std_cost: v }));
                  return;
                }
                v = v.replace(/[+\-]/g, "");
                v = v.replace(/(\..*)\./g, "$1");
                if (/^0+\d/.test(v)) v = v.replace(/^0+(?=\d)/, "");
                if (v.startsWith(".")) v = "0" + v;
                if (v.includes(".")) {
                  const [i, d] = v.split(".");
                  if (d.length > 2) v = `${i}.${d.slice(0, 2)}`;
                }
                if (v === "0.00") v = "0.01";
                const n = Number(v);
                if (!Number.isNaN(n) && n > 100000) v = "100000";
                if (n > 0 && n < 0.01) v = "0.01";
                setInputs((prev) => ({ ...prev, std_cost: v }));
              }}
              onBlur={(e) => {
                const n = Number(e.target.value);
                if (!Number.isNaN(n) && n < 0.01) {
                  setInputs((prev) => ({ ...prev, std_cost: "0.01" }));
                }
              }}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none disabled:bg-gray-50 disabled:text-gray-500 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Selling Price */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Selling Price</label>
            <input
              type="number"
              name="sell_price"
              value={inputs.sell_price}
              step="0.01"
              min="0.01"
              max="100000"
              disabled={disableRest}
              onWheel={(e) => e.currentTarget.blur()}
              onKeyDown={(e) => {
                if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
              }}
              onChange={(e) => {
                let v = e.target.value;
                if (v === "") {
                  setInputs((prev) => ({ ...prev, sell_price: v }));
                  return;
                }
                v = v.replace(/[+\-]/g, "");
                v = v.replace(/(\..*)\./g, "$1");
                if (/^0+\d/.test(v)) v = v.replace(/^0+(?=\d)/, "");
                if (v.startsWith(".")) v = "0" + v;
                if (v.includes(".")) {
                  const [i, d] = v.split(".");
                  if (d.length > 2) v = `${i}.${d.slice(0, 2)}`;
                }
                if (v === "0.00") v = "0.01";
                const n = Number(v);
                if (!Number.isNaN(n) && n > 100000) v = "100000";
                if (n > 0 && n < 0.01) v = "0.01";
                setInputs((prev) => ({ ...prev, sell_price: v }));
              }}
              onBlur={(e) => {
                const n = Number(e.target.value);
                if (!Number.isNaN(n) && n < 0.01) {
                  setInputs((prev) => ({ ...prev, sell_price: "0.01" }));
                }
              }}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none disabled:bg-gray-50 disabled:text-gray-500 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Qty on Hand */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Qty on Hand</label>
            <input
              type="number"
              name="qty_on_hand"
              onChange={handleChange}
              value={inputs.qty_on_hand}
              min="0"
              required
              disabled={disableRest}
              onWheel={(e) => e.currentTarget.blur()}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none disabled:bg-gray-50 disabled:text-gray-500 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Qty Reserved */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Qty Reserved</label>
            <input
              type="number"
              name="qty_reserved"
              value={inputs.qty_reserved}
              min="0"
              required
              disabled={disableRest}
              onWheel={(e) => e.currentTarget.blur()}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") {
                  setWasClamped(false);
                  setInputs((prev) => ({ ...prev, qty_reserved: "" }));
                  return;
                }
                const n = Number(raw);
                if (Number.isNaN(n)) return;
                const onHand = Number(inputs.qty_on_hand) || 0;
                if (n > onHand) {
                  setWasClamped(true);
                  setInputs((prev) => ({ ...prev, qty_reserved: String(onHand) }));
                } else {
                  setWasClamped(false);
                  setInputs((prev) => ({ ...prev, qty_reserved: String(n) }));
                }
              }}
              className={`w-full rounded-xl border px-3 py-2 outline-none focus:border-transparent focus:ring-2 ${
                qtyError ? "border-red-300 focus:ring-red-500" : "border-gray-200 focus:ring-indigo-500"
              } disabled:bg-gray-50 disabled:text-gray-500`}
            />
            {qtyError && <p className="mt-1 text-sm text-red-600">{qtyError}</p>}
          </div>

          {/* Expire Date */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Expire Date</label>
            <input
              type="date"
              name="expire_date"
              value={inputs.expire_date ? inputs.expire_date.slice(0, 10) : ""}
              min={todayLocal()}
              required
              disabled={disableRest}
              onChange={(e) => {
                const v = e.target.value;
                const min = todayLocal();
                setInputs((prev) => ({
                  ...prev,
                  expire_date: v && v < min ? min : v,
                }));
              }}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none disabled:bg-gray-50 disabled:text-gray-500 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-500">Past dates are blocked.</p>
          </div>

          {/* Updated At (read-only) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Updated At</label>
            <input
              type="date"
              name="updated_at"
              value={inputs.updated_at}
              readOnly
              disabled={disableRest}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-600 outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          {/* Updated By */}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Updated By</label>
            <input
              type="text"
              name="updated_by"
              onChange={handleChange}
              value={inputs.updated_by}
              required
              disabled={disableRest}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none disabled:bg-gray-50 disabled:text-gray-500 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            />
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
            onClick={() => navigate("/cocoProductDetails")}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
