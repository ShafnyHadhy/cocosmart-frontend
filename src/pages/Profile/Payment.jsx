import { useState } from "react";
import toast from "react-hot-toast";
import { FaEdit } from "react-icons/fa";

export default function Payment({
  user,
  formData,
  setFormData,
  isEditing,
  setIsEditing,
}) {
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "cardName") {
      // Only letters & spaces
      if (/^[a-zA-Z\s]*$/.test(value)) {
        setFormData((prev) => ({ ...prev, cardName: value }));
      }
    } else if (name === "cardNumber") {
      // Digits only, max 16, formatted in groups of 4
      let digits = value.replace(/\D/g, "").slice(0, 16);
      let formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
      setFormData((prev) => ({ ...prev, cardNumber: formatted }));
    } else if (name === "expiry") {
      // Only allow MM/YY format
      let cleaned = value.replace(/\D/g, "").slice(0, 4);
      if (cleaned.length >= 3) {
        cleaned = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
      }
      setFormData((prev) => ({ ...prev, expiry: cleaned }));
    } else if (name === "cvv") {
      // Only digits, max 3
      const digits = value.replace(/\D/g, "").slice(0, 3);
      setFormData((prev) => ({ ...prev, cvv: digits }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateAndSave = () => {
    const { cardName, cardNumber, expiry, cvv } = formData;

    // Cardholder name validation
    if (!/^[a-zA-Z\s]{2,50}$/.test(cardName || "")) {
      toast.error("Cardholder name must contain only letters (2–50 chars)");
      return;
    }

    // Card number validation
    const digits = (cardNumber || "").replace(/\s/g, "");
    if (!/^\d{16}$/.test(digits)) {
      toast.error("Card number must be exactly 16 digits");
      return;
    }

    // Expiry validation
    if (!/^\d{2}\/\d{2}$/.test(expiry || "")) {
      toast.error("Expiry date must be in MM/YY format");
      return;
    }
    const [mm, yy] = expiry.split("/").map(Number);
    if (mm < 1 || mm > 12) {
      toast.error("Expiry month must be between 01 and 12");
      return;
    }
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    if (yy < currentYear || (yy === currentYear && mm < currentMonth)) {
      toast.error("Expiry date must be in the future");
      return;
    }

    // CVV validation
    if (!/^\d{3}$/.test(cvv || "")) {
      toast.error("CVV must be exactly 3 digits");
      return;
    }

    // If all validations pass
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setIsEditing(false);
      toast.success("Payment details updated successfully!");
    }, 1000);
  };

  const handleCancel = () => {
    if (user) setFormData({ ...user });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Personal Information
        </h2>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-[#5c4033] hover:text-black transition-colors duration-200"
            title="Edit Payment" // tooltip text
          >
            <FaEdit size={24} /> {/* edit icon */}
          </button>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2.5 rounded-lg font-medium transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              disabled={saving}
              onClick={saveChanges}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2.5 rounded-lg font-medium transition-colors duration-200"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cardholder Name */}
        <div className="flex flex-col md:col-span-2">
          <label
            htmlFor="cardName"
            className="text-sm font-medium text-gray-700 mb-2"
          >
            Cardholder Name *
          </label>
          <input
            id="cardName"
            name="cardName"
            value={formData.cardName || ""}
            disabled={!isEditing}
            onChange={handleChange}
            placeholder="John Doe"
            className="border border-gray-300 rounded-lg px-4 py-3 disabled:bg-gray-100"
          />
        </div>

        {/* Card Number */}
        <div className="flex flex-col md:col-span-2">
          <label
            htmlFor="cardNumber"
            className="text-sm font-medium text-gray-700 mb-2"
          >
            Card Number *
          </label>
          <input
            id="cardNumber"
            name="cardNumber"
            value={formData.cardNumber || ""}
            disabled={!isEditing}
            onChange={handleChange}
            placeholder="XXXX XXXX XXXX XXXX"
            className="border border-gray-300 rounded-lg px-4 py-3 disabled:bg-gray-100"
          />
        </div>

        {/* Expiry */}
        <div className="flex flex-col">
          <label
            htmlFor="expiry"
            className="text-sm font-medium text-gray-700 mb-2"
          >
            Expiry (MM/YY) *
          </label>
          <input
            id="expiry"
            name="expiry"
            value={formData.expiry || ""}
            disabled={!isEditing}
            onChange={handleChange}
            placeholder="MM/YY"
            className="border border-gray-300 rounded-lg px-4 py-3 disabled:bg-gray-100"
          />
        </div>

        {/* CVV */}
        <div className="flex flex-col">
          <label
            htmlFor="cvv"
            className="text-sm font-medium text-gray-700 mb-2"
          >
            CVV *
          </label>
          <input
            id="cvv"
            name="cvv"
            value={formData.cvv || ""}
            disabled={!isEditing}
            onChange={handleChange}
            placeholder="123"
            maxLength={3}
            className="border border-gray-300 rounded-lg px-4 py-3 disabled:bg-gray-100"
          />
        </div>
      </div>
    </div>
  );
}
