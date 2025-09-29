// import { useState, useEffect } from "react";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { useNavigate } from "react-router-dom";
// import {
//   FaUser,
//   FaMapMarkerAlt,
//   FaCreditCard,
//   FaLock,
//   FaShoppingCart,
// } from "react-icons/fa";

// export default function UserProfile() {
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);
//   const [selectedSection, setSelectedSection] = useState("personal");
//   const [profilePic, setProfilePic] = useState(null);
//   const [orders, setOrders] = useState([]);
//   const [isEditing, setIsEditing] = useState(false);
//   const [formData, setFormData] = useState({});
//   const [securityData, setSecurityData] = useState({
//     oldPassword: "",
//     newPassword: "",
//     confirmPassword: "",
//   });
//   const [passwordStep, setPasswordStep] = useState(1);
//   const [passwordError, setPasswordError] = useState("");

//   const sections = [
//     { id: "personal", label: "Personal", icon: <FaUser /> },
//     { id: "address", label: "Address", icon: <FaMapMarkerAlt /> },
//     { id: "payment", label: "Payment", icon: <FaCreditCard /> },
//     { id: "security", label: "Security", icon: <FaLock /> },
//     { id: "orders", label: "Orders", icon: <FaShoppingCart /> },
//   ];

//   // Reusable configuration function
//   const getConfig = (extraHeaders = {}) => {
//     const token = localStorage.getItem("authToken");
//     const headers = token
//       ? { Authorization: `Bearer ${token}`, ...extraHeaders }
//       : { ...extraHeaders };
//     return { headers };
//   };

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const email = localStorage.getItem("userEmail");
//         if (!email) {
//           toast.error("User not logged in");
//           navigate("/signup");
//           return;
//         }

//         const res = await axios.get(
//           `http://localhost:5000/api/users/email/${email}`,
//           getConfig()
//         );
//         const u = res.data;
//         setUser(u);
//         setFormData({ ...u });
//         if (u.profileImage) setProfilePic(u.profileImage);

//         const ordersRes = await axios.get(
//           `http://localhost:5000/api/orders/user/${u._id}`,
//           getConfig()
//         );
//         setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
//       } catch (err) {
//         console.error("fetchUser error:", err);
//         toast.error("Failed to load profile or orders");
//       }
//     };
//     fetchUser();
//   }, [navigate]);

//   // Reusable format function
//   const formatDate = (d) => {
//     if (!d) return "-";
//     try {
//       return new Date(d).toLocaleDateString();
//     } catch {
//       return "-";
//     }
//   };

//   // Reusable order actions
//   const handleCancelOrder = async (orderId) => {
//     try {
//       await axios.put(
//         `http://localhost:5000/api/orders/${orderId}/cancel`,
//         {},
//         getConfig()
//       );
//       toast.success("Order cancelled successfully");
//       setOrders((prev) =>
//         prev.map((o) => (o._id === orderId ? { ...o, status: "Cancelled" } : o))
//       );
//     } catch (err) {
//       console.error("cancel order error:", err);
//       toast.error("Failed to cancel order");
//     }
//   };

//   const handleDeleteOrder = async (orderId) => {
//     if (
//       !window.confirm(
//         "Are you sure you want to delete this order? This action cannot be undone."
//       )
//     )
//       return;

//     try {
//       await axios.delete(
//         `http://localhost:5000/api/orders/${orderId}`,
//         getConfig()
//       );
//       toast.success("Order deleted successfully");
//       setOrders((prev) => prev.filter((o) => o._id !== orderId));
//     } catch (err) {
//       console.error("delete order error:", err);
//       toast.error("Failed to delete order");
//     }
//   };

