import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaEdit } from "react-icons/fa";

export default function Personal({
  user,
  setUser,
  formData,
  setFormData,
  isEditing,
  setIsEditing,
}) {
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Config helper
  const getConfig = (extraHeaders = {}) => {
    const token = localStorage.getItem("authToken");
    const headers = token
      ? { Authorization: `Bearer ${token}`, ...extraHeaders }
      : { ...extraHeaders };
    return { headers };
  };

  // Validation
  const handleFirstnameChange = (val) => {
    const filteredVal = val.replace(/[^a-zA-Z\s]/g, "");
    setFormData((prev) => ({ ...prev, firstname: filteredVal }));
    setErrors((prev) => ({
      ...prev,
      firstname:
        val && !/^[a-zA-Z\s]+$/.test(val)
          ? "Only letters and spaces allowed"
          : "",
    }));
  };

  const handleLastnameChange = (val) => {
    const filteredVal = val.replace(/[^a-zA-Z\s]/g, "");
    setFormData((prev) => ({ ...prev, lastname: filteredVal }));
    setErrors((prev) => ({
      ...prev,
      lastname:
        val && !/^[a-zA-Z\s]+$/.test(val)
          ? "Only letters and spaces allowed"
          : "",
    }));
  };

  const handleEmailChange = (val) => {
    const lowerVal = val.toLowerCase();
    setFormData((prev) => ({ ...prev, email: lowerVal }));
    if (!lowerVal) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
    } else if (!/^[a-z]/.test(lowerVal)) {
      setErrors((prev) => ({
        ...prev,
        email: "Email must start with a lowercase letter",
      }));
    } else if (
      !/^[a-z][a-z0-9._%+-]*@[a-z0-9-]+(\.[a-z]{2,})+$/.test(lowerVal)
    ) {
      setErrors((prev) => ({
        ...prev,
        email: "Enter a valid email (e.g., user@example.com)",
      }));
    } else {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  // Input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "firstname") handleFirstnameChange(value);
    else if (name === "lastname") handleLastnameChange(value);
    else if (name === "email") handleEmailChange(value);
    else if (name === "phone") {
      let digits = value.replace(/\D/g, "").slice(0, 10);
      if (!digits.startsWith("0") && digits.length > 0)
        digits = "0" + digits.slice(1);
      setFormData((prev) => ({ ...prev, phone: digits }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Save changes
  const saveChanges = async () => {
    if (!user || !user._id) return toast.error("No user to update");

    if (errors.firstname || errors.lastname || errors.email) {
      return toast.error("Please fix validation errors before saving");
    }
    if (!formData.firstname || !formData.lastname || !formData.email) {
      return toast.error("First name, last name, and email are required");
    }
    if (formData.phone && !/^0\d{9}$/.test(formData.phone)) {
      return toast.error("Phone must start with 0 and be 10 digits");
    }

    try {
      setSaving(true);
      const res = await axios.put(
        `http://localhost:5000/api/users/${user._id}`,
        formData,
        getConfig()
      );
      setUser(res.data.user);
      setFormData({ ...res.data.user });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) setFormData({ ...user });
    setIsEditing(false);
    setErrors({});
  };

  useEffect(() => {
    if (user) setFormData({ ...user });
  }, [user, setFormData]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Personal Information
        </h2>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-green-600 hover:text-green-800 transition-colors duration-200"
            title="Edit Information" // tooltip text
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
        {/* First Name */}
        <div className="flex flex-col">
          <label
            htmlFor="firstname"
            className="text-sm font-medium text-gray-700 mb-2"
          >
            First Name *
          </label>
          <input
            id="firstname"
            name="firstname"
            value={formData.firstname || ""}
            disabled={!isEditing}
            onChange={handleChange}
            placeholder="Enter your first name"
            className="border border-gray-300 rounded-lg px-4 py-3 disabled:bg-gray-100"
          />
          {errors.firstname && (
            <p className="text-red-500 text-xs mt-1">{errors.firstname}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="flex flex-col">
          <label
            htmlFor="lastname"
            className="text-sm font-medium text-gray-700 mb-2"
          >
            Last Name *
          </label>
          <input
            id="lastname"
            name="lastname"
            value={formData.lastname || ""}
            disabled={!isEditing}
            onChange={handleChange}
            placeholder="Enter your last name"
            className="border border-gray-300 rounded-lg px-4 py-3 disabled:bg-gray-100"
          />
          {errors.lastname && (
            <p className="text-red-500 text-xs mt-1">{errors.lastname}</p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label
            htmlFor="email"
            className="text-sm font-medium text-gray-700 mb-2"
          >
            Email Address *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email || ""}
            disabled={!isEditing}
            onChange={handleChange}
            onBlur={handleEmailChange}
            placeholder="Enter your email address"
            className="border border-gray-300 rounded-lg px-4 py-3 disabled:bg-gray-100"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div className="flex flex-col">
          <label
            htmlFor="phone"
            className="text-sm font-medium text-gray-700 mb-2"
          >
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            value={formData.phone || ""}
            disabled={!isEditing}
            onChange={handleChange}
            placeholder="0xxxxxxxxx"
            maxLength={10}
            className="border border-gray-300 rounded-lg px-4 py-3 disabled:bg-gray-100"
          />
        </div>
      </div>
    </div>
  );
}
