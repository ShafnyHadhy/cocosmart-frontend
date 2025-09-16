import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

export default function AdminUpdateFinance() {
  const location = useLocation();
  const navigate = useNavigate();

  // Pre-fill form from location.state
  const [source, setSource] = useState(location.state.source);
  const [description, setDescription] = useState(location.state.description);
  const [amount, setAmount] = useState(location.state.amount);
  const [date, setDate] = useState(location.state.date);
  const [errors, setErrors] = useState({});

  // Validation
  function validate() {
    const newErrors = {};
    if (!source) newErrors.source = "Source is required";
    if (!description) newErrors.description = "Description is required";
    if (!amount || amount <= 0) newErrors.amount = "Enter a valid amount";
    if (!date) newErrors.date = "Select a date";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Update Finance
  async function updateFinance() {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!validate()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    const financeID = location.state.financeID;
    const financeData = { type: "income", source, description, amount, date };

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/finances/${financeID}`,
        financeData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Income record updated successfully");
      navigate("/admin/finances");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update income record");
    }
  }

  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-10 border border-gray-200">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-800">
            Update Income
          </h2>
          <p className="text-gray-500 mt-2">
            Modify the details below and save updates for this income record.
          </p>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Source
              </label>
              <input
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Enter Source (e.g. Product Sales)"
                className="w-full p-3 border rounded-xl border-gray-300 focus:ring-2 focus:ring-accent focus:outline-none"
              />
              {errors.source && (
                <p className="text-red-500 text-xs mt-1">{errors.source}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed income description"
                rows={6}
                className="w-full p-3 border rounded-xl border-gray-300 focus:ring-2 focus:ring-accent focus:outline-none resize-none"
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter Amount"
                className="w-full p-3 border rounded-xl border-gray-300 focus:ring-2 focus:ring-accent focus:outline-none"
              />
              {errors.amount && (
                <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 border rounded-xl border-gray-300 focus:ring-2 focus:ring-accent focus:outline-none"
              />
              {errors.date && (
                <p className="text-red-500 text-xs mt-1">{errors.date}</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-12">
          <button
            className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold border border-accent rounded-xl shadow hover:bg-gray-200 transition-all"
            onClick={() => navigate("/admin/finances")}
          >
            Cancel
          </button>
          <button
            className="px-8 py-3 bg-accent text-white font-semibold rounded-xl shadow hover:bg-secondary transition-all"
            onClick={updateFinance}
          >
            Update Income
          </button>
        </div>
      </div>
    </div>
  );
}
