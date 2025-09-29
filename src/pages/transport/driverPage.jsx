import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { CiCirclePlus } from "react-icons/ci";
import { FaRegEdit, FaSearch } from "react-icons/fa";
import { TfiTrash } from "react-icons/tfi";

const DriverPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    licenseNumber: "",
    phone: "",
    address: "",
    email: "",
  });
  const [deletingId, setDeletingId] = useState(null);
  const [emailError, setEmailError] = useState("");

  const [showSearchFields, setShowSearchFields] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchStatus, setSearchStatus] = useState("");

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/drivers`
      );
      setDrivers(res.data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast.error("Failed to fetch drivers");
    }
  };

  const handleEditClick = (driver) => {
    setEditingId(driver._id);
    setEditData({
      name: driver.name,
      licenseNumber: driver.licenseNumber,
      phone: driver.phone,
      address: driver.address || "",
      email: driver.email || "",
    });
    setEmailError("");
    setDeletingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({
      name: "",
      licenseNumber: "",
      phone: "",
      address: "",
      email: "",
    });
    setEmailError("");
  };

  const handleEmailChange = (val) => {
    const lowerVal = val.toLowerCase();
    setEditData({ ...editData, email: lowerVal });
    if (lowerVal && !/^[a-z]/.test(lowerVal)) {
      setEmailError("Email must start with a lowercase letter");
    } else {
      setEmailError("");
    }
  };

  const validateEmailFinal = (email) => {
    if (!email) return "Email is required";
    if (!/^[a-z]/.test(email))
      return "Email must start with a lowercase letter";
    const emailRegex = /^[a-z][a-z0-9._%+-]*@[a-z0-9-]+(\.[a-z]{2,})+$/;
    if (!emailRegex.test(email))
      return "Please enter a valid email (e.g., driver@example.com)";
    return "";
  };

  const handleSaveEdit = async (id) => {
    const { name, licenseNumber, phone, address, email } = editData;
    if (!/^[a-zA-Z\s]{2,50}$/.test(name)) {
      toast.error("Name must contain only letters and spaces");
      return;
    }
    if (!/^LN-\d{8}$/.test(licenseNumber)) {
      toast.error("License number must be in format LN-XXXXXXXX");
      return;
    }
    if (!/^07\d{8}$/.test(phone)) {
      toast.error("Phone number must start with 07 and be 10 digits");
      return;
    }
    if (address && /^\d+$/.test(address.replace(/\s/g, ""))) {
      toast.error("Address cannot contain only numbers");
      return;
    }
    const emailValidationMsg = validateEmailFinal(email);
    if (emailValidationMsg) {
      toast.error(emailValidationMsg);
      return;
    }
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/drivers/${id}`, {
        name,
        licenseNumber,
        phone,
        address,
        email,
      });
      toast.success("Driver updated successfully");
      setEditingId(null);
      fetchDrivers();
    } catch (error) {
      console.error("Error updating driver:", error);
      toast.error("Failed to update driver");
    }
  };

  const confirmDelete = (id) => {
    setDeletingId(id);
    setEditingId(null);
  };

  const cancelDelete = () => setDeletingId(null);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/drivers/${id}`);
      toast.success("Driver deleted successfully");
      setDeletingId(null);
      fetchDrivers();
    } catch (error) {
      console.error("Error deleting driver:", error);
      toast.error("Failed to delete driver");
    }
  };
  //Search
  const filteredDrivers = drivers.filter((d) => {
    const query = searchQuery.toLowerCase();
    const matchText =
      d.name.toLowerCase().includes(query) ||
      d.licenseNumber.toLowerCase().includes(query) ||
      d.phone.includes(query) ||
      (d.email ? d.email.toLowerCase().includes(query) : false) ||
      (d.address ? d.address.toLowerCase().includes(query) : false);
    const matchStatus = searchStatus ? d.status === searchStatus : true;
    return matchText && matchStatus;
  });

  return (
    <div className="h-full w-full p-6 bg-sec-2">
      {/* Header with Search + Add side by side */}
      <div className="w-full flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Drivers</h1>
        <div className="flex items-center gap-3">
          {/* Search Button */}
          <button
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-black hover:bg-gray-300 hover:scale-110 transition"
            onClick={() => setShowSearchFields(!showSearchFields)}
            title="Search Driver"
          >
            <FaSearch size={20} />
          </button>
          {/* Add Driver Button */}
          <Link
            to="/admin/add-driver"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-accent text-white shadow-lg hover:scale-110 transition-transform"
            title="Add Driver"
          >
            <CiCirclePlus size={24} />
          </Link>
        </div>
      </div>

      {/* Search fields */}
      {showSearchFields && (
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search by name, license, phone, address, email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border px-2 py-1 rounded w-full"
          />
          <select
            value={searchStatus}
            onChange={(e) => setSearchStatus(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
      )}

      <div className="w-full h-full overflow-x-auto shadow-lg rounded-2xl bg-white">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-accent text-white text-end">
            <tr>
              <th className="py-3 px-4 text-left rounded-tl-2xl">Name</th>
              <th className="py-3 px-4 text-left">License No</th>
              <th className="py-3 px-4 text-left">Phone</th>
              <th className="py-3 px-4 text-left">Address</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-center rounded-tr-2xl">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.map((driver, idx) => (
              <tr
                key={driver._id}
                className={`border-b hover:bg-gray-50 transition-colors ${
                  idx % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                }`}
              >
                {/* Name */}
                <td className="py-3 px-4 text-left">
                  {editingId === driver._id ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^[a-zA-Z\s]*$/.test(val))
                          setEditData({ ...editData, name: val });
                      }}
                      className="border px-2 py-1 rounded w-full"
                    />
                  ) : (
                    driver.name
                  )}
                </td>

                {/* License */}
                <td className="py-3 px-4 text-left">
                  {editingId === driver._id ? (
                    <input
                      type="text"
                      value={editData.licenseNumber}
                      onChange={(e) => {
                        const prefix = "LN-";
                        const digits = e.target.value
                          .replace(prefix, "")
                          .replace(/\D/g, "")
                          .slice(0, 8);
                        setEditData({
                          ...editData,
                          licenseNumber: `${prefix}${digits}`,
                        });
                      }}
                      className="border px-2 py-1 rounded w-full"
                    />
                  ) : (
                    driver.licenseNumber
                  )}
                </td>

                {/* Phone */}
                <td className="py-3 px-4 text-left">
                  {editingId === driver._id ? (
                    <input
                      type="text"
                      value={editData.phone}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "");
                        if (val.startsWith("07")) val = "07" + val.slice(2, 10);
                        else val = "07" + val.slice(0, 8);
                        setEditData({ ...editData, phone: val });
                      }}
                      className="border px-2 py-1 rounded w-full"
                    />
                  ) : (
                    driver.phone
                  )}
                </td>

                {/* Address */}
                <td className="py-3 px-4 text-left">
                  {editingId === driver._id ? (
                    <input
                      type="text"
                      value={editData.address}
                      onChange={(e) =>
                        setEditData({ ...editData, address: e.target.value })
                      }
                      className="border px-2 py-1 rounded w-full"
                    />
                  ) : (
                    driver.address || "-"
                  )}
                </td>

                {/* Email */}
                <td className="py-3 px-4 text-left">
                  {editingId === driver._id ? (
                    <div className="flex flex-col">
                      <input
                        type="text"
                        value={editData.email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        onBlur={() =>
                          setEmailError(validateEmailFinal(editData.email))
                        }
                        className="border px-2 py-1 rounded w-full"
                      />
                      {emailError && (
                        <p className="text-red-500 text-xs mt-1">
                          {emailError}
                        </p>
                      )}
                    </div>
                  ) : (
                    driver.email || "-"
                  )}
                </td>

                {/* Status */}
                <td
                  className={`py-3 px-4 text-left font-semibold ${
                    driver.status === "available"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {driver.status}
                </td>

                {/* Actions */}
                <td className="py-3 px-4">
                  <div className="flex flex-row gap-4 justify-center items-center text-lg">
                    {editingId === driver._id ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(driver._id)}
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
                    ) : deletingId === driver._id ? (
                      <div className="flex flex-col items-center gap-2 bg-gray-100 p-2 rounded-lg">
                        <p className="text-xs text-center">Delete driver?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(driver._id)}
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
                          title="Edit Driver"
                          className="cursor-pointer text-[#5c4033] text-xl transition-transform duration-200 hover:text-[#5c4033]-600 hover:scale-125"
                          onClick={() => handleEditClick(driver)}
                        />
                        <TfiTrash
                          title="Delete Driver"
                          className="cursor-pointer text-red-600 hover:text-red-900 transition-transform duration-200 text-xl hover:scale-125"
                          onClick={() => confirmDelete(driver._id)}
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

export default DriverPage;
