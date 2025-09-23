// import { useState, useEffect } from "react";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { useNavigate } from "react-router-dom";
// import {
//   FaTruck,
//   FaUser,
//   FaCar,
//   FaMapMarkerAlt,
//   FaCalendarAlt,
//   FaPlusCircle,
// } from "react-icons/fa";
// import "../../styles/3dEffects.css"; // Import 3D CSS

// export default function AddDelivery() {
//   const navigate = useNavigate();
//   const [deliveryData, setDeliveryData] = useState({
//     orderId: "",
//     driver: "",
//     vehicle: "",
//     route: "",
//     scheduledDate: "",
//   });

//   const [drivers, setDrivers] = useState([]);
//   const [vehicles, setVehicles] = useState([]);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const today = new Date().toISOString().split("T")[0];

//   useEffect(() => {
//     fetchDrivers();
//     fetchVehicles();
//   }, []);

//   const fetchDrivers = async () => {
//     try {
//       const driverRes = await axios.get(
//         `${import.meta.env.VITE_API_URL}/api/drivers`
//       );
//       const availableDrivers = driverRes.data.filter(
//         (d) => d.status === "available"
//       );
//       setDrivers(availableDrivers);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to fetch drivers");
//     }
//   };

//   const fetchVehicles = async () => {
//     try {
//       const res = await axios.get(
//         `${import.meta.env.VITE_API_URL}/api/vehicles`
//       );
//       const availableVehicles = res.data.filter(
//         (v) => v.status === "available"
//       );
//       setVehicles(availableVehicles);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to fetch vehicles");
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setDeliveryData({ ...deliveryData, [name]: value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const { orderId, driver, vehicle, route, scheduledDate } = deliveryData;

//     if (!orderId || !driver || !vehicle || !route || !scheduledDate) {
//       return toast.error("All fields are required");
//     }

//     setIsSubmitting(true);
//     try {
//       await axios.post(
//         `${import.meta.env.VITE_API_URL}/api/deliveries`,
//         deliveryData
//       );
//       toast.success("Delivery assigned successfully");
//       navigate("/admin/deliveries");
//     } catch (err) {
//       console.error(err);
//       toast.error(err.response?.data?.message || "Failed to assign delivery");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center p-4 min-h-screen bg-gray-50 relative overflow-hidden perspective-1000">
//       {/* Floating decorations */}
//       <div className="absolute top-12 left-6 w-16 h-16 opacity-20 animate-float">
//         <div className="w-full h-full bg-[url('/coconut-icon.png')] bg-contain bg-no-repeat"></div>
//       </div>
//       <div className="absolute bottom-12 right-8 w-20 h-20 opacity-15 animate-float-reverse">
//         <div className="w-full h-full bg-[url('/palm-leaf.png')] bg-contain bg-no-repeat"></div>
//       </div>

//       {/* Main Card */}
//       <div
//         className="bg-sec-2 rounded-xl shadow-2xl border border-medium-gray
//                       overflow-hidden w-full max-w-lg transform-style-3d
//                       transition-transform duration-700 hover:translate-z-10"
//       >
//         {/* Header */}
//         <div className="bg-green-calm p-4">
//           <h1 className="text-xl font-bold text-white text-center flex items-center justify-center gap-2">
//             <FaPlusCircle className="text-earth-white" />
//             Assign Delivery
//           </h1>
//           <p className="text-earth-white text-center mt-1 text-sm">
//             Schedule a new delivery assignment
//           </p>
//         </div>

//         {/* Form */}
//         <form
//           onSubmit={handleSubmit}
//           className="p-5 space-y-4 bg-white/95 backdrop-blur-sm"
//         >
//           {/* Order ID */}
//           <div className="relative transform transition-transform duration-300 hover:translate-z-3">
//             <label className="block text-secondary mb-1 font-medium text-sm">
//               <FaTruck className="inline-block mr-2 text-green-calm text-sm" />
//               Order ID
//             </label>
//             <input
//               type="text"
//               name="orderId"
//               placeholder="Enter order ID"
//               value={deliveryData.orderId}
//               onChange={handleChange}
//               className="w-full px-3 py-2 bg-white border border-medium-gray rounded-lg focus:outline-none focus:ring-1 focus:ring-green-calm text-secondary text-sm shadow-[inset_0_2px_6px_rgba(0,0,0,0.1)] hover:translate-y-1 transition-all"
//               required
//             />
//           </div>

//           {/* Driver Selection */}
//           <div className="relative transform transition-transform duration-300 hover:translate-z-3">
//             <label className="block text-secondary mb-1 font-medium text-sm">
//               <FaUser className="inline-block mr-2 text-green-calm text-sm" />
//               Select Driver
//             </label>
//             <select
//               name="driver"
//               value={deliveryData.driver}
//               onChange={handleChange}
//               className="w-full px-3 py-2 bg-white border border-medium-gray rounded-lg focus:outline-none focus:ring-1 focus:ring-green-calm text-secondary text-sm appearance-none shadow-[inset_0_2px_6px_rgba(0,0,0,0.1)] hover:translate-y-1 transition-all"
//               required
//             >
//               <option value="">Choose a driver</option>
//               {drivers.map((driver) => (
//                 <option key={driver._id} value={driver._id}>
//                   {driver.name} - {driver.licenseNumber}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Vehicle Selection */}
//           <div className="relative transform transition-transform duration-300 hover:translate-z-3">
//             <label className="block text-secondary mb-1 font-medium text-sm">
//               <FaCar className="inline-block mr-2 text-green-calm text-sm" />
//               Select Vehicle
//             </label>
//             <select
//               name="vehicle"
//               value={deliveryData.vehicle}
//               onChange={handleChange}
//               className="w-full px-3 py-2 bg-white border border-medium-gray rounded-lg focus:outline-none focus:ring-1 focus:ring-green-calm text-secondary text-sm appearance-none shadow-[inset_0_2px_6px_rgba(0,0,0,0.1)] hover:translate-y-1 transition-all"
//               required
//             >
//               <option value="">Choose a vehicle</option>
//               {vehicles.map((vehicle) => (
//                 <option key={vehicle._id} value={vehicle._id}>
//                   {vehicle.vehicleId} - {vehicle.type}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Route */}
//           <div className="relative transform transition-transform duration-300 hover:translate-z-3">
//             <label className="block text-secondary mb-1 font-medium text-sm">
//               <FaMapMarkerAlt className="inline-block mr-2 text-green-calm text-sm" />
//               Delivery Address
//             </label>
//             <input
//               type="text"
//               name="route"
//               placeholder="Enter delivery address"
//               value={deliveryData.route}
//               onChange={handleChange}
//               className="w-full px-3 py-2 bg-white border border-medium-gray rounded-lg focus:outline-none focus:ring-1 focus:ring-green-calm text-secondary text-sm shadow-[inset_0_2px_6px_rgba(0,0,0,0.1)] hover:translate-y-1 transition-all"
//               required
//             />
//           </div>

//           {/* Scheduled Date */}
//           <div className="relative transform transition-transform duration-300 hover:translate-z-3">
//             <label className="block text-secondary mb-1 font-medium text-sm">
//               <FaCalendarAlt className="inline-block mr-2 text-green-calm text-sm" />
//               Scheduled Date
//             </label>
//             <input
//               type="date"
//               name="scheduledDate"
//               min={today}
//               value={deliveryData.scheduledDate}
//               onChange={handleChange}
//               className="w-full px-3 py-2 bg-white border border-medium-gray rounded-lg focus:outline-none focus:ring-1 focus:ring-green-calm text-secondary text-sm shadow-[inset_0_2px_6px_rgba(0,0,0,0.1)] hover:translate-y-1 transition-all"
//               required
//             />
//           </div>

//           {/* Submit */}
//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className={`w-full py-2 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 text-sm mt-3
//               ${
//                 isSubmitting
//                   ? "bg-medium-gray text-secondary cursor-not-allowed"
//                   : "bg-green-calm hover:bg-green-calm-90 text-white shadow-lg hover:shadow-xl hover:-translate-y-1"
//               }`}
//           >
//             {isSubmitting ? (
//               <>
//                 <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
//                 Assigning...
//               </>
//             ) : (
//               <>
//                 <FaTruck className="text-xs" />
//                 Assign Delivery
//               </>
//             )}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

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
              {opt.name || `${opt.vehicleId} - ${opt.type}`}
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

    // Ignore time part
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
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDrivers();
    fetchVehicles();
  }, []);

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

  const handleValidate = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: validators[field](value) }));
  };

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
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/deliveries`,
        formData
      );
      toast.success("Delivery assigned successfully");
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
          <FormInput
            label="Order ID"
            icon={FaTruck}
            placeholder="Enter order ID"
            value={formData.orderId}
            onChange={(e) => handleValidate("orderId", e.target.value)}
            onBlur={() => handleValidate("orderId", formData.orderId)}
            error={errors.orderId}
          />
          <FormInput
            label="Driver"
            icon={FaUser}
            value={formData.driver}
            onChange={(e) => handleValidate("driver", e.target.value)}
            onBlur={() => handleValidate("driver", formData.driver)}
            options={drivers}
            error={errors.driver}
          />
          <FormInput
            label="Vehicle"
            icon={FaCar}
            value={formData.vehicle}
            onChange={(e) => handleValidate("vehicle", e.target.value)}
            onBlur={() => handleValidate("vehicle", formData.vehicle)}
            options={vehicles}
            error={errors.vehicle}
          />
          <FormInput
            label="Delivery Address"
            icon={FaMapMarkerAlt}
            placeholder="Enter delivery address"
            value={formData.route}
            onChange={(e) => handleValidate("route", e.target.value)}
            onBlur={() => handleValidate("route", formData.route)}
            error={errors.route}
          />
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
            min={today} // Prevent selecting past dates
          />

          <button
            onClick={handleAddDelivery}
            disabled={isSubmitting}
            className={`w-full py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1
              ${
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
