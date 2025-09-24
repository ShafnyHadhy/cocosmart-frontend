// // import { useState } from "react";
// // import axios from "axios";
// // import toast from "react-hot-toast";

// // export default function Security({ user }) {
// //   const [step, setStep] = useState(1); // 1 = verify old password, 2 = set new password
// //   const [formData, setFormData] = useState({
// //     oldPassword: "",
// //     newPassword: "",
// //     confirmPassword: "",
// //   });
// //   const [loading, setLoading] = useState(false);

// //   const token = localStorage.getItem("authToken");

// //   const getConfig = () => ({
// //     headers: token ? { Authorization: `Bearer ${token}` } : {},
// //   });

// //   const handleChange = (e) =>
// //     setFormData({ ...formData, [e.target.name]: e.target.value });

// //   // Step 1: Verify old password
// //   const handleVerifyOldPassword = async () => {
// //     if (!formData.oldPassword) {
// //       toast.error("Please enter your current password");
// //       return;
// //     }

// //     try {
// //       setLoading(true);

// //       // Backend expects `oldPassword` in the body (based on your backend code)
// //       const res = await axios.post(
// //         `http://localhost:5000/api/users/verify-password/${user._id}`,
// //         { oldPassword: formData.oldPassword },
// //         getConfig()
// //       );

// //       // backend may return { success: true } (your code) or { valid: true } in other implementations.
// //       const verified = res?.data?.success === true || res?.data?.valid === true;

// //       if (verified) {
// //         toast.success("Old password verified ");
// //         setStep(2);
// //       } else {
// //         // if backend provides a message, show it; otherwise generic
// //         const msg =
// //           res?.data?.message || res?.data?.error || "Old password is incorrect";
// //         toast.error(msg);
// //       }
// //     } catch (err) {
// //       console.error("Verify error:", err);
// //       const remoteMsg =
// //         err.response?.data?.message || err.response?.data?.error;
// //       toast.error(
// //         remoteMsg || "Failed to verify password (network/server error)"
// //       );
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // Step 2: Change to new password
// //   const handleChangePassword = async () => {
// //     const { newPassword, confirmPassword } = formData;

// //     if (!newPassword || !confirmPassword) {
// //       toast.error("Please fill in all fields");
// //       return;
// //     }

// //     // Password strength validation
// //     const strongPassword =
// //       /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
// //     if (!strongPassword.test(newPassword)) {
// //       toast.error(
// //         "Password must be at least 8 characters and include uppercase, lowercase, a number and a special character"
// //       );
// //       return;
// //     }

// //     if (newPassword !== confirmPassword) {
// //       toast.error("New password and confirm password do not match");
// //       return;
// //     }

// //     try {
// //       setLoading(true);
// //       await axios.put(
// //         `http://localhost:5000/api/users/change-password/${user._id}`,
// //         { newPassword },
// //         getConfig()
// //       );
// //       toast.success("Password changed successfully 🎉");
// //       setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
// //       setStep(1); // reset to first step
// //     } catch (err) {
// //       console.error("Change-password error:", err);
// //       const remoteMsg =
// //         err.response?.data?.message || err.response?.data?.error;
// //       toast.error(remoteMsg || "Failed to update password");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="space-y-6">
// //       <div className="flex justify-between items-center">
// //         <h2 className="text-2xl font-bold text-gray-800">Security Settings</h2>
// //       </div>

