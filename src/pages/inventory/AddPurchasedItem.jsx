import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
    expire_date: "", // optional
    supplier: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const sendRequest = async () => {
    const body = {
      item_id: String(inputs.item_id),
      item_name: String(inputs.item_name),
      category: String(inputs.category),
      item_unit: String(inputs.item_unit),
      unit_cost: Number(inputs.unit_cost),
      ROL: Number(inputs.ROL),
      quantity: Number(inputs.quantity),
      supplier: String(inputs.supplier),
      expire_date: inputs.expire_date || null, // omit/null if empty
    };
    const res = await axios.post("http://localhost:5000/api/purchasedItems", body);
    return res.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
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
    <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Add Purchased Item</h1>
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
          {/* Item ID */}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Item ID</label>
            <input
              type="text"
              name="item_id"
              onChange={handleChange}
              value={inputs.item_id}
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Item Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Item Name</label>
            <input
              type="text"
              name="item_name"
              onChange={handleChange}
              value={inputs.item_name}
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
            <input
              type="text"
              name="category"
              onChange={handleChange}
              value={inputs.category}
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Unit (UOM) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Unit (UOM)</label>
            <input
              type="text"
              name="item_unit"
              onChange={handleChange}
              value={inputs.item_unit}
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Unit Cost */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Unit Cost</label>
            <input
              type="number"
              name="unit_cost"
              value={inputs.unit_cost}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Re-order Level (ROL) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Re-order Level (ROL)</label>
            <input
              type="number"
              name="ROL"
              value={inputs.ROL}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={inputs.quantity}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Expire Date (optional) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Expire Date (optional)</label>
            <input
              type="date"
              name="expire_date"
              value={inputs.expire_date}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Supplier */}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Supplier</label>
            <input
              type="text"
              name="supplier"
              onChange={handleChange}
              value={inputs.supplier}
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
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
            onClick={() => navigate("/inventory/purchasedItems")}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
