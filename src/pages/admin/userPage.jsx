import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaRegEdit, FaSearch } from "react-icons/fa";
import { TfiTrash } from "react-icons/tfi";

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editRole, setEditRole] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [showSearchFields, setShowSearchFields] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchRole, setSearchRole] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`);
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    }
  };

  const handleEditClick = (user) => {
    setEditingId(user._id);
    setEditRole(user.role);
    setDeletingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditRole("");
  };

  const handleSaveEdit = async (id) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${id}`, {
        role: editRole,
      });
      toast.success("User role updated successfully");
      setEditingId(null);
      fetchUsers();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    }
  };

  const confirmDelete = (id) => {
    setDeletingId(id);
    setEditingId(null);
  };

  const cancelDelete = () => setDeletingId(null);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/${id}`);
      toast.success("User deleted successfully");
      setDeletingId(null);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const formatRoleName = (role) => {
    if (!role) return "";
    if (role === "Pro.Staff") return "Pro Staff";
    return role
      .split(".")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  // Filter users by search fields
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
    const email = user.email.toLowerCase();
    const phone = user.phone.toLowerCase();
    const date = new Date(user.createdAt).toLocaleDateString().toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchText =
      fullName.includes(query) ||
      email.includes(query) ||
      phone.includes(query) ||
      date.includes(query);

    const matchRole = searchRole ? user.role === searchRole : true;

    return matchText && matchRole;
  });

  return (
    <div className="h-full w-full p-6 bg-sec-2">
      {/* Top Action Buttons (Search + Add User) */}
      <div className="w-full flex justify-end gap-3 mb-4">
        {/* Search Button */}
        <button
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-black hover:bg-gray-300 hover:scale-110 transition"
          onClick={() => setShowSearchFields(!showSearchFields)}
          title="Search Users"
        >
          <FaSearch size={20} />
        </button>
      </div>

      {showSearchFields && (
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search by name, email, phone, date"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border px-2 py-1 rounded w-full"
          />
          <select
            value={searchRole}
            onChange={(e) => setSearchRole(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">All Roles</option>
            <option value="user">User</option> {/* Fixed value */}
            <option value="admin">Admin</option>
            <option value="worker">Worker</option>
            <option value="Pro.Staff">Pro Staff</option>
            <option value="HRM">HRM</option>
            <option value="Inventory">Inventory</option>
          </select>
        </div>
      )}

      <div className="overflow-x-auto shadow-lg rounded-2xl bg-white">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-accent text-white text-end">
            <tr>
              <th className="py-3 px-4 text-left rounded-tl-2xl">Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Phone</th>
              <th className="py-3 px-4 text-left">Role</th>
              <th className="py-3 px-4 text-left">Registered Date</th>
              <th className="py-3 px-4 text-center rounded-tr-2xl">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, idx) => (
              <tr
                key={user._id}
                className={`border-b hover:bg-gray-50 transition-colors ${
                  idx % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                }`}
              >
                <td className="py-3 px-4 text-left">{`${user.firstname} ${user.lastname}`}</td>
                <td className="py-3 px-4 text-left">{user.email}</td>
                <td className="py-3 px-4 text-left">{user.phone}</td>
                <td className="py-3 px-4 text-left">
                  {editingId === user._id ? (
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="border px-2 py-1 rounded w-full"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="worker">Worker</option>
                      <option value="Pro.Staff">Pro Staff</option>
                      <option value="HRM">HRM</option>
                      <option value="Inventory">Inventory</option>
                    </select>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-red-100 text-red-800 px-6 py-1 rounded-full font-semibold"
                          : user.role === "worker"
                          ? "bg-yellow-100 text-yellow-800 px-5.5 py-1 rounded-full font-semibold"
                          : user.role === "Pro.Staff"
                          ? "bg-blue-100 text-blue-800 px-4.5 py-1 rounded-full font-semibold"
                          : user.role === "Inventory"
                          ? "bg-purple-200 text-purple-900 px-4.5 py-1.5 rounded-full font-semibold"
                          : user.role === "HRM"
                          ? "bg-green-200 text-green-800 px-7.5 py-1 rounded-full font-semibold"
                          : "bg-gray-200 text-gray-800 px-7.5 py-1 rounded-full font-semibold"
                      }`}
                    >
                      {formatRoleName(user.role)}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-left">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-row gap-4 justify-center items-center text-lg">
                    {editingId === user._id ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(user._id)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                        >
                          Cancel
                        </button>
                      </>
                    ) : deletingId === user._id ? (
                      <div className="flex flex-col items-center gap-2 bg-gray-100 p-2 rounded-lg">
                        <p className="text-xs text-center">Delete user?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                          >
                            Yes
                          </button>
                          <button
                            onClick={cancelDelete}
                            className="bg-gray-400 text-white px-2 py-1 rounded text-xs hover:bg-gray-500"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <FaRegEdit
                          title="Edit User" //
                          className="cursor-pointer text-[#5c4033] text-xl transition-transform duration-200 hover:text-[#5c4033]-600 hover:scale-125"
                          onClick={() => handleEditClick(user)}
                        />
                        <TfiTrash
                          title="Delete User" //
                          className="cursor-pointer text-red-600 hover:text-red-900 transition-transform duration-200 text-xl hover:scale-125"
                          onClick={() => confirmDelete(user._id)}
                        />
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserPage;
