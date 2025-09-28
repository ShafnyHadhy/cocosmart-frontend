// Import hooks and libraries
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaIdCard,
  FaCar,
  FaGasPump,
  FaCalendarAlt,
  FaPlusCircle,
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
  min,
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
          min={type === "date" ? min : undefined}
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

// Validation rules
const validators = {
  vehicleDigits: (val) => {
    if (!val) return "Vehicle ID digits are required";
    if (!/^\d{3}$/.test(val)) return "Vehicle ID must be 3 digits";
    return "";
  },
  plateNumber: (val) => {
    if (!val) return "Plate number is required";
    if (!/^[A-Z]{2,4}-\d{4}$/.test(val))
      return "Plate number must be like NH-1234";
    return "";
  },
  type: (val) => {
    if (!val) return "Vehicle type is required";
    if (!/^[a-zA-Z\s]{2,30}$/.test(val))
      return "Type must be 2-30 letters/spaces";
    return "";
  },
  fuelType: (val) => {
    if (!val) return "Fuel type is required";
    if (/^\d/.test(val)) return "Fuel type cannot start with a number";
    return "";
  },
  insuranceExpiry: (val) => {
    if (!val) return "Insurance expiry is required";
    if (val < new Date().toISOString().split("T")[0])
      return "Insurance expiry cannot be in the past";
    return "";
  },
};

export default function AddVehicle() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vehicleDigits: "",
    plateNumber: "",
    type: "",
    fuelType: "",
    insuranceExpiry: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generic field validation
  const handleValidate = (field, value) => {
    if (field === "vehicleDigits") value = value.replace(/\D/g, "").slice(0, 3);
    if (field === "plateNumber") value = value.toUpperCase().slice(0, 9);
    if (field === "type" && !/^[a-zA-Z\s]*$/.test(value)) return;
    if (field === "fuelType" && /^\d/.test(value)) return;

    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: validators[field](value) }));
  };

  const handleAddVehicle = async () => {
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
      await axios.post(`${import.meta.env.VITE_API_URL}/api/vehicles`, {
        vehicleId: `VN-${formData.vehicleDigits}`,
        plateNumber: formData.plateNumber,
        type: formData.type,
        fuelType: formData.fuelType,
        insuranceExpiry: formData.insuranceExpiry,
        status: "available",
      });
      toast.success("Vehicle added successfully");
      setFormData({
        vehicleDigits: "",
        plateNumber: "",
        type: "",
        fuelType: "",
        insuranceExpiry: "",
      });
      navigate("/admin/vehicles");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add vehicle");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center p-6 bg-gray-50">
      <div className="bg-sec-2 rounded-xl shadow-2xl border border-medium-gray overflow-hidden w-full max-w-md">
        <div className="bg-green-calm p-4">
          <h1 className="text-xl font-bold text-white text-center flex items-center justify-center gap-2">
            <FaPlusCircle className="text-earth-white" />
            Add New Vehicle
          </h1>
          <p className="text-white text-center mt-1 text-xs">
            Register vehicle to the system
          </p>
        </div>

        <div className="p-5 space-y-4 bg-white/95 backdrop-blur-sm">
          <FormInput
            label="Vehicle ID"
            icon={FaIdCard}
            placeholder="Enter 3 digits"
            value={formData.vehicleDigits}
            onChange={(e) => handleValidate("vehicleDigits", e.target.value)}
            onBlur={() =>
              handleValidate("vehicleDigits", formData.vehicleDigits)
            }
            maxLength={3}
            prefix="VN-"
            error={errors.vehicleDigits}
          />
          <FormInput
            label="Plate Number"
            icon={FaCar}
            placeholder="e.g. NH-1234"
            value={formData.plateNumber}
            onChange={(e) => handleValidate("plateNumber", e.target.value)}
            onBlur={() => handleValidate("plateNumber", formData.plateNumber)}
            maxLength={9}
            error={errors.plateNumber}
          />
          <FormInput
            label="Vehicle Type"
            icon={FaCar}
            placeholder="e.g. Truck, Van"
            value={formData.type}
            onChange={(e) => handleValidate("type", e.target.value)}
            onBlur={() => handleValidate("type", formData.type)}
            maxLength={30}
            error={errors.type}
          />
          <FormInput
            label="Fuel Type"
            icon={FaGasPump}
            placeholder="e.g. Petrol, Diesel, EV"
            value={formData.fuelType}
            onChange={(e) => handleValidate("fuelType", e.target.value)}
            onBlur={() => handleValidate("fuelType", formData.fuelType)}
            error={errors.fuelType}
          />
          <FormInput
            label="Insurance Expiry"
            icon={FaCalendarAlt}
            type="date"
            value={formData.insuranceExpiry}
            onChange={(e) => handleValidate("insuranceExpiry", e.target.value)}
            onBlur={() =>
              handleValidate("insuranceExpiry", formData.insuranceExpiry)
            }
            error={errors.insuranceExpiry}
            // Prevent selecting past dates
            min={new Date().toISOString().split("T")[0]}
          />

          <button
            onClick={handleAddVehicle}
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
                Add Vehicle
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
