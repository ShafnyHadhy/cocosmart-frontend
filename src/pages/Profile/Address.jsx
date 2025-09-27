import axios from "axios";
import toast from "react-hot-toast";
import { FaEdit } from "react-icons/fa";

export default function Address({
  user,
  setUser,
  formData,
  setFormData,
  isEditing,
  setIsEditing,
}) {
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "city" || name === "state") {
      // Allow only letters & spaces
      if (/^[a-zA-Z\s]*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else if (name === "zip") {
      // Allow only numbers, max 5 digits
      const digits = value.replace(/\D/g, "").slice(0, 5);
      setFormData((prev) => ({ ...prev, [name]: digits }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const saveChanges = async () => {
    if (!user || !user._id) {
      toast.error("No user to update");
      return;
    }

    try {
      const { address, city, state, zip } = formData;

      // Validation rules
      if (!address?.trim()) return toast.error("Street address is required");
      if (/^\d+$/.test(address.replace(/\s/g, "")))
        return toast.error("Street address cannot be only numbers");

      if (!/^[a-zA-Z\s]{2,50}$/.test(city || ""))
        return toast.error("City must contain only letters (2–50 chars)");

      if (!/^[a-zA-Z\s]{2,50}$/.test(state || ""))
        return toast.error("State must contain only letters (2–50 chars)");

      if (!/^\d{5}$/.test(zip || ""))
        return toast.error("ZIP code must be exactly 5 digits");

      const token = localStorage.getItem("authToken");
      const res = await axios.put(
        `http://localhost:5000/api/users/${user._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUser(res.data);
      setFormData(res.data);
      setIsEditing(false);
      toast.success("Address updated successfully!");
    } catch (err) {
      console.error("Error updating address:", err);
      toast.error("Failed to update address");
    }
  };

  const handleCancel = () => {
    if (user) setFormData({ ...user });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Address</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-green-600 hover:text-green-800 transition-colors duration-200"
            title="Edit Address" // tooltip
          >
            <FaEdit size={24} />
          </button>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveChanges}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Street Address */}
        <div className="flex flex-col md:col-span-2">
          <label
            htmlFor="address"
            className="text-sm font-medium text-gray-700 mb-2"
          >
            Street Address *
          </label>
          <input
            id="address"
            name="address"
            value={formData.address || ""}
            disabled={!isEditing}
            onChange={handleChange}
            placeholder="123 Main Street"
            className="border border-gray-300 rounded-lg px-4 py-3 disabled:bg-gray-100"
          />
        </div>

        {/* City */}
        <div className="flex flex-col">
          <label
            htmlFor="city"
            className="text-sm font-medium text-gray-700 mb-2"
          >
            City *
          </label>
          <input
            id="city"
            name="city"
            value={formData.city || ""}
            disabled={!isEditing}
            onChange={handleChange}
            placeholder="Enter your city"
            className="border border-gray-300 rounded-lg px-4 py-3 disabled:bg-gray-100"
          />
        </div>

        {/* State */}
        <div className="flex flex-col">
          <label
            htmlFor="state"
            className="text-sm font-medium text-gray-700 mb-2"
          >
            State *
          </label>
          <input
            id="state"
            name="state"
            value={formData.state || ""}
            disabled={!isEditing}
            onChange={handleChange}
            placeholder="Enter your state"
            className="border border-gray-300 rounded-lg px-4 py-3 disabled:bg-gray-100"
          />
        </div>

        {/* ZIP Code */}
        <div className="flex flex-col md:col-span-2">
          <label
            htmlFor="zip"
            className="text-sm font-medium text-gray-700 mb-2"
          >
            ZIP Code *
          </label>
          <input
            id="zip"
            name="zip"
            value={formData.zip || ""}
            disabled={!isEditing}
            onChange={handleChange}
            placeholder="12345"
            maxLength={5}
            className="border border-gray-300 rounded-lg px-4 py-3 disabled:bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">
            ZIP must be 5 digits (e.g., 12345)
          </p>
        </div>
      </div>
    </div>
  );
}
