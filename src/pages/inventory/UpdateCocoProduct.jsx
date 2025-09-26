import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

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
  const [wasClamped, setWasClamped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Helpers
  const toDateInput = (val) => {
    if (!val) return "";
    const d = new Date(val);
    return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
  };

  const todayLocal = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  };

  // Clamp reserved when on hand changes
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

  // Live error message
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

  // Fetch item
  useEffect(() => {
    const fetchHandler = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`http://localhost:5000/api/cocoProducts/${id}`);
        const item = data?.cocoProducts;
        if (!item) return;

        setInputs({
          pro_id: item.pro_id ?? "",
          pro_name: item.pro_name ?? "",
          pro_category: item.pro_category ?? "",
          pro_uom: item.pro_uom && item.pro_uom !== "undefined" ? item.pro_uom : "",
          std_cost: item.std_cost ?? "",
          qty_on_hand: item.qty_on_hand ?? "",
          qty_reserved: item.qty_reserved ?? "",
          expire_date: toDateInput(item.expire_date),
          updated_at: toDateInput(item.updated_at || item.updatedAt),
          updated_by: item.updated_by ?? "",
        });
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load product.");
      } finally {
        setLoading(false);
      }
    };
    fetchHandler();
  }, [id]);

  const sendRequest = async () => {
    const body = {
      pro_name: String(inputs.pro_name),
      pro_category: String(inputs.pro_category),
      pro_uom: String(inputs.pro_uom),
      std_cost: inputs.std_cost === "" ? null : Number(inputs.std_cost),
      qty_on_hand: inputs.qty_on_hand === "" ? 0 : Number(inputs.qty_on_hand),
      qty_reserved: inputs.qty_reserved === "" ? 0 : Number(inputs.qty_reserved),
      expire_date: inputs.expire_date || null,
      updated_by: String(inputs.updated_by),
    };

    const res = await axios.put(`http://localhost:5000/api/cocoProducts/${id}`, body);
    return res.data;
  };

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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

  const disableSubmit = !!qtyError || saving;

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

          {/* Product Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Product Name</label>
            <input
              type="text"
              name="pro_name"
              value={inputs.pro_name}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
            <input
              type="text"
              name="pro_category"
              value={inputs.pro_category}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
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
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
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
              onWheel={(e) => e.currentTarget.blur()}
              onKeyDown={(e) => {
                if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
              }}
              onChange={(e) => {
                let v = e.target.value;
                if (v === "") return setInputs((p) => ({ ...p, std_cost: v }));
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
                setInputs((p) => ({ ...p, std_cost: v }));
              }}
              onBlur={(e) => {
                const n = Number(e.target.value);
                if (!Number.isNaN(n) && n < 0.01) {
                  setInputs((p) => ({ ...p, std_cost: "0.01" }));
                }
              }}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Qty on Hand */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Qty on Hand</label>
            <input
              type="number"
              name="qty_on_hand"
              value={inputs.qty_on_hand}
              onChange={handleChange}
              min="0"
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
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
              onWheel={(e) => e.currentTarget.blur()}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") {
                  setWasClamped(false);
                  return setInputs((prev) => ({ ...prev, qty_reserved: "" }));
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
              className={`w-full rounded-xl border px-3 py-2 outline-none focus:border-transparent focus:ring-2 ${qtyError ? "border-red-300 focus:ring-red-500" : "border-gray-200 focus:ring-indigo-500"}`}
            />
            {qtyError && (
              <p className="mt-1 text-sm text-red-600">{qtyError}</p>
            )}
          </div>

          {/* Expire Date */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Expire Date</label>
            <input
              type="date"
              name="expire_date"
              value={inputs.expire_date || ""}
              min={todayLocal()}
              required
              onChange={(e) => {
                const v = e.target.value;
                const min = todayLocal();
                setInputs((prev) => ({ ...prev, expire_date: v && v < min ? min : v }));
              }}
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
              value={inputs.updated_at}
              readOnly
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-600 outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          {/* Updated By */}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Updated By</label>
            <input
              type="text"
              name="updated_by"
              value={inputs.updated_by}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={disableSubmit}
            className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-white transition active:scale-[0.99] ${disableSubmit ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"}`}
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