// //       {step === 1 ? (
// //         // Step 1: Verify old password
// //         <div className="space-y-6">
// //           <div className="flex flex-col">
// //             <label className="text-sm font-medium text-gray-700 mb-2">
// //               Current Password *
// //             </label>
// //             <input
// //               type="password"
// //               name="oldPassword"
// //               value={formData.oldPassword}
// //               onChange={handleChange}
// //               placeholder="Enter your current password"
// //               className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
// //             />
// //           </div>
// //           <button
// //             disabled={loading}
// //             onClick={handleVerifyOldPassword}
// //             className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2.5 rounded-lg font-medium"
// //           >
// //             {loading ? "Verifying..." : "Verify Password"}
// //           </button>
// //         </div>
// //       ) : (
// //         // Step 2: Enter new password
// //         <div className="space-y-6">
// //           <div className="flex flex-col">
// //             <label className="text-sm font-medium text-gray-700 mb-2">
// //               New Password *
// //             </label>
// //             <input
// //               type="password"
// //               name="newPassword"
// //               value={formData.newPassword}
// //               onChange={handleChange}
// //               placeholder="Enter a strong password"
// //               className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
// //             />
// //             <p className="text-xs text-gray-500 mt-1">
// //               Must be 8+ characters, include uppercase, lowercase, number, and
// //               special character.
// //             </p>
// //           </div>

// //           <div className="flex flex-col">
// //             <label className="text-sm font-medium text-gray-700 mb-2">
// //               Confirm New Password *
// //             </label>
// //             <input
// //               type="password"
// //               name="confirmPassword"
// //               value={formData.confirmPassword}
// //               onChange={handleChange}
// //               placeholder="Re-enter your new password"
// //               className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
// //             />
// //           </div>

// //           <div className="flex space-x-3">
// //             <button
// //               onClick={() => setStep(1)}
// //               className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2.5 rounded-lg font-medium"
// //             >
// //               Back
// //             </button>
// //             <button
// //               disabled={loading}
// //               onClick={handleChangePassword}
// //               className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2.5 rounded-lg font-medium"
// //             >
// //               {loading ? "Updating..." : "Change Password"}
// //             </button>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// import { useState } from "react";
// import axios from "axios";
// import toast from "react-hot-toast";

// export default function Security({ user }) {
//   const [step, setStep] = useState(1); // 1 = verify old password, 2 = set new password
//   const [formData, setFormData] = useState({
//     oldPassword: "",
//     newPassword: "",
//     confirmPassword: "",
//   });
//   const [loading, setLoading] = useState(false);

//   const token = localStorage.getItem("authToken");

//   const getConfig = () => ({
//     headers: token ? { Authorization: `Bearer ${token}` } : {},
//   });

//   const handleChange = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   // Step 1: Verify old password
//   const handleVerifyOldPassword = async () => {
//     if (!formData.oldPassword) {
//       toast.error("Please enter your current password");
//       return;
//     }

//     try {
//       setLoading(true);
//       const res = await axios.post(
//         `http://localhost:5000/api/users/verify-password/${user._id}`,
//         { oldPassword: formData.oldPassword },
//         getConfig()
//       );

//       if (res?.data?.success) {
//         toast.success("Old password verified ✅");
//         setStep(2);
//       } else {
//         toast.error("Old password is incorrect ❌");
//       }
//     } catch (err) {
//       console.error("Verify error:", err);
//       toast.error("Failed to verify old password");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Step 2: Change to new password
//   const handleChangePassword = async () => {
//     const { newPassword, confirmPassword } = formData;

//     if (!newPassword || !confirmPassword) {
//       toast.error("Please fill in all fields");
//       return;
//     }

//     // Strong password check
//     const strongPassword =
//       /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
//     if (!strongPassword.test(newPassword)) {
//       toast.error(
//         "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character"
//       );
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       toast.error("New password and confirm password do not match");
//       return;
//     }

//     try {
//       setLoading(true);
//       await axios.put(
//         `http://localhost:5000/api/users/change-password/${user._id}`,
//         { newPassword },
//         getConfig()
//       );
//       toast.success("Password changed successfully 🎉");
//       setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
//       setStep(1);
//     } catch (err) {
//       console.error("Change-password error:", err);
//       toast.error("Failed to update password");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <h2 className="text-2xl font-bold text-gray-800">Security Settings</h2>

