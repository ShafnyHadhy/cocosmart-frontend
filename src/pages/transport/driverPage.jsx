import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { CiCirclePlus } from "react-icons/ci";
import { FaRegEdit } from "react-icons/fa";
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

  // Email validation while typing (allows natural typing but enforces lowercase)
  const handleEmailChange = (val) => {
    const lowerVal = val.toLowerCase();
    setEditData({ ...editData, email: lowerVal });

    // Immediate check: first char must be a letter
    if (lowerVal && !/^[a-z]/.test(lowerVal)) {
      setEmailError("Email must start with a lowercase letter");
    } else {
      setEmailError("");
    }
  };

  // Final email validation on blur or save
  const validateEmailFinal = (email) => {
    if (!email) return "Email is required";

    // Must start with a lowercase letter
    if (!/^[a-z]/.test(email))
      return "Email must start with a lowercase letter";

    // Full email regex (prevents invalid formats like a11@.gmail.com)
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

    // Final email validation
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

  const cancelDelete = () => {
    setDeletingId(null);
  };

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

  return (
    <div className="h-full w-full p-6 bg-sec-2">
      <Link
        to="/admin/add-driver"
        className="fixed right-[40px] bottom-[40px] text-6xl text-accent drop-shadow-lg hover:scale-110 transition-transform"
      >
        <CiCirclePlus />
      </Link>

      <div className="w-full h-full">
        <div className="overflow-x-auto shadow-lg rounded-2xl bg-white">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-accent text-white text-end">
              <tr>
                <th className="py-3 px-4 text-left rounded-tl-2xl">Name</th>
                <th className="py-3 px-4 text-left">License No</th>
                <th className="py-3 px-4 text-left">Phone</th>
                <th className="py-3 px-4 text-left">Address</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-center rounded-tr-2xl">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver, idx) => (
                <tr
                  key={driver._id}
                  className={`border-b hover:bg-gray-50 transition-colors ${
                    idx % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                  }`}
                >
                  <td className="py-3 px-4 text-left">
                    {editingId === driver._id ? (
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^[a-zA-Z\s]*$/.test(val)) {
                            setEditData({ ...editData, name: val });
                          }
                        }}
                        className="border px-2 py-1 rounded w-full"
                      />
                    ) : (
                      driver.name
                    )}
                  </td>

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

                  <td className="py-3 px-4 text-left">
                    {editingId === driver._id ? (
                      <input
                        type="text"
                        value={editData.phone}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "");
                          if (val.startsWith("07")) {
                            val = "07" + val.slice(2, 10);
                          } else {
                            val = "07" + val.slice(0, 8);
                          }
                          setEditData({ ...editData, phone: val });
                        }}
                        className="border px-2 py-1 rounded w-full"
                      />
                    ) : (
                      driver.phone
                    )}
                  </td>

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

                  <td
                    className={`py-3 px-4 text-left font-semibold ${
                      driver.status === "available"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {driver.status}
                  </td>

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
                            className="cursor-pointer hover:text-green-600 transition-colors"
                            onClick={() => handleEditClick(driver)}
                          />
                          <TfiTrash
                            className="cursor-pointer hover:text-red-600 transition-colors"
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
    </div>
  );
};

export default DriverPage;
