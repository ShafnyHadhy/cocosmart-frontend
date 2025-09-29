import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaTruck,
  FaUser,
  FaCar,
  FaMapMarkerAlt,
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
  error,
  options,
  min,
  displayField,
}) {
  return (
    <div className="relative">
      <label className="block text-secondary mb-1 text-sm font-medium">
        <Icon className="inline-block mr-1 text-green-calm" />
        {label}
      </label>

      {options ? (
        <select
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-calm ${
            error ? "border-red-500" : "border-medium-gray"
          }`}
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt._id || opt} value={opt._id || opt}>
              {displayField
                ? opt[displayField]
                : opt.name || `${opt.vehicleId} - ${opt.type}`}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          min={min}
          className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-calm ${
            error ? "border-red-500" : "border-medium-gray"
          }`}
        />
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

// Validation rules
const validators = {
  orderId: (val) => (!val ? "Order ID is required" : ""),
  driver: (val) => (!val ? "Driver is required" : ""),
  vehicle: (val) => (!val ? "Vehicle is required" : ""),
  route: (val) => (!val ? "Delivery address is required" : ""),
  scheduledDate: (val) => {
    if (!val) return "Scheduled date is required";
    const today = new Date();
    const selectedDate = new Date(val);
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    if (selectedDate < today) return "Scheduled date cannot be in the past";
    return "";
  },
};

export default function AddDelivery() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    orderId: "",
    driver: "",
    vehicle: "",
    route: "",
    scheduledDate: "",
  });
  const [errors, setErrors] = useState({});
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchDrivers();
    fetchVehicles();
  }, []);

  // Fetch Orders - Filter only pending orders
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/orders`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Filter only pending orders that can be assigned for delivery
      const pendingOrders = (res.data.orders || []).filter(
        (order) => order.status === "pending" || order.status === "Pending"
      );

      setOrders(pendingOrders);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch orders");
    }
  };

  // Fetch Drivers
  const fetchDrivers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/drivers`
      );
      setDrivers(res.data.filter((d) => d.status === "available"));
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch drivers");
    }
  };

  // Fetch Vehicles
  const fetchVehicles = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/vehicles`
      );
      setVehicles(res.data.filter((v) => v.status === "available"));
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch vehicles");
    }
  };

  // Validate input fields
  const handleValidate = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: validators[field](value) }));
  };

  // Submit form - FIXED: Send orderID string instead of _id
  const handleAddDelivery = async () => {
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
      // Find the selected order to get its orderID string
      const selectedOrder = orders.find(
        (order) => order._id === formData.orderId
      );

      if (!selectedOrder) {
        toast.error("Selected order not found");
        return;
      }

      // Send the orderID string (like "ORD0000001") instead of the _id
      await axios.post(`${import.meta.env.VITE_API_URL}/api/deliveries`, {
        orderId: selectedOrder.orderID, // Send the orderID string
        vehicle: formData.vehicle,
        driver: formData.driver,
        route: formData.route,
        scheduledDate: formData.scheduledDate,
      });

      toast.success("Delivery assigned successfully");

      // Set flag to refresh orders page
      localStorage.setItem("ordersNeedRefresh", "true");

      navigate("/admin/deliveries");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to assign delivery");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 min-h-screen bg-gray-50">
      <div className="bg-sec-2 rounded-xl shadow-2xl border border-medium-gray overflow-hidden w-full max-w-md">
        <div className="bg-green-calm p-4">
          <h1 className="text-xl font-bold text-white text-center flex items-center justify-center gap-2">
            <FaPlusCircle /> Assign Delivery
          </h1>
          <p className="text-earth-black text-center mt-1 text-xs">
            Schedule a new delivery assignment
          </p>
        </div>

        <div className="p-5 space-y-4 bg-white/95 backdrop-blur-sm">
          {/* Orders dropdown - FIXED: Show orderID but store _id temporarily */}
          <FormInput
            label="Order"
            icon={FaTruck}
            value={formData.orderId}
            onChange={(e) => handleValidate("orderId", e.target.value)}
            onBlur={() => handleValidate("orderId", formData.orderId)}
            options={orders}
            displayField="orderID"
            error={errors.orderId}
          />

          {/* Show selected order details */}
          {formData.orderId && (
            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
              Selected Order:{" "}
              {orders.find((o) => o._id === formData.orderId)?.customerName} -
              LKR{" "}
              {orders
                .find((o) => o._id === formData.orderId)
                ?.total?.toFixed(2)}{" "}
              - Status: {orders.find((o) => o._id === formData.orderId)?.status}
            </div>
          )}

          {/* Drivers dropdown */}
          <FormInput
            label="Driver"
            icon={FaUser}
            value={formData.driver}
            onChange={(e) => handleValidate("driver", e.target.value)}
            onBlur={() => handleValidate("driver", formData.driver)}
            options={drivers}
            displayField="name"
            error={errors.driver}
          />

          {/* Vehicles dropdown */}
          <FormInput
            label="Vehicle"
            icon={FaCar}
            value={formData.vehicle}
            onChange={(e) => handleValidate("vehicle", e.target.value)}
            onBlur={() => handleValidate("vehicle", formData.vehicle)}
            options={vehicles}
            displayField="vehicleId"
            error={errors.vehicle}
          />

          {/* Delivery address */}
          <FormInput
            label="Delivery Address"
            icon={FaMapMarkerAlt}
            placeholder="Enter delivery address"
            value={formData.route}
            onChange={(e) => handleValidate("route", e.target.value)}
            onBlur={() => handleValidate("route", formData.route)}
            error={errors.route}
          />

          {/* Scheduled Date */}
          <FormInput
            label="Scheduled Date"
            icon={FaCalendarAlt}
            type="date"
            value={formData.scheduledDate}
            onChange={(e) => handleValidate("scheduledDate", e.target.value)}
            onBlur={() =>
              handleValidate("scheduledDate", formData.scheduledDate)
            }
            error={errors.scheduledDate}
            min={today}
          />

          {/* Submit button */}
          <button
            onClick={handleAddDelivery}
            disabled={isSubmitting}
            className={`w-full py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
              isSubmitting
                ? "bg-medium-gray text-secondary cursor-not-allowed"
                : "bg-green-calm hover:bg-green-calm-90 text-white shadow-lg hover:shadow-xl hover:-translate-y-1"
            }`}
          >
            {isSubmitting ? "Assigning..." : "Assign Delivery"}
          </button>
        </div>
      </div>
    </div>
  );
}