//       {step === 1 ? (
//         // Step 1: Verify old password
//         <div className="space-y-6">
//           <div className="flex flex-col">
//             <label className="text-sm font-medium text-gray-700 mb-2">
//               Current Password *
//             </label>
//             <input
//               type="password"
//               name="oldPassword"
//               value={formData.oldPassword}
//               onChange={handleChange}
//               placeholder="Enter your current password"
//               className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
//             />
//           </div>
//           <button
//             disabled={loading}
//             onClick={handleVerifyOldPassword}
//             className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2.5 rounded-lg font-medium"
//           >
//             {loading ? "Verifying..." : "Verify Password"}
//           </button>
//         </div>
//       ) : (
//         // Step 2: Enter new password
//         <div className="space-y-6">
//           <div className="flex flex-col">
//             <label className="text-sm font-medium text-gray-700 mb-2">
//               New Password *
//             </label>
//             <input
//               type="password"
//               name="newPassword"
//               value={formData.newPassword}
//               onChange={handleChange}
//               placeholder="Enter a strong password"
//               className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
//             />
//             <p className="text-xs text-gray-500 mt-1">
//               Must be 8+ characters, include uppercase, lowercase, number, and
//               special character.
//             </p>
//           </div>

//           <div className="flex flex-col">
//             <label className="text-sm font-medium text-gray-700 mb-2">
//               Confirm New Password *
//             </label>
//             <input
//               type="password"
//               name="confirmPassword"
//               value={formData.confirmPassword}
//               onChange={handleChange}
//               placeholder="Re-enter your new password"
//               className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
//             />
//           </div>

//           <div className="flex space-x-3">
//             <button
//               onClick={() => setStep(1)}
//               className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2.5 rounded-lg font-medium"
//             >
//               Back
//             </button>
//             <button
//               disabled={loading}
//               onClick={handleChangePassword}
//               className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2.5 rounded-lg font-medium"
//             >
//               {loading ? "Updating..." : "Change Password"}
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function Security({ user }) {
  const [step, setStep] = useState(1); // 1 = verify old password, 2 = set new password
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("authToken");
  const getConfig = () => ({
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Step 1: Verify old password
  const handleVerifyOldPassword = async () => {
    if (!formData.oldPassword) {
      toast.error("Please enter your current password");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `http://localhost:5000/api/users/verify-password/${user._id}`,
        { oldPassword: formData.oldPassword },
        getConfig()
      );

      if (res?.data?.success) {
        toast.success("Old password verified ✅");
        setStep(2);
      } else {
        toast.error("Old password is incorrect ❌");
      }
    } catch (err) {
      console.error("Verify error:", err);
      toast.error("Failed to verify old password");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Change password
  const handleChangePassword = async () => {
    const { newPassword, confirmPassword } = formData;

    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    try {
      setLoading(true);
      await axios.put(
        `http://localhost:5000/api/users/change-password/${user._id}`,
        { newPassword },
        getConfig()
      );
      toast.success("Password changed successfully 🎉");
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setStep(1); // back to verify step
    } catch (err) {
      console.error("Change-password error:", err);
      const remoteMsg =
        err.response?.data?.message || "Failed to update password";
      toast.error(remoteMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Security Settings</h2>

      {step === 1 ? (
        // Step 1: Verify old password
        <div className="space-y-6">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Current Password *
            </label>
            <input
              type="password"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              placeholder="Enter your current password"
              className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            disabled={loading}
            onClick={handleVerifyOldPassword}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2.5 rounded-lg font-medium"
          >
            {loading ? "Verifying..." : "Verify Password"}
          </button>
        </div>
      ) : (
        // Step 2: Enter new password
        <div className="space-y-6">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              New Password *
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter your new password"
              className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 8 characters long
            </p>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Confirm New Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your new password"
              className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setStep(1)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2.5 rounded-lg font-medium"
            >
              Back
            </button>

            <button
              disabled={loading}
              onClick={handleChangePassword}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2.5 rounded-lg font-medium"
            >
              {loading ? "Updating..." : "Change Password"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
