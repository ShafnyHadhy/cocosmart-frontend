// import { useEffect, useState } from "react";
// import axios from "axios";
// import toast from "react-hot-toast";

// export default function Personal({
//   user,
//   setUser,
//   formData,
//   setFormData,
//   isEditing,
//   setIsEditing,
// }) {
//   const [saving, setSaving] = useState(false);

//   // Reusable configuration function from your profile page
//   const getConfig = (extraHeaders = {}) => {
//     const token = localStorage.getItem("authToken");
//     const headers = token
//       ? { Authorization: `Bearer ${token}`, ...extraHeaders }
//       : { ...extraHeaders };
//     return { headers };
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     // Special handling for phone number (from your profile page logic)
//     if (name === "phone") {
//       let processedValue = value.replace(/\D/g, ""); // remove non-digits
//       if (processedValue.length > 9)
//         processedValue = processedValue.slice(0, 9); // max 9 digits
//       if (!processedValue.startsWith("0"))
//         processedValue = "0" + processedValue.replace(/^0+/, ""); // force start with 0

//       setFormData((prev) => ({
//         ...prev,
//         [name]: processedValue,
//       }));
//     } else {
//       setFormData((prev) => ({
//         ...prev,
//         [name]: value,
//       }));
//     }
//   };

//   // Enhanced save function with better error handling
//   const saveChanges = async () => {
//     if (!user || !user._id) {
//       toast.error("No user to update");
//       return;
//     }

//     try {
//       setSaving(true);

//       // Validate required fields
//       if (
//         !formData.firstname?.trim() ||
//         !formData.lastname?.trim() ||
//         !formData.email?.trim()
//       ) {
//         toast.error("Please fill in all required fields");
//         return;
//       }

//       // Email validation
//       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       if (!emailRegex.test(formData.email)) {
//         toast.error("Please enter a valid email address");
//         return;
//       }

//       const res = await axios.put(
//         `http://localhost:5000/api/users/${user._id}`,
//         formData,
//         getConfig()
//       );

//       setUser(res.data);
//       setFormData({ ...res.data });
//       setIsEditing(false);
//       toast.success("Profile updated successfully!");
//     } catch (err) {
//       console.error("Save changes error:", err);
//       const errorMessage = err.response?.data?.message || "Update failed";
//       toast.error(errorMessage);
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Enhanced cancel function that resets form data
//   const handleCancel = () => {
//     if (user) {
//       setFormData({ ...user });
//     }
//     setIsEditing(false);
//   };

//   useEffect(() => {
//     if (user) setFormData({ ...user });
//   }, [user, setFormData]);

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-gray-800">
//           Personal Information
//         </h2>
//         {!isEditing ? (
//           <button
//             onClick={() => setIsEditing(true)}
//             className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors duration-200"
//           >
//             Edit Information
//           </button>
//         ) : (
//           <div className="flex space-x-3">
//             <button
//               onClick={handleCancel}
//               className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2.5 rounded-lg font-medium transition-colors duration-200"
//             >
//               Cancel
//             </button>
//             <button
//               disabled={saving}
//               onClick={saveChanges}
//               className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2.5 rounded-lg font-medium transition-colors duration-200"
//             >
//               {saving ? "Saving..." : "Save Changes"}
//             </button>
//           </div>
//         )}
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="flex flex-col">
//           <label
//             htmlFor="firstname"
//             className="text-sm font-medium text-gray-700 mb-2"
//           >
//             First Name *
//           </label>
//           <input
//             id="firstname"
//             name="firstname"
//             value={formData.firstname || ""}
//             disabled={!isEditing}
//             onChange={handleChange}
//             placeholder="Enter your first name"
//             className="border border-gray-300 rounded-lg px-4 py-3 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
//           />
//         </div>

//         <div className="flex flex-col">
//           <label
//             htmlFor="lastname"
//             className="text-sm font-medium text-gray-700 mb-2"
//           >
//             Last Name *
//           </label>
//           <input
//             id="lastname"
//             name="lastname"
//             value={formData.lastname || ""}
//             disabled={!isEditing}
//             onChange={handleChange}
//             placeholder="Enter your last name"
//             className="border border-gray-300 rounded-lg px-4 py-3 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
//           />
//         </div>

//         <div className="flex flex-col">
//           <label
//             htmlFor="email"
//             className="text-sm font-medium text-gray-700 mb-2"
//           >
//             Email Address *
//           </label>
//           <input
//             id="email"
//             name="email"
//             type="email"
//             value={formData.email || ""}
//             disabled={!isEditing}
//             onChange={handleChange}
//             placeholder="Enter your email address"
//             className="border border-gray-300 rounded-lg px-4 py-3 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
//           />
//         </div>

//         <div className="flex flex-col">
//           <label
//             htmlFor="phone"
//             className="text-sm font-medium text-gray-700 mb-2"
//           >
//             Phone Number
//           </label>
//           <input
//             id="phone"
//             name="phone"
//             value={formData.phone || ""}
//             disabled={!isEditing}
//             onChange={handleChange}
//             placeholder="0xxxxxxxxx"
//             maxLength={10}
//             className="border border-gray-300 rounded-lg px-4 py-3 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
//           />
//           <p className="text-xs text-gray-500 mt-1">Format: 0xxxxxxxxx</p>
//         </div>
//       </div>

//       {isEditing && (
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//           <p className="text-sm text-blue-800">
//             <strong>Note:</strong> Fields marked with * are required. Phone
//             number should start with 0 and contain 10 digits.
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }

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
      // Phone: only digits, must start with 07, max 10 digits
      let digits = value.replace(/\D/g, "");
      if (!digits.startsWith("07")) digits = "07" + digits.slice(0, 8);
      else digits = digits.slice(0, 10);

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
      if (phone && !/^07\d{8}$/.test(phone)) {
        return toast.error("Phone must start with 07 and be 10 digits");
      }

      // Save to backend
      const res = await axios.put(
        `http://localhost:5000/api/users/${user._id}`,
        formData,
        getConfig()
      );

      setUser(res.data);
      setFormData({ ...res.data });
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
            placeholder="07xxxxxxxx"
            maxLength={10}
            className="border border-gray-300 rounded-lg px-4 py-3 disabled:bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">
            Must start with 07 and be 10 digits
          </p>
        </div>
      </div>
    </div>
  );
}
