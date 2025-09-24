import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function Personal({
  user,
  setUser,
  formData,
  setFormData,
  isEditing,
  setIsEditing,
}) {
  const [saving, setSaving] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Config helper
  const getConfig = (extraHeaders = {}) => {
    const token = localStorage.getItem("authToken");
    const headers = token
      ? { Authorization: `Bearer ${token}`, ...extraHeaders }
      : { ...extraHeaders };
    return { headers };
  };

  // Email live validation
  const handleEmailChange = (val) => {
    const lowerVal = val.toLowerCase();
    setFormData((prev) => ({ ...prev, email: lowerVal }));

    if (lowerVal && !/^[a-z]/.test(lowerVal)) {
      setEmailError("Email must start with a lowercase letter");
    } else {
      setEmailError("");
    }
  };

  // Final email validation
  const validateEmailFinal = (email) => {
    if (!email) return "Email is required";

    if (!/^[a-z]/.test(email))
      return "Email must start with a lowercase letter";

    const emailRegex = /^[a-z][a-z0-9._%+-]*@[a-z0-9-]+(\.[a-z]{2,})+$/;
    if (!emailRegex.test(email))
      return "Please enter a valid email (e.g., user@example.com)";

    return "";
  };

  // Input handler
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "firstname" || name === "lastname") {
      // Allow only letters & spaces
      if (/^[a-zA-Z\s]*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else if (name === "phone") {
      // Allow only digits, max 10 characters
      let digits = value.replace(/\D/g, "").slice(0, 10);

      // Ensure it starts with 0
      if (!digits.startsWith("0") && digits.length > 0) {
        digits = "0" + digits.slice(1);
      }

      setFormData((prev) => ({ ...prev, phone: digits }));
    } else if (name === "email") {
      handleEmailChange(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Save changes with validations
  const saveChanges = async () => {
    if (!user || !user._id) {
      toast.error("No user to update");
      return;
    }

    try {
      setSaving(true);

      const { firstname, lastname, email, phone } = formData;

      // Name validation
      if (!/^[a-zA-Z\s]{2,50}$/.test(firstname || ""))
        return toast.error(
          "First name must contain only letters and spaces (2–50 chars)"
        );
      if (!/^[a-zA-Z\s]{2,50}$/.test(lastname || ""))
        return toast.error(
          "Last name must contain only letters and spaces (2–50 chars)"
        );

      // Email validation
      const emailValidationMsg = validateEmailFinal(email);
      if (emailValidationMsg) return toast.error(emailValidationMsg);

      // Phone validation
      if (phone && !/^0\d{9}$/.test(phone)) {
        return toast.error("Phone must start with 0 and be 10 digits");
      }

      // Save to backend
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
      console.error("Save changes error:", err);
      const errorMessage = err.response?.data?.message || "Update failed";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) setFormData({ ...user });
    setIsEditing(false);
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
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors duration-200"
          >
            Edit Information
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
            onChange={(e) => handleEmailChange(e.target.value)}
            onBlur={() =>
              setEmailError(validateEmailFinal(formData.email || ""))
            }
            placeholder="Enter your email address"
            className="border border-gray-300 rounded-lg px-4 py-3 disabled:bg-gray-100"
          />
          {emailError && (
            <p className="text-red-500 text-xs mt-1">{emailError}</p>
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
