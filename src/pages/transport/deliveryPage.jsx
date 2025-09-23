import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CiCirclePlus } from "react-icons/ci";
import { FaRegEdit } from "react-icons/fa";
import { TfiTrash } from "react-icons/tfi";

export default function DeliveryPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [deliveryRes, vehicleRes, driverRes] = await Promise.all([
      axios.get(`${import.meta.env.VITE_API_URL}/api/deliveries`),
      axios.get(`${import.meta.env.VITE_API_URL}/api/vehicles`),
      axios.get(`${import.meta.env.VITE_API_URL}/api/drivers`),
    ]);
    setDeliveries(deliveryRes.data);
    setVehicles(vehicleRes.data);
    setDrivers(driverRes.data);
  };

  const handleEditClick = (d) => {
    setEditingId(d._id);
    setEditData({
      orderId: d.orderId || "",
      vehicle: d.vehicle?._id || "",
      driver: d.driver?._id || "",
      route: d.route || "",
      scheduledDate: d.scheduledDate?.split("T")[0] || today,
    });
    setDeletingId(null); // Close any delete confirmation
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSaveEdit = async (id) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/deliveries/${id}`,
        editData
      );
      await fetchData();
      handleCancelEdit();
    } catch (err) {
      toast.error("Failed to save changes");
    }
  };

  const confirmDelete = (id) => {
    setDeletingId(id);
    setEditingId(null); // Close any edit mode
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/deliveries/${id}`
      );
      await fetchData();
      setDeletingId(null);
    } catch (err) {
      toast.error("Failed to delete delivery");
    }
  };

  const handleMarkDelivery = (id) => {
    setDeliveries((prev) =>
      prev.map((d) => (d._id === id ? { ...d, showKmInput: true, km: "" } : d))
    );
  };

  const handleKmChange = (id, value) => {
    setDeliveries((prev) =>
      prev.map((d) => (d._id === id ? { ...d, km: value } : d))
    );
  };

  const handleCancelKm = (id) => {
    setDeliveries((prev) =>
      prev.map((d) => (d._id === id ? { ...d, showKmInput: false, km: "" } : d))
    );
  };

  const handleSaveKm = async (id) => {
    const delivery = deliveries.find((d) => d._id === id);
    const kmValue = parseFloat(delivery.km);

    if (isNaN(kmValue) || kmValue <= 0) {
      toast.error("Please enter a valid KM value");
      return;
    }

    const transportCost = kmValue * 100;

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/deliveries/${id}/markDelivered`,
        {
          km: kmValue,
          transportCost,
          deliveryStatus: "completed",
        }
      );
      await fetchData();
    } catch (err) {
      toast.error("Failed to mark delivery as completed");
    }
  };

  return (
    <div className="h-full w-full p-6 bg-sec-2">
      <button
        onClick={() => navigate("/admin/deliveries/add")}
        className="fixed right-[40px] bottom-[40px] text-6xl text-accent drop-shadow-lg hover:scale-110 transition-transform"
      >
        <CiCirclePlus />
      </button>

      <div className="overflow-x-auto shadow-lg rounded-2xl bg-white">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-accent text-white">
            <tr>
              <th className="py-3 px-4 text-left rounded-tl-2xl">Order ID</th>
              <th className="py-3 px-4 text-left">Vehicle</th>
              <th className="py-3 px-4 text-left">Driver</th>
              <th className="py-3 px-4 text-left">Location</th>
              <th className="py-3 px-4 text-left">Scheduled Date</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Transport Cost</th>
              <th className="py-3 px-4 text-center rounded-tr-2xl">Actions</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((d, idx) => (
              <tr
                key={d._id}
                className={`border-b ${
                  idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-gray-100 transition-colors`}
              >
                <td className="py-3 px-4">
                  {editingId === d._id ? (
                    <input
                      type="text"
                      value={editData.orderId}
                      onChange={(e) =>
                        setEditData({ ...editData, orderId: e.target.value })
                      }
                      className="border px-2 py-1 rounded w-full"
                    />
                  ) : (
                    d.orderId || "-"
                  )}
                </td>

                <td className="py-3 px-4">
                  {editingId === d._id ? (
                    <select
                      value={editData.vehicle}
                      onChange={(e) =>
                        setEditData({ ...editData, vehicle: e.target.value })
                      }
                      className="border px-2 py-1 rounded w-full"
                    >
                      <option value="">Select Vehicle</option>
                      {vehicles
                        .filter(
                          (v) =>
                            v.status === "available" || v._id === d.vehicle?._id
                        )
                        .map((v) => (
                          <option key={v._id} value={v._id}>
                            {v.vehicleId}
                          </option>
                        ))}
                    </select>
                  ) : (
                    d.vehicle?.vehicleId || "-"
                  )}
                </td>

                <td className="py-3 px-4">
                  {editingId === d._id ? (
                    <select
                      value={editData.driver}
                      onChange={(e) =>
                        setEditData({ ...editData, driver: e.target.value })
                      }
                      className="border px-2 py-1 rounded w-full"
                    >
                      <option value="">Select Driver</option>
                      {drivers
                        .filter(
                          (dr) =>
                            dr.status === "available" ||
                            dr._id === d.driver?._id
                        )
                        .map((dr) => (
                          <option key={dr._id} value={dr._id}>
                            {dr.name}
                          </option>
                        ))}
                    </select>
                  ) : (
                    d.driver?.name || "-"
                  )}
                </td>

                <td className="py-3 px-4">
                  {editingId === d._id ? (
                    <input
                      type="text"
                      value={editData.route}
                      onChange={(e) =>
                        setEditData({ ...editData, route: e.target.value })
                      }
                      className="border px-2 py-1 rounded w-full"
                    />
                  ) : (
                    d.route
                  )}
                </td>

                <td className="py-3 px-4">
                  {editingId === d._id ? (
                    <input
                      type="date"
                      min={today}
                      value={editData.scheduledDate}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          scheduledDate: e.target.value,
                        })
                      }
                      className="border px-2 py-1 rounded w-full"
                    />
                  ) : d.scheduledDate ? (
                    new Date(d.scheduledDate).toLocaleDateString()
                  ) : (
                    "-"
                  )}
                </td>

                <td className="py-3 px-4">
                  {d.deliveryStatus === "completed" ? (
                    <span className="text-green-600 font-semibold">
                      Completed
                    </span>
                  ) : (
                    <span className="text-yellow-600 font-semibold">
                      Pending
                    </span>
                  )}
                </td>

                <td className="py-3 px-4">
                  {d.transportCost ? `Rs. ${d.transportCost}` : "-"}
                </td>

                <td className="py-3 px-4">
                  <div className="flex flex-row gap-4 justify-center items-center text-lg">
                    {editingId === d._id ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(d._id)}
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
                    ) : d.deliveryStatus !== "completed" && d.showKmInput ? (
                      <>
                        <input
                          type="number"
                          value={d.km}
                          onChange={(e) =>
                            handleKmChange(d._id, e.target.value)
                          }
                          placeholder="Enter KM"
                          className="border px-2 py-1 rounded w-20"
                        />
                        <button
                          onClick={() => handleSaveKm(d._id)}
                          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => handleCancelKm(d._id)}
                          className="bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500"
                        >
                          Cancel
                        </button>
                      </>
                    ) : deletingId === d._id ? (
                      <div className="flex flex-col items-center gap-2 bg-gray-100 p-2 rounded-lg">
                        <p className="text-xs text-center">Delete delivery?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(d._id)}
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
                          className="cursor-pointer hover:text-green-600 transition-colors text-xl"
                          onClick={() => handleEditClick(d)}
                        />
                        <TfiTrash
                          className="cursor-pointer hover:text-red-600 transition-colors text-xl"
                          onClick={() => confirmDelete(d._id)}
                        />
                        {d.deliveryStatus !== "completed" && (
                          <button
                            onClick={() => handleMarkDelivery(d._id)}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                          >
                            Mark Delivered
                          </button>
                        )}
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
