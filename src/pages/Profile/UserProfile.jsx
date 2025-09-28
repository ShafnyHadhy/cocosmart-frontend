import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaPowerOff } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";

// Import subcomponents
import Personal from "./Personal";
import Address from "./Address";
import Payment from "./Payment";
import Security from "./Security";
import Orders from "./Orders";

export default function UserProfile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedSection, setSelectedSection] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [profilePic, setProfilePic] = useState(null);

  //  Make sure all code uses the same token key ("authToken")
  const token = localStorage.getItem("authToken");

  const getConfig = (extraHeaders = {}) => ({
    headers: token ? { Authorization: `Bearer ${token}`, ...extraHeaders } : {},
  });

  // Fetch user profile + orders
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const email = localStorage.getItem("userEmail");
        if (!email) {
          toast.error("User not logged in");
          navigate("/signup");
          return;
        }

        // Fetch user by email
        const res = await axios.get(
          `http://localhost:5000/api/users/email/${email}`,
          getConfig()
        );
        const u = res.data;
        setUser(u);
        setFormData({ ...u });
        if (u.profileImage) setProfilePic(u.profileImage);

        // Fetch orders for this specific user
        const ordersRes = await axios.get(
          `http://localhost:5000/api/orders/user/${u._id}`,
          getConfig()
        );
        setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile or orders");
      }
    };
    fetchUser();
  }, [navigate]);

  // Profile picture upload handler
  const handleProfilePicChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?._id) return;

    try {
      const fd = new FormData();
      fd.append("profileImage", file);

      const res = await axios.put(
        `http://localhost:5000/api/users/${user._id}/profile-image`,
        fd,
        getConfig({ "Content-Type": "multipart/form-data" })
      );

      setProfilePic(res.data.profileImage || profilePic);
      setUser(res.data);
      toast.success("Profile picture updated!");
    } catch {
      toast.error("Failed to update profile picture");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("authToken");
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account?"))
      return;
    if (!user?._id) return toast.error("No user to delete");

    try {
      await axios.delete(
        `http://localhost:5000/api/users/${user._id}`,
        getConfig()
      );
      localStorage.removeItem("userEmail");
      localStorage.removeItem("authToken");
      toast.success("Account deleted successfully");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete account");
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen text-lg text-gray-700">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[var(--color-primary)] flex items-center justify-center p-8">
      {/* Main Container */}
      <div className="max-w-5xl w-full bg-[var(--color-sec-2)] rounded-[24px] overflow-hidden border border-[var(--medium-gray)]">
        {/* Top Banner with Background + Profile Pic */}
        <div
          className="w-full h-48 flex items-center justify-between px-8 relative bg-[var(--color-secondary)]"
          style={{
            backgroundImage: "url('1122.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="flex items-center">
            <div className="relative group">
              <img
                src={
                  profilePic ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-[var(--color-sec-2)]"
              />
              <label
                htmlFor="profilePic"
                className="absolute bottom-0 right-0 bg-white text-white p-2 rounded-full cursor-pointer"
              >
                📷
                <input
                  type="file"
                  id="profilePic"
                  className="hidden"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                />
              </label>
            </div>
            <div className="ml-6 text-green-900">
              <h1 className="text-4xl font-bold">
                {user?.firstname} {user?.lastname}
              </h1>
            </div>
          </div>

          <div className="flex space-x-4">
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 hover:scale-110 transition"
              title="Logout"
            >
              <FaPowerOff className="text-xl" /> {/* bigger icon */}
            </button>

            {/* Deactivate / Delete Account Button */}
            <button
              onClick={handleDeleteAccount}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-400 text-black hover:bg-gray-700 hover:scale-110 transition"
              title="Deactivate Account"
            >
              <RiDeleteBin5Line className="text-xl" />{" "}
              {/* same size as logout icon */}
            </button>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-6 pb-6 pt-8">
          {/* Sidebar */}
          <aside className="md:col-span-1 bg-[var(--color-sec-2)] rounded-[20px] p-4 border border-[var(--medium-gray)]">
            <h2 className="text-lg font-bold text-[var(--color-secondary)] mb-4">
              Menu
            </h2>
            <ul className="space-y-3">
              {[
                { id: "personal", label: "Personal" },
                { id: "address", label: "Address" },
                { id: "payment", label: "Payment" },
                { id: "security", label: "Security" },
                { id: "orders", label: "Orders" },
              ].map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => {
                      setSelectedSection(section.id);
                      setIsEditing(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl transition-all text-sm ${
                      selectedSection === section.id
                        ? "bg-[var(--green-calm)] text-white font-semibold"
                        : "hover:bg-[var(--medium-gray)] text-[var(--color-secondary)]"
                    }`}
                  >
                    {section.label}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Main Content */}
          <main className="md:col-span-3 bg-[var(--color-sec-2)] rounded-[20px] p-6 border border-[var(--medium-gray)]">
            {selectedSection === "personal" && (
              <Personal
                user={user}
                setUser={setUser}
                formData={formData}
                setFormData={setFormData}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
              />
            )}
            {selectedSection === "address" && (
              <Address
                user={user}
                setUser={setUser}
                formData={formData}
                setFormData={setFormData}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
              />
            )}
            {selectedSection === "payment" && (
              <Payment
                user={user}
                setUser={setUser}
                formData={formData}
                setFormData={setFormData}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
              />
            )}
            {selectedSection === "security" && <Security user={user} />}
            {selectedSection === "orders" && (
              <Orders user={user} orders={orders} setOrders={setOrders} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
