import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { CiCirclePlus } from "react-icons/ci";
import { FaRegEdit, FaSearch, FaRegFilePdf } from "react-icons/fa";
import { IoCheckmarkDoneSharp } from "react-icons/io5";

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

  // Generate Delivery Report PDF
  const generateDeliveryReport = (startDate, endDate) => {
    const doc = new jsPDF();
    const logoImg = new Image();
    logoImg.src = "/clogo.png"; // logo in public folder

    logoImg.onload = () => {
      // ===== Company Header =====
      doc.addImage(logoImg, "PNG", 15, 10, 30, 30);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("CocoSmart Pvt Ltd", 105, 20, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.text("Smart Solutions for Coconut Plantations", 105, 28, {
        align: "center",
      });

      doc.setFontSize(9);
      doc.text(
        "Hotline: +94 77 123 4567 | Email: info@cocosmart.com  |  Fax: +1-234-567-890",
        105,
        36,
        { align: "center" }
      );
      doc.text("123/C, Main Street, Colombo 01, Sri Lanka", 105, 42, {
        align: "center",
      });

      // ===== Report Title + Period & Generated Time =====
      const now = new Date();
      const reportId = `DLV-${Date.now()}`;
      const year = now.getFullYear();
      const month = now.getMonth();

      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(
        `Period: ${firstDay.toISOString().split("T")[0]}  -  ${
          lastDay.toISOString().split("T")[0]
        }`,
        15,
        55,
        { align: "left" }
      );
      doc.text(`Generated on: ${now.toLocaleString()}`, 200, 55, {
        align: "right",
      });

      // ===== Delivery Report Title =====
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Delivery Report", 105, 70, { align: "center" });

      const titleWidth = doc.getTextWidth("Delivery Report");
      doc.line(105 - titleWidth / 2, 72, 105 + titleWidth / 2, 72);

      // ===== Summary Section =====
      const completedDeliveries = filteredDeliveries.filter(
        (d) => d.deliveryStatus === "completed"
      );
      const totalKM = completedDeliveries.reduce(
        (sum, d) => sum + (d.km ? parseFloat(d.km) : 0),
        0
      );
      const totalFuel = totalKM / 5;
      const totalCost = completedDeliveries.reduce(
        (sum, d) => sum + (d.transportCost ? parseFloat(d.transportCost) : 0),
        0
      );

      const driverCounts = {};
      filteredDeliveries.forEach((d) => {
        if (d.driver?.name)
          driverCounts[d.driver.name] = (driverCounts[d.driver.name] || 0) + 1;
      });
      const mostActiveDriver =
        Object.entries(driverCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

      const vehicleCounts = {};
      filteredDeliveries.forEach((d) => {
        if (d.vehicle?.vehicleId)
          vehicleCounts[d.vehicle.vehicleId] =
            (vehicleCounts[d.vehicle.vehicleId] || 0) + 1;
      });
      const mostActiveVehicle =
        Object.entries(vehicleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
        "-";

      const summaryStartY = 78;
      doc.setFontSize(10);
      doc.text(
        `Total Deliveries: ${filteredDeliveries.length}`,
        15,
        summaryStartY
      );
      doc.text(`Total KM: ${totalKM}`, 15, summaryStartY + 6);
      doc.text(`Fuel Used: ${totalFuel.toFixed(2)} L`, 15, summaryStartY + 12);
      doc.text(
        `Most Active Driver: ${mostActiveDriver}`,
        15,
        summaryStartY + 18
      );
      doc.text(
        `Most Active Vehicle: ${mostActiveVehicle}`,
        15,
        summaryStartY + 24
      );

      // ===== Total Transport Cost (Delivery only) =====
      doc.text(
        `Total Transport Cost (Delivery only): Rs. ${totalCost}`,
        15,
        summaryStartY + 30
      );

      // ===== Table Section =====
      const tableColumn = [
        "Order",
        "Vehicle",
        "Driver",
        "Route",
        "Sch.Date",
        "Status",
        "KM",
        "Fuel(L)",
        "Cost(Rs.)",
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
        startY: summaryStartY + 42,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        styles: { fontSize: 9, halign: "left" },
        headStyles: { fillColor: [42, 85, 64], textColor: 255, halign: "left" },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 18 },
          2: { cellWidth: 22 },
          3: { cellWidth: 23 },
          4: { cellWidth: 25 },
          5: { cellWidth: 20 },
          6: { cellWidth: 15 },
          7: { cellWidth: 18 },
          8: { cellWidth: 24 },
        },
      });

      // ===== Footer =====
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(
          "Prepared by: Transport Admin | Approved by: Manager",
          15,
          290,
          { align: "left" }
        );
        doc.text(
          `Report ID: ${reportId} | Page ${i} of ${pageCount}`,
          200,
          290,
          { align: "right" }
        );
      }

      // Save PDF
      doc.save(`Cocosmart_Delivery_Report_${Date.now()}.pdf`);
    };
  };

  return (
    <div className="h-full w-full p-6 bg-sec-2">
      <div className="w-full flex justify-end gap-3 mb-4">
        {/* Search Button */}
        <button
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-black hover:bg-gray-300 hover:scale-110 transition"
          onClick={() => setShowSearchFields(!showSearchFields)}
          title="Search Delivery"
        >
          <FaSearch size={20} />
        </button>

        {/* PDF Button */}
        <button
          className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-300 text-black hover:bg-yellow-200 hover:scale-110 transition"
          title="Generate PDF"
          onClick={generateDeliveryReport}
        >
          <FaRegFilePdf size={20} />
        </button>

        {/* Add Delivery Button */}
        <button
          onClick={() => navigate("/admin/deliveries/add")}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-accent text-white shadow-lg hover:scale-110 transition-transform"
          title="Add Delivery"
        >
          <CiCirclePlus size={24} />
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
                    <span className="bg-green-100 text-green-800 px-5 py-1 rounded-full font-semibold">
                      Delivered
                    </span>
                  ) : (
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full  font-semibold">
                      Processing
                    </span>
                  )}
                </td>

                {/* Transport Cost */}
                <td className="py-3 px-4 text-blue-800 font-semibold">
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
                          title="Edit Delivery"
                          className="cursor-pointer text-[#5c4033] text-xl transition-transform duration-200 hover:text-[#5c4033]-600 hover:scale-125"
                          onClick={() => handleEditClick(d)}
                        />
                        <TfiTrash
                          title="Delete Delivery"
                          className="cursor-pointer text-red-600 hover:text-red-900 transition-transform duration-200 text-xl hover:scale-125"
                          onClick={() => confirmDelete(d._id)}
                        />
                        {d.deliveryStatus !== "completed" && (
                          <IoCheckmarkDoneSharp
                            className="text-green-500 text-2xl cursor-pointer transition-transform duration-200 hover:text-green-700 transition-colors hover:scale-125"
                            title="Mark Delivered"
                            onClick={() => handleMarkDelivery(d._id)}
                          />
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