//   // Reusable input handlers
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSecurityChange = (e) => {
//     const { name, value } = e.target;
//     setSecurityData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//     setPasswordError("");
//   };

//   // Reusable save function
//   const handleSaveChanges = async () => {
//     if (!user || !user._id) {
//       toast.error("No user to update");
//       return;
//     }

//     try {
//       const res = await axios.put(
//         `http://localhost:5000/api/users/${user._id}`,
//         formData,
//         getConfig()
//       );
//       setUser(res.data);
//       setFormData({ ...res.data });
//       setIsEditing(false);
//       toast.success("Profile updated successfully!");
//     } catch (error) {
//       console.error("save changes error:", error);
//       toast.error("Failed to update profile");
//     }
//   };

//   // Password verification
//   const verifyOldPassword = async () => {
//     if (!user || !user._id) {
//       toast.error("User ID not found");
//       return;
//     }

//     const oldPassword = securityData.oldPassword.trim();
//     if (!oldPassword) {
//       toast.error("Please enter your current password");
//       return;
//     }

//     try {
//       const verifyRes = await axios.post(
//         `http://localhost:5000/api/users/verify-password/${user._id}`,
//         { oldPassword },
//         getConfig()
//       );

//       if (verifyRes.data.success) {
//         setPasswordStep(2);
//         toast.success("Password verified!");
//       } else {
//         toast.error("Incorrect current password");
//       }
//     } catch (error) {
//       console.error("Verify password error:", error);
//       toast.error(error.response?.data?.message || "Failed to verify password");
//     }
//   };

//   // Password update
//   const handlePasswordUpdate = async () => {
//     const newPassword = securityData.newPassword.trim();
//     const confirmPassword = securityData.confirmPassword.trim();

//     if (!newPassword || !confirmPassword) {
//       setPasswordError("Both password fields are required");
//       toast.error("Both password fields are required");
//       return;
//     }

//     if (newPassword.length < 8) {
//       setPasswordError("New password must be at least 8 characters");
//       toast.error("New password must be at least 8 characters");
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       setPasswordError("New passwords don't match");
//       toast.error("New passwords don't match");
//       return;
//     }

//     if (!user || !user._id) {
//       setPasswordError("No user to update");
//       toast.error("No user to update");
//       return;
//     }

//     try {
//       const response = await axios.put(
//         `http://localhost:5000/api/users/change-password/${user._id}`,
//         { newPassword },
//         getConfig()
//       );

//       setSecurityData({
//         oldPassword: "",
//         newPassword: "",
//         confirmPassword: "",
//       });
//       setPasswordStep(1);
//       setPasswordError("");
//       toast.success("Password updated successfully!");
//     } catch (error) {
//       console.error("Password update error:", error);
//       const errorMessage =
//         error.response?.data?.message || "Failed to update password";
//       setPasswordError(errorMessage);
//       toast.error(errorMessage);
//     }
//   };

//   // Profile picture update
//   const handleProfilePicChange = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const fd = new FormData();
//     fd.append("profileImage", file);

//     try {
//       const res = await axios.put(
//         `http://localhost:5000/api/users/${user._id}/profile-image`,
//         fd,
//         getConfig({ "Content-Type": "multipart/form-data" })
//       );
//       if (res.data) {
//         if (res.data.profileImage) {
//           setProfilePic(res.data.profileImage);
//           if (res.data._id) setUser(res.data);
//         } else if (res.data.profileImageUrl) {
//           setProfilePic(res.data.profileImageUrl);
//         } else if (res.data._id) {
//           setUser(res.data);
//           setProfilePic(res.data.profileImage || profilePic);
//         }
//       }
//       toast.success("Profile picture updated!");
//     } catch (error) {
//       console.error("profile pic upload error:", error);
//       toast.error("Failed to update profile picture");
//     }
//   };

//   // Account actions
//   const handleLogout = () => {
//     localStorage.removeItem("userEmail");
//     localStorage.removeItem("authToken");
//     toast.success("Logged out successfully");
//     navigate("/");
//   };

//   const handleDeleteAccount = async () => {
//     if (
//       !window.confirm(
//         "Are you sure you want to delete your account? This action cannot be undone."
//       )
//     )
//       return;

//     if (!user || !user._id) {
//       toast.error("No user to delete");
//       return;
//     }

//     try {
//       await axios.delete(
//         `http://localhost:5000/api/users/${user._id}`,
//         getConfig()
//       );
//       localStorage.removeItem("userEmail");
//       localStorage.removeItem("authToken");
//       toast.success("Account deleted successfully");
//       navigate("/");
//     } catch (error) {
//       console.error("delete account error:", error);
//       toast.error("Failed to delete account");
//     }
//   };

//   // Reusable section change handler
//   const handleSectionChange = (sectionId) => {
//     setSelectedSection(sectionId);
//     setIsEditing(false);
//     if (sectionId === "security") {
//       setPasswordStep(1);
//       setSecurityData({
//         oldPassword: "",
//         newPassword: "",
//         confirmPassword: "",
//       });
//       setPasswordError("");
//     }
//   };

//   // Reusable input field component
//   const InputField = ({
//     label,
//     name,
//     value,
//     onChange,
//     disabled,
//     type = "text",
//     placeholder,
//     className = "",
//   }) => (
//     <div className="relative">
//       <label className="block text-sm font-medium text-[var(--color-secondary)] mb-1.5">
//         {label}
//       </label>
//       <input
//         type={type}
//         name={name}
//         value={value || ""}
//         onChange={onChange}
//         placeholder={placeholder}
//         disabled={disabled}
//         className={`border border-[var(--medium-gray)] rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-[var(--green-calm)] disabled:bg-[var(--medium-gray)] text-sm ${className}`}
//       />
//     </div>
//   );

//   // Reusable button component
//   const Button = ({
//     onClick,
//     children,
//     variant = "primary",
//     className = "",
//   }) => {
//     const baseClasses = "px-4 py-2 rounded-xl text-sm transition-all";
//     const variants = {
//       primary: "bg-[var(--green-calm)] text-white hover:bg-green-600",
//       secondary: "bg-[var(--medium-gray)] text-white hover:bg-gray-600",
//       danger: "bg-[var(--accent-red)] text-white hover:bg-red-600",
//     };

//     return (
//       <button
//         onClick={onClick}
//         className={`${baseClasses} ${variants[variant]} ${className}`}
//       >
//         {children}
//       </button>
//     );
//   };

//   // Section content components
//   const PersonalSection = () => (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-[var(--color-secondary)]">
//           Personal Information
//         </h2>
//         {!isEditing ? (
//           <Button onClick={() => setIsEditing(true)}>Edit</Button>
//         ) : (
//           <div className="flex space-x-3">
//             <Button
//               variant="secondary"
//               onClick={() => {
//                 setIsEditing(false);
//                 setFormData({ ...user });
//               }}
//             >
//               Cancel
//             </Button>
//             <Button onClick={handleSaveChanges}>Save</Button>
//           </div>
//         )}
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <InputField
//           label="First Name"
//           name="firstname"
//           value={formData.firstname}
//           onChange={handleInputChange}
//           disabled={!isEditing}
//           placeholder="First Name"
//         />
//         <InputField
//           label="Last Name"
//           name="lastname"
//           value={formData.lastname}
//           onChange={handleInputChange}
//           disabled={!isEditing}
//           placeholder="Last Name"
//         />
//         <InputField
//           label="Email"
//           name="email"
//           type="email"
//           value={formData.email}
//           onChange={handleInputChange}
//           disabled={!isEditing}
//           placeholder="Email"
//         />
//         <InputField
//           label="Phone"
//           name="phone"
//           value={formData.phone || ""}
//           onChange={(e) => {
//             let value = e.target.value.replace(/\D/g, ""); // remove non-digits
//             if (value.length > 9) value = value.slice(0, 9); // max 9 digits
//             if (!value.startsWith("0")) value = "0" + value.replace(/^0+/, ""); // force start with 0
//             setFormData((prev) => ({
//               ...prev,
//               phone: value,
//             }));
//           }}
//           disabled={!isEditing}
//           placeholder="Phone (e.g., 0887736373)"
//         />
//       </div>
//     </div>
//   );

//   const AddressSection = () => (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-[var(--color-secondary)]">
//           Shipping Address
//         </h2>
//         {!isEditing ? (
//           <Button onClick={() => setIsEditing(true)}>Edit</Button>
//         ) : (
//           <div className="flex space-x-3">
//             <Button
//               variant="secondary"
//               onClick={() => {
//                 setIsEditing(false);
//                 setFormData({ ...user });
//               }}
//             >
//               Cancel
//             </Button>
//             <Button onClick={handleSaveChanges}>Save</Button>
//           </div>
//         )}
//       </div>
//       <InputField
//         label="Street Address"
//         name="address"
//         value={formData.address}
//         onChange={handleInputChange}
//         disabled={!isEditing}
//         placeholder="Street Address"
//       />
//       <div className="grid grid-cols-2 gap-4">
//         <InputField
//           label="City"
//           name="city"
//           value={formData.city}
//           onChange={handleInputChange}
//           disabled={!isEditing}
//           placeholder="City"
//         />
//         <InputField
//           label="State"
//           name="state"
//           value={formData.state}
//           onChange={handleInputChange}
//           disabled={!isEditing}
//           placeholder="State"
//         />
//       </div>
//       <InputField
//         label="ZIP Code"
//         name="zip"
//         value={formData.zip}
//         onChange={handleInputChange}
//         disabled={!isEditing}
//         placeholder="ZIP Code"
//       />
//     </div>
//   );

//   const PaymentSection = () => (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-[var(--color-secondary)]">
//           Payment Details
//         </h2>
//         {!isEditing ? (
//           <Button onClick={() => setIsEditing(true)}>Edit</Button>
//         ) : (
//           <div className="flex space-x-3">
//             <Button
//               variant="secondary"
//               onClick={() => {
//                 setIsEditing(false);
//                 setFormData({ ...user });
//               }}
//             >
//               Cancel
//             </Button>
//             <Button onClick={handleSaveChanges}>Save</Button>
//           </div>
//         )}
//       </div>
//       <InputField
//         label="Cardholder Name"
//         name="cardName"
//         value={formData.cardName}
//         onChange={handleInputChange}
//         disabled={!isEditing}
//         placeholder="Cardholder Name"
//       />
//       <InputField
//         label="Card Number"
//         name="cardNumber"
//         value={formData.cardNumber}
//         onChange={handleInputChange}
//         disabled={!isEditing}
//         placeholder="Card Number"
//       />
//       <div className="grid grid-cols-2 gap-4">
//         <InputField
//           label="Expiry Date"
//           name="expiry"
//           value={formData.expiry}
//           onChange={handleInputChange}
//           disabled={!isEditing}
//           placeholder="MM/YY"
//         />
//         <InputField
//           label="CVV"
//           name="cvv"
//           value={formData.cvv}
//           onChange={handleInputChange}
//           disabled={!isEditing}
//           placeholder="CVV"
//         />
//       </div>
//     </div>
//   );

//   const SecuritySection = () => (
//     <div className="space-y-6">
//       <h2 className="text-2xl font-bold text-[var(--color-secondary)]">
//         Password & Security
//       </h2>
//       {passwordStep === 1 ? (
//         <>
//           <p className="text-[var(--color-secondary)] text-sm">
//             For security reasons, please verify your current password first.
//           </p>
//           <div className="space-y-4 max-w-md">
//             <InputField
//               label="Current Password"
//               name="oldPassword"
//               type="password"
//               value={securityData.oldPassword}
//               onChange={handleSecurityChange}
//               placeholder="Current Password"
//             />
//             <Button onClick={verifyOldPassword}>Verify Password</Button>
//           </div>
//         </>
//       ) : (
//         <>
//           <p className="text-[var(--color-secondary)] text-sm">
//             Now enter your new password.
//           </p>
//           <div className="space-y-4 max-w-md">
//             <InputField
//               label="New Password"
//               name="newPassword"
//               type="password"
//               value={securityData.newPassword}
//               onChange={handleSecurityChange}
//               placeholder="New Password"
//             />
//             <InputField
//               label="Confirm New Password"
//               name="confirmPassword"
//               type="password"
//               value={securityData.confirmPassword}
//               onChange={handleSecurityChange}
//               placeholder="Confirm New Password"
//             />
//             {passwordError && (
//               <p className="text-[var(--accent-red)] text-sm">
//                 {passwordError}
//               </p>
//             )}
//             <div className="flex space-x-3">
//               <Button variant="secondary" onClick={() => setPasswordStep(1)}>
//                 ↩ Back
//               </Button>
//               <Button onClick={handlePasswordUpdate}>Update Password</Button>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );

//   const OrdersSection = () => (
//     <div className="space-y-6">
//       <h2 className="text-2xl font-bold text-[var(--color-secondary)]">
//         Order History
//       </h2>
//       {orders.length === 0 ? (
//         <div className="text-center py-8">
//           <p className="text-[var(--color-secondary)] text-sm">
//             No orders found.
//           </p>
//           <p className="text-[var(--color-secondary)] mt-2 text-sm">
//             Start shopping to see your orders here!
//           </p>
//         </div>
//       ) : (
//         <div className="overflow-x-auto rounded-[20px] border border-[var(--medium-gray)]">
//           <table className="w-full text-sm">
//             <thead className="bg-[var(--color-sec-2)] text-[var(--color-secondary)]">
//               <tr>
//                 <th className="px-6 py-3 text-left font-bold">Order ID</th>
//                 <th className="px-6 py-3 text-left font-bold">Date</th>
//                 <th className="px-6 py-3 text-left font-bold">Status</th>
//                 <th className="px-6 py-3 text-left font-bold">Amount</th>
//                 <th className="px-6 py-3 text-center font-bold">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {orders.map((order, index) => (
//                 <tr
//                   key={order._id || index}
//                   className={
//                     index % 2 === 0
//                       ? "bg-[var(--color-sec-2)]"
//                       : "bg-[var(--light-gray)]"
//                   }
//                 >
//                   <td className="px-6 py-3 border-t border-[var(--medium-gray)]">
//                     <span className="font-medium">
//                       #
//                       {order._id
//                         ? order._id.slice(-8).toUpperCase()
//                         : String(index + 1)}
//                     </span>
//                   </td>
//                   <td className="px-6 py-3 border-t border-[var(--medium-gray)]">
//                     {formatDate(order.date)}
//                   </td>
//                   <td className="px-6 py-3 border-t border-[var(--medium-gray)]">
//                     <span
//                       className={`px-3 py-1 rounded-full text-sm font-medium text-white ${
//                         order.status === "Delivered"
//                           ? "bg-[var(--accent-green)]"
//                           : order.status === "Shipped"
//                           ? "bg-[var(--accent-blue)]"
//                           : order.status === "Cancelled"
//                           ? "bg-[var(--accent-red)]"
//                           : "bg-[var(--earth-orange)]"
//                       }`}
//                     >
//                       {order.status || "Unknown"}
//                     </span>
//                   </td>
//                   <td className="px-6 py-3 border-t border-[var(--medium-gray)] font-medium">
//                     Rs. {order.total?.toFixed(2) ?? "0.00"}
//                   </td>
//                   <td className="px-6 py-3 border-t border-[var(--medium-gray)] text-center">
//                     <div className="flex justify-center space-x-2">
//                       {order.status !== "Delivered" &&
//                       order.status !== "Cancelled" ? (
//                         <Button
//                           variant="danger"
//                           onClick={() => handleCancelOrder(order._id)}
//                           className="px-3 py-1.5 text-sm"
//                         >
//                           Cancel
//                         </Button>
//                       ) : null}
//                       <Button
//                         variant="secondary"
//                         onClick={() => handleDeleteOrder(order._id)}
//                         className="px-3 py-1.5 text-sm"
//                       >
//                         🗑️
//                       </Button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );

//   // Main render section
//   const renderSectionContent = () => {
//     switch (selectedSection) {
//       case "personal":
//         return <PersonalSection />;
//       case "address":
//         return <AddressSection />;
//       case "payment":
//         return <PaymentSection />;
//       case "security":
//         return <SecuritySection />;
//       case "orders":
//         return <OrdersSection />;
//       default:
//         return <PersonalSection />;
//     }
//   };

//   return (
//     <div className="min-h-screen w-full bg-[var(--color-primary)] flex items-center justify-center p-6">
//       {/* Main Container */}
//       <div className="max-w-5xl w-full bg-[var(--color-sec-2)] rounded-[24px] overflow-hidden border border-[var(--medium-gray)]">
//         {/* Top Banner with Profile Pic - UPDATED WITH BACKGROUND IMAGE */}
//         <div
//           className="w-full h-48 flex items-center justify-between px-8 relative bg-[var(--color-secondary)]"
//           style={{
//             backgroundImage: "url('1122.jpeg')",
//             backgroundSize: "cover",
//             backgroundPosition: "center",
//             backgroundRepeat: "no-repeat",
//           }}
//         >
//           <div className="flex items-center">
//             <div className="relative group">
//               <img
//                 src={
//                   profilePic ||
//                   "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//                 }
//                 alt="Profile"
//                 className="w-24 h-24 rounded-full border-4 border-[var(--color-sec-2)]"
//               />
//               <label
//                 htmlFor="profilePic"
//                 className="absolute bottom-0 right-0 bg-[var(--green-calm)] text-white p-2 rounded-full cursor-pointer"
//               >
//                 📷
//                 <input
//                   type="file"
//                   id="profilePic"
//                   className="hidden"
//                   accept="image/*"
//                   onChange={handleProfilePicChange}
//                 />
//               </label>
//             </div>
//             <div className="ml-6 text-white">
//               <h1 className="text-xl font-bold">
//                 {user?.firstname} {user?.lastname}
//               </h1>
//               <p className="text-[var(--color-sec-2)] opacity-90 text-sm">
//                 {user?.email}
//               </p>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex space-x-4">
//             <Button onClick={handleLogout}>Logout</Button>
//             <Button variant="danger" onClick={handleDeleteAccount}>
//               Delete Account
//             </Button>
//           </div>
//         </div>

//         {/* Bottom Section (Sidebar + Content) */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-6 pb-6 pt-8">
//           {/* Sidebar */}
//           <aside className="md:col-span-1 bg-[var(--color-sec-2)] rounded-[20px] p-4 border border-[var(--medium-gray)]">
//             <h2 className="text-lg font-bold text-[var(--color-secondary)] mb-4">
//               Menu
//             </h2>
//             <ul className="space-y-3">
//               {sections.map((section) => (
//                 <li key={section.id}>
//                   <button
//                     onClick={() => handleSectionChange(section.id)}
//                     className={`w-full text-left px-4 py-2.5 rounded-xl transition-all flex items-center text-sm ${
//                       selectedSection === section.id
//                         ? "bg-[var(--green-calm)] text-white font-semibold"
//                         : "hover:bg-[var(--medium-gray)] text-[var(--color-secondary)]"
//                     }`}
//                   >
//                     <span className="mr-3">{section.icon}</span>
//                     {section.label}
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           </aside>

//           {/* Main Content */}
//           <main className="md:col-span-3 bg-[var(--color-sec-2)] rounded-[20px] p-6 border border-[var(--medium-gray)]">
//             {!user ? (
//               <p className="text-center text-[var(--color-secondary)] text-sm">
//                 Loading...
//               </p>
//             ) : (
//               renderSectionContent()
//             )}
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// }
