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
      <div className="w-full flex justify-end gap-2 mb-2">
        <button
          className="flex items-center gap-1 px-3 py-1 bg-blue-800 text-white rounded hover:bg-blue-600"
          onClick={() => setShowSearchFields(!showSearchFields)}
        >
          <FaSearch /> Search
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
                    </select>
                  ) : (
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-red-100 text-red-800"
                          : user.role === "worker"
                          ? "bg-yellow-100 text-yellow-800"
                          : user.role === "Pro.Staff"
                          ? "bg-blue-100 text-blue-800"
                          : user.role === "HRM"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
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
                          className="cursor-pointer hover:text-green-600 transition-colors"
                          onClick={() => handleEditClick(user)}
                        />
                        <TfiTrash
                          className="cursor-pointer hover:text-red-600 transition-colors"
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
