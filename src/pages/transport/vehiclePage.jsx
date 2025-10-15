import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { CiCirclePlus } from "react-icons/ci";
import { FaRegEdit, FaSearch } from "react-icons/fa";
import { TfiTrash } from "react-icons/tfi";

export default function VehiclePage() {
  const [vehicles, setVehicles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    plateNumber: "",
    type: "",
    fuelType: "",
    insuranceExpiry: "",
  });
  const [deletingId, setDeletingId] = useState(null);

  const [showSearchFields, setShowSearchFields] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchStatus, setSearchStatus] = useState("");

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/vehicles`
      );
      setVehicles(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch vehicles");
    }
  };

  const handleEditClick = (vehicle) => {
    setEditingId(vehicle._id);
    setEditData({
      plateNumber: vehicle.plateNumber,
      type: vehicle.type,
      fuelType: vehicle.fuelType || "",
      insuranceExpiry: vehicle.insuranceExpiry?.split("T")[0] || "",
    });
    setDeletingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({
      plateNumber: "",
      type: "",
      fuelType: "",
      insuranceExpiry: "",
    });
  };

  const handleSaveEdit = async (id) => {
    const { plateNumber, type, fuelType, insuranceExpiry } = editData;

    if (!/^[A-Z]{2,4}-\d{4}$/.test(plateNumber)) {
      toast.error("Plate Number must be like ABC-1234");
      return;
    }

    if (!/^[a-zA-Z\s]{2,30}$/.test(type)) {
      toast.error("Type must contain only letters and spaces");
      return;
    }

    if (/^\d/.test(fuelType)) {
      toast.error("Fuel Type cannot start with a digit");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    if (insuranceExpiry < today) {
      toast.error("Insurance expiry cannot be in the past");
      return;
    }

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/vehicles/${id}`,
        editData
      );
      toast.success("Vehicle updated successfully");
      setEditingId(null);
      fetchVehicles();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update vehicle");
    }
  };

  const confirmDelete = (id) => {
    setDeletingId(id);
    setEditingId(null);
  };

  const cancelDelete = () => setDeletingId(null);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/vehicles/${id}`);
      toast.success("Vehicle deleted successfully");
      setDeletingId(null);
      fetchVehicles();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete vehicle");
    }
  };

  const isExpiringSoon = (dateStr) => {
    if (!dateStr) return false;
    const expiry = new Date(dateStr);
    const today = new Date();
    const diff = (expiry - today) / (1000 * 60 * 60 * 24);
    return diff < 14;
  };

  const filteredVehicles = vehicles.filter((v) => {
    const query = searchQuery.toLowerCase();
    const matchText =
      v.plateNumber.toLowerCase().startsWith(query) ||
      v.type.toLowerCase().startsWith(query) ||
      (v.fuelType ? v.fuelType.toLowerCase().startsWith(query) : false);
    const matchStatus = searchStatus ? v.status === searchStatus : true;
    return matchText && matchStatus;
  });

  return (
    <div className="h-full w-full p-6 bg-sec-2">
      {/* Top Action Buttons (Search + Add Vehicle) */}
      <div className="w-full flex justify-end gap-3 mb-4">
        {/* Search Button */}
        <button
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-black hover:bg-gray-300 hover:scale-110 transition"
          onClick={() => setShowSearchFields(!showSearchFields)}
          title="Search Vehicle"
        >
          <FaSearch size={20} />
        </button>

        {/* Add Vehicle Button */}
        <Link
          to="/admin/add-vehicle"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-accent text-white shadow-lg hover:scale-110 transition-transform"
          title="Add Vehicle"
        >
          <CiCirclePlus size={24} />
        </Link>
      </div>

      {/* Search Fields */}
      {showSearchFields && (
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search by plate, type, fuel"
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
              <th className="py-3 px-4 text-left rounded-tl-2xl">Vehicle ID</th>
              <th className="py-3 px-4 text-left">Plate Number</th>
              <th className="py-3 px-4 text-left">Type</th>
              <th className="py-3 px-4 text-left">Fuel Type</th>
              <th className="py-3 px-4 text-left">Insurance Expiry</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-center rounded-tr-2xl">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map((v, idx) => (
              <tr
                key={v._id}
                className={`border-b hover:bg-gray-50 transition-colors ${
                  idx % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                }`}
              >
                <td className="py-3 px-4 font-semibold text-gray-700">
                  {v.vehicleId}
                </td>

                <td className="py-3 px-4">
                  {editingId === v._id ? (
                    <input
                      type="text"
                      value={editData.plateNumber}
                      onChange={(e) => {
                        let val = e.target.value.toUpperCase();
                        val = val.replace(/[^A-Z0-9-]/g, "");
                        const match = val.match(/^([A-Z]{0,4})(-?)(\d{0,4})$/);
                        if (match) {
                          const prefix = match[1];
                          const hyphen =
                            match[2] && prefix.length >= 2 ? "-" : "";
                          const digits = match[3];
                          setEditData({
                            ...editData,
                            plateNumber: `${prefix}${hyphen}${digits}`,
                          });
                        }
                      }}
                      className="border px-2 py-1 rounded w-full"
                    />
                  ) : (
                    v.plateNumber
                  )}
                </td>

                <td className="py-3 px-4">
                  {editingId === v._id ? (
                    <input
                      type="text"
                      value={editData.type}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^[a-zA-Z\s]*$/.test(val))
                          setEditData({ ...editData, type: val });
                      }}
                      className="border px-2 py-1 rounded w-full"
                    />
                  ) : (
                    v.type
                  )}
                </td>

                <td className="py-3 px-4">
                  {editingId === v._id ? (
                    <input
                      type="text"
                      value={editData.fuelType}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!/^\d/.test(val))
                          setEditData({ ...editData, fuelType: val });
                      }}
                      className="border px-2 py-1 rounded w-full"
                    />
                  ) : (
                    v.fuelType
                  )}
                </td>

                <td
                  className={`py-3 px-4 ${
                    isExpiringSoon(v.insuranceExpiry)
                      ? "text-red-600 font-semibold"
                      : ""
                  }`}
                >
                  {editingId === v._id ? (
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={editData.insuranceExpiry}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          insuranceExpiry: e.target.value,
                        })
                      }
                      className="border px-2 py-1 rounded w-full"
                    />
                  ) : v.insuranceExpiry ? (
                    new Date(v.insuranceExpiry).toISOString().split("T")[0]
                  ) : (
                    "—"
                  )}
                </td>

                <td
                  className={`py-3 px-4 font-semibold ${
                    v.status === "available" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {v.status}
                </td>

                <td className="py-3 px-4">
                  <div className="flex flex-row gap-4 justify-center items-center text-lg">
                    {editingId === v._id ? (
                      <>
                        <button
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                          onClick={() => handleSaveEdit(v._id)}
                        >
                          Save
                        </button>
                        <button
                          className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </button>
                      </>
                    ) : deletingId === v._id ? (
                      <div className="flex flex-col items-center gap-2 bg-gray-100 p-2 rounded-lg">
                        <p className="text-xs text-center">Delete vehicle?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(v._id)}
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
                          title="Edit Vehicle"
                          className="cursor-pointer text-[#5c4033] text-xl transition-transform duration-200 hover:text-[#5c4033]-600 hover:scale-125"
                          onClick={() => handleEditClick(v)}
                        />
                        <TfiTrash
                          title="Delete Vehicle"
                          className="cursor-pointer text-red-600 hover:text-red-900 transition-transform duration-200 text-xl hover:scale-125"
                          onClick={() => confirmDelete(v._id)}
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
}
