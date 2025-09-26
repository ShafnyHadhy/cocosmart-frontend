import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function UpdateSupplier() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [inputs, setInputs] = useState({
    sup_id: "",
    sup_name: "",
    email: "",
    contact: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch supplier by id
  useEffect(() => {
    const fetchHandler = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`http://localhost:5000/api/suppliers/${id}`);
        // Support a few common shapes
        const sup = data?.supplier || data?.suppliers || data;
        if (!sup) return;
        setInputs({
          sup_id: sup.sup_id ?? "",
          sup_name: sup.sup_name ?? "",
          email: sup.email ?? "",
          contact: sup.contact ?? "",
          address: sup.address ?? "",
        });
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load supplier.");
      } finally {
        setLoading(false);
      }
    };
    fetchHandler();
  }, [id]);

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const sendRequest = async () => {
    const body = {
      sup_name: String(inputs.sup_name),
      email: String(inputs.email),
      contact: String(inputs.contact),
      address: String(inputs.address),
    };
    const res = await axios.put(`http://localhost:5000/api/suppliers/${id}`, body);
    return res.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    try {
      setSaving(true);
      await sendRequest();
      setSuccess("Supplier updated successfully.");
      setTimeout(() => navigate("/inventory/supplierDetails"), 600);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update supplier.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="flex items-center gap-3 text-gray-600">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
          <span>Loading supplier…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Update Supplier</h1>
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
          {/* Supplier ID (read-only) */}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Supplier ID</label>
            <input
              type="text"
              name="sup_id"
              value={inputs.sup_id}
              readOnly
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-600 outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          {/* Supplier Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Supplier Name</label>
            <input
              type="text"
              name="sup_name"
              value={inputs.sup_name}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={inputs.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              placeholder="name@example.com"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Contact</label>
            <input
              type="text"
              name="contact"
              value={inputs.contact}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., 0771234567"
            />
          </div>

          {/* Address */}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
            <textarea
              name="address"
              rows={3}
              value={inputs.address}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              placeholder="Street, City, Province"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-white transition active:scale-[0.99] ${
              saving ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
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
            onClick={() => navigate("/inventory/supplierDetails")}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
