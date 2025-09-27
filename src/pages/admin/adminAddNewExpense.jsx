import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

export default function AdminAddNewExpense() {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Validation
  function validate() {
    const newErrors = {};
    if (!category) newErrors.category = "Please select a category";
    if (!amount || amount <= 0) newErrors.amount = "Enter a valid amount";
    if (!description) newErrors.description = "Description is required";
    if (!date) newErrors.date = "Select a date";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function addExpense() {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!validate()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    const expense = { category, amount, description, date };

    try {
      await axios.post(import.meta.env.VITE_API_URL + "/api/expenses", expense, {
        headers: { Authorization: "Bearer " + token },
      });

      toast.success("Expense added successfully");
      navigate("/admin/expenses");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add expense");
    }
  }

  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-10 border border-gray-200">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-800">
            Add New Expense
          </h2>
          <p className="text-gray-500 mt-2">
            Fill in the details carefully to add a new expense record.
          </p>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 border rounded-xl border-gray-300 focus:ring-2 focus:ring-accent focus:outline-none bg-white"
              >
                <option value="">Select Category</option>
                <option value="Salary">Salary</option>
                <option value="Wages">Wages</option>
                <option value="Tax">Tax</option>
                <option value="Fertilizer">Fertilizer</option>
                <option value="Goods">Goods</option>
                <option value="Transport">Transport</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Utility">Utility</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">{errors.category}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed expense description"
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
                min={0}
                onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || Number(val) >= 0) setAmount(val); // prevent negative input
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") e.preventDefault(); // block typing '-' and 'e'
                  }}
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
                max={new Date().toISOString().split("T")[0]} // disable future dates
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
            onClick={() => navigate("/admin/expenses")}
          >
            Cancel
          </button>
          <button
            className="px-8 py-3 bg-accent text-white font-semibold rounded-xl shadow hover:bg-secondary transition-all"
            onClick={addExpense}
          >
            Add Expense
          </button>
        </div>
      </div>
    </div>
  );
}
