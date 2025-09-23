// Import hooks and libraries
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaIdCard,
  FaUser,
  FaPhone,
  FaPlusCircle,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";

// Reusable Input component
function FormInput({
  label,
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  maxLength,
  error,
  prefix,
}) {
  return (
    <div className="relative">
      <label className="block text-secondary mb-1 text-sm font-medium">
        <Icon className="inline-block mr-1 text-green-calm" />
        {label}
      </label>
      <div className="flex items-center gap-2">
        {prefix && (
          <span className="px-2 py-1 bg-accent-green-20 text-green-calm rounded text-xs font-semibold border border-medium-gray">
            {prefix}
          </span>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          maxLength={maxLength}
          className={`flex-1 px-3 py-2 text-sm bg-white border rounded-lg
                     focus:outline-none focus:ring-1 focus:ring-green-calm text-secondary
                     shadow-[inset_0_2px_6px_rgba(0,0,0,0.1)] transition-all
                     ${error ? "border-red-500" : "border-medium-gray"}`}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

// Reusable Textarea component
function FormTextarea({
  label,
  icon: Icon,
  placeholder,
  value,
  onChange,
  error,
}) {
  return (
    <div className="relative">
      <label className="block text-secondary mb-1 text-sm font-medium">
        <Icon className="inline-block mr-1 text-green-calm" />
        {label}
      </label>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={2}
        className={`w-full px-3 py-2 text-sm bg-white border rounded-lg
                   focus:outline-none focus:ring-1 focus:ring-green-calm text-secondary
                   shadow-[inset_0_2px_6px_rgba(0,0,0,0.1)] transition-all resize-none
                   ${error ? "border-red-500" : "border-medium-gray"}`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

// Validation rules
const validators = {
  name: (val) => {
    if (!val) return "Name is required";
    if (!/^[a-zA-Z\s]*$/.test(val))
      return "Name must contain only letters and spaces (2–50 chars)";
    if (val.length < 2 || val.length > 50)
      return "Name must be between 2 and 50 characters";
    return "";
  },
  license: (val) => {
    if (!val) return "License number is required";
    if (!/^\d{8}$/.test(val)) return "License number must be exactly 8 digits";
    return "";
  },
  phone: (val) => {
    if (!val) return "Phone number is required";
    if (!/^07\d{8}$/.test(val))
      return "Phone must start with 07 and be 10 digits";
    return "";
  },
  email: (val) => {
    if (!val) return "Email is required";
    if (!/^[a-z]/.test(val)) return "Email must start with a lowercase letter";
    if (!/^[a-z][a-z0-9._%+-]*@[a-z0-9-]+(\.[a-z]{2,})+$/.test(val))
      return "Please enter a valid email (e.g., driver@example.com)";
    return "";
  },
  address: (val) => {
    if (val.length > 100) return "Address must not exceed 100 characters";
    return "";
  },
};

export default function AddDriver() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    license: "",
    phone: "07",
    email: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generic field validation
  const handleValidate = (field, value) => {
    // Format phone while typing
    if (field === "phone") {
      let formatted = value.replace(/\D/g, "").slice(0, 10);
      if (!formatted.startsWith("07")) formatted = "07" + formatted.slice(2);
      value = formatted;
    }

    // License must only allow digits
    if (field === "license" && !/^\d*$/.test(value)) return;

    //  Block numbers in name field immediately
    if (field === "name") {
      value = value.replace(/[^a-zA-Z\s]/g, ""); // only letters + spaces
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: validators[field](value) }));
  };

  // Submit handler
  const handleAddDriver = async () => {
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      newErrors[field] = validators[field](formData[field]);
    });
    setErrors(newErrors);

    if (Object.values(newErrors).some((msg) => msg)) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/drivers`, {
        name: formData.name,
        licenseNumber: `LN-${formData.license}`,
        phone: formData.phone,
        email: formData.email.toLowerCase(),
        address: formData.address,
      });
      toast.success("Driver added successfully");
      setFormData({
        name: "",
        license: "",
        phone: "07",
        email: "",
        address: "",
      });
      navigate("/admin/drivers");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add driver");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Main form */}
      <div className="bg-sec-2 rounded-xl shadow-2xl border border-medium-gray overflow-hidden w-full max-w-md ">
        <div className="bg-green-calm p-4 ">
          <h1 className="text-xl font-bold text-white text-center flex items-center justify-center gap-2">
            <FaPlusCircle className="text-earth-white" />
            Add New Driver
          </h1>
          <p className="text-earth-black text-center mt-1 text-xs">
            Register driver to the system
          </p>
        </div>

        <div className="p-5 space-y-4 bg-white/95 backdrop-blur-sm">
          <FormInput
            label="Driver Name"
            icon={FaUser}
            placeholder="e.g. John Doe"
            value={formData.name}
            onChange={(e) => handleValidate("name", e.target.value)}
            onBlur={() => handleValidate("name", formData.name)}
            maxLength={50}
            error={errors.name}
          />

          <FormInput
            label="License Number"
            icon={FaIdCard}
            placeholder="Enter 8 digits"
            value={formData.license}
            onChange={(e) => handleValidate("license", e.target.value)}
            onBlur={() => handleValidate("license", formData.license)}
            maxLength={8}
            prefix="LN-"
            error={errors.license}
          />

          <FormInput
            label="Phone Number"
            icon={FaPhone}
            placeholder="07XXXXXXXX"
            value={formData.phone}
            onChange={(e) => handleValidate("phone", e.target.value)}
            onBlur={() => handleValidate("phone", formData.phone)}
            maxLength={10}
            error={errors.phone}
          />

          <FormInput
            label="Email Address"
            icon={FaEnvelope}
            type="email"
            placeholder="e.g., driver@example.com"
            value={formData.email}
            onChange={(e) => handleValidate("email", e.target.value)}
            onBlur={() => handleValidate("email", formData.email)}
            error={errors.email}
          />

          <FormTextarea
            label="Address (Optional)"
            icon={FaMapMarkerAlt}
            placeholder="Enter driver's address"
            value={formData.address}
            onChange={(e) => handleValidate("address", e.target.value)}
            error={errors.address}
          />

          <button
            onClick={handleAddDriver}
            disabled={isSubmitting}
            className={`w-full py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1
            ${
              isSubmitting
                ? "bg-medium-gray text-secondary cursor-not-allowed"
                : "bg-green-calm hover:bg-green-calm-90 text-white shadow-lg hover:shadow-xl hover:-translate-y-1"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                Adding...
              </>
            ) : (
              <>
                <FaPlusCircle className="text-sm" />
                Add Driver
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
