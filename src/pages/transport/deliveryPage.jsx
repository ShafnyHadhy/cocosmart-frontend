import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { CiCirclePlus } from "react-icons/ci";
import { FaRegEdit, FaSearch, FaFilePdf } from "react-icons/fa";
import { TfiTrash } from "react-icons/tfi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function DeliveryPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [deletingId, setDeletingId] = useState(null);

  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const [showSearchFields, setShowSearchFields] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchStatus, setSearchStatus] = useState(""); // New: status filter

  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [deliveryRes, vehicleRes, driverRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/deliveries`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/vehicles`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/drivers`),
      ]);
      setDeliveries(deliveryRes.data);
      setVehicles(vehicleRes.data);
      setDrivers(driverRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load data");
    }
  };

  const handleEditClick = (d) => {
    setEditingId(d._id);
    setEditData({
      vehicle: d.vehicle?._id || "",
      driver: d.driver?._id || "",
      route: d.route || "",
      scheduledDate: d.scheduledDate?.split("T")[0] || today,
      transportCost: d.transportCost || "",
    });
    setDeletingId(null);
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
      toast.success("Delivery updated successfully");
      setEditingId(null);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save changes");
    }
  };

  const confirmDelete = (id) => {
    setDeletingId(id);
    setEditingId(null);
  };

  const cancelDelete = () => setDeletingId(null);

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/deliveries/${id}`
      );
      toast.success("Delivery deleted successfully");
      setDeletingId(null);
      fetchData();
    } catch (err) {
      console.error(err);
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

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/deliveries/${id}/markDelivered`,
        { km: kmValue }
      );

      setDeliveries((prev) =>
        prev.map((d) =>
          d._id === id ? { ...res.data, showKmInput: false, km: "" } : d
        )
      );
      toast.success("Delivery marked as completed!");
      localStorage.setItem("ordersNeedRefresh", "true");
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark delivery as completed");
    }
  };

  // Filter deliveries with status
  const filteredDeliveries = deliveries.filter((d) => {
    const orderID = d.order?.orderID?.toLowerCase() || "";
    const vehicleId = d.vehicle?.vehicleId?.toLowerCase() || "";
    const driverName = d.driver?.name?.toLowerCase() || "";
    const route = d.route?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();

    const matchesText =
      orderID.includes(query) ||
      vehicleId.includes(query) ||
      driverName.includes(query) ||
      route.includes(query);

    const matchesStatus = searchStatus
      ? d.deliveryStatus?.toLowerCase() === searchStatus.toLowerCase()
      : true;

    return matchesText && matchesStatus;
  });

  // Generate PDF
  const generateDeliveryReport = () => {
    const doc = new jsPDF();

    // ===== Header =====
    const now = new Date();
    const reportId = `RPT-${now.getFullYear()}${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-${now
      .getHours()
      .toString()
      .padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}${now
      .getSeconds()
      .toString()
      .padStart(2, "0")}`;

    doc.setFontSize(18);
    doc.text("COCOSMART", 105, 20, { align: "center" });
    doc.setFontSize(14);
    doc.text("Transport REPORT", 105, 28, { align: "center" });
    doc.setFontSize(10);
    doc.text("Comprehensive User FeedbaTransportck Analysis", 105, 36, {
      align: "center",
    });
    // ===== Summary =====
    const completedDeliveries = filteredDeliveries.filter(
      (d) => d.deliveryStatus === "completed"
    );
    const totalKM = completedDeliveries.reduce(
      (sum, d) => sum + (d.km ? parseFloat(d.km) : 0),
      0
    );
    const totalFuel = totalKM / 5; // 1L per 5km
    const totalCost = completedDeliveries.reduce(
      (sum, d) => sum + (d.transportCost ? parseFloat(d.transportCost) : 0),
      0
    );

    // Most active driver
    const driverCounts = {};
    filteredDeliveries.forEach((d) => {
      if (d.driver?.name)
        driverCounts[d.driver.name] = (driverCounts[d.driver.name] || 0) + 1;
    });
    const mostActiveDriver =
      Object.entries(driverCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

    // Most active vehicle
    const vehicleCounts = {};
    filteredDeliveries.forEach((d) => {
      if (d.vehicle?.vehicleId)
        vehicleCounts[d.vehicle.vehicleId] =
          (vehicleCounts[d.vehicle.vehicleId] || 0) + 1;
    });
    const mostActiveVehicle =
      Object.entries(vehicleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

    doc.text(`Total Deliveries: ${filteredDeliveries.length}`, 14, 50);
    doc.text(`Total KM: ${totalKM}`, 14, 56);
    doc.text(`Fuel Used: ${totalFuel.toFixed(2)} L`, 14, 62);
    doc.text(`Total Transport Cost: Rs. ${totalCost}`, 14, 68);
    doc.text(`Most Active Driver: ${mostActiveDriver}`, 14, 74);
    doc.text(`Most Active Vehicle: ${mostActiveVehicle}`, 14, 80);

    // ===== Table =====
    const tableColumn = [
      "Order ID",
      "Vehicle",
      "Driver",
      "Route",
      "Scheduled Date",
      "Status",
      "KM",
      "Fuel Used (L)",
      "Transport Cost",
    ];
    const tableRows = filteredDeliveries.map((d) => [
      d.order?.orderID || "-",
      d.vehicle?.vehicleId || "-",
      d.driver?.name || "-",
      d.route || "-",
      d.scheduledDate ? new Date(d.scheduledDate).toLocaleDateString() : "-",
      d.deliveryStatus
        ? d.deliveryStatus.charAt(0).toUpperCase() + d.deliveryStatus.slice(1)
        : "-",
      d.km || "-",
      d.km ? (parseFloat(d.km) / 5).toFixed(2) : "-",
      d.transportCost ? `Rs. ${d.transportCost}` : "-",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 90,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      columnStyles: {
        5: { cellWidth: 25 }, // Status
      },
    });

    doc.save(
      `delivery_report_${now.getFullYear()}${
        now.getMonth() + 1
      }${now.getDate()}.pdf`
    );
  };

  return (
    <div className="h-full w-full p-6 bg-sec-2">
      <div className="w-full flex justify-end gap-2 mb-2">
        <button
          className="flex items-center gap-1 px-3 py-1 bg-blue-800 text-white rounded hover:bg-blue-600"
          onClick={() => setShowSearchFields(!showSearchFields)}
        >
          <FaSearch /> Search
        </button>
        <button
          className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={generateDeliveryReport}
        >
          <FaFilePdf /> PDF
        </button>
      </div>

      {showSearchFields && (
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search by order, vehicle, driver, route"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border px-2 py-1 rounded w-full"
          />
          <select
            value={searchStatus}
            onChange={(e) => setSearchStatus(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      )}

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
            {filteredDeliveries.map((d, idx) => (
              <tr
                key={d._id}
                className={`border-b hover:bg-gray-50 transition-colors ${
                  idx % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                }`}
              >
                {/* Order ID */}
                <td className="py-3 px-4">{d.order?.orderID || "-"}</td>
                {/* Vehicle */}
                <td className="py-3 px-4">
                  {editingId === d._id && d.deliveryStatus !== "completed" ? (
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

                {/* Driver */}
                <td className="py-3 px-4">
                  {editingId === d._id && d.deliveryStatus !== "completed" ? (
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

                {/* Location */}
                <td className="py-3 px-4">
                  {editingId === d._id && d.deliveryStatus !== "completed" ? (
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

                {/* Scheduled Date */}
                <td className="py-3 px-4">
                  {editingId === d._id && d.deliveryStatus !== "completed" ? (
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

                {/* Status */}
                <td className="py-3 px-4">
                  {d.deliveryStatus === "completed" ? (
                    <span className="text-green-600 font-semibold">
                      Delivered
                    </span>
                  ) : (
                    <span className="text-yellow-600 font-semibold">
                      Processing
                    </span>
                  )}
                </td>

                {/* Transport Cost */}
                <td className="py-3 px-4">
                  {editingId === d._id && d.deliveryStatus === "completed" ? (
                    <input
                      type="number"
                      value={editData.transportCost || d.transportCost || ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          transportCost: e.target.value,
                        })
                      }
                      className="border px-2 py-1 rounded w-full"
                    />
                  ) : d.transportCost ? (
                    `Rs. ${d.transportCost}`
                  ) : (
                    "-"
                  )}
                </td>

                {/* Actions */}
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

      <button
        onClick={() => navigate("/admin/deliveries/add")}
        className="fixed right-[40px] bottom-[40px] text-6xl text-accent drop-shadow-lg hover:scale-110 transition-transform"
      >
        <CiCirclePlus />
      </button>
    </div>
  );
}
