// ReorderDetails.jsx — Light theme matching dashboard
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";
import UpdateRorderModal from "./UpdateRorderModal.jsx";

// ===== Shared helpers & constants =====
const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_URL) ||
  (typeof process !== "undefined" && process.env && process.env.VITE_API_URL) ||
  "http://localhost:5000";

const LIST_URL = `${API_BASE}/api/rorders`;

const fmt2 = (n) => {
  const v = Number(String(n).replace(/,/g, "")); // be safe if API sends "1,000.00"
  return Number.isFinite(v)
    ? new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)
    : "0.00";
};

function getFilenameFromDisposition(disposition) {
  if (!disposition) return null;
  const m = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i.exec(disposition);
  return m && m[1] ? m[1].replace(/["']/g, "") : null;
}

async function fetchHandler() {
  const res = await axios.get(LIST_URL);
  return res.data; // expects { reorders: [...] }
}

//handle pdf download
async function handleDownloadReorderPdf() {
  try {
    const url = `${API_BASE}/api/rorders/report/pdf`;
    const res = await axios.get(url, { responseType: "blob" });

    const blob = new Blob([res.data], { type: "application/pdf" });
    const suggested = getFilenameFromDisposition(res.headers["content-disposition"]);
    const fallback = `reorder-report-${new Date().toISOString().slice(0, 10)}.pdf`;
    const fileName = suggested || fallback;

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(link.href);
  } catch (e) {
    console.error(e);
    alert("Sorry, could not download the Reorder report.");
  }
}

// ===== Row component (inlined) =====
function DisplayReorderItem({ item, onDelete, onEdit }) {
  const {
    _id,
    order_id,
    item_id,
    unit_cost,
    qty,
    tot_value,
    requested_by,
    status,
  } = item || {};

  const [loading, setLoading] = useState(false);

  const getStatusBadge = (status) => {
    const statusLower = String(status).toLowerCase();
    switch (statusLower) {
      case "pending":
        return (
          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            Pending
          </span>
        );
      case "rejected":
        return (
          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            Rejected
          </span>
        );
      case "approved":
        return (
          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            Approved
          </span>
        );
      case "ordered":
        return (
          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            Ordered
          </span>
        );
      default:
        return (
          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  const rowClass = ["text-sm hover:bg-green-50/30 transition-colors"].filter(Boolean).join(" ");
  const cellClass = "border-b border-gray-100 px-4 py-3 align-middle";

  const deleteHandler = async (e) => {
    e?.stopPropagation?.();
    if (loading) return;

    const name = order_id || item_id || "this order";

    const result = await Swal.fire({
      title: `Delete ${name}?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#2a5540",
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      await axios.delete(`${API_BASE}/api/rorders/${encodeURIComponent(_id)}`);
      onDelete?.(_id);
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err?.response?.data || err.message);
      Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: err?.response?.data?.message || "Try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <tr className={rowClass}>
      <td className={`${cellClass} font-mono font-semibold text-green-700 bg-green-50/40 whitespace-nowrap`}>
        {order_id}
      </td>
      <td className={`${cellClass} font-medium text-gray-800 whitespace-nowrap`}>{item_id}</td>
      <td className={`${cellClass} text-right font-semibold text-green-700 whitespace-nowrap`}>
        LKR {fmt2(unit_cost)}
      </td>
      <td className={`${cellClass} text-right font-medium text-gray-800 whitespace-nowrap`}>{qty}</td>
      <td className={`${cellClass} text-right font-semibold text-green-700 whitespace-nowrap`}>
        LKR {fmt2(tot_value)}
      </td>
      <td className={`${cellClass} text-gray-700 font-medium`}>{requested_by}</td>
      <td className={`${cellClass}`}>
        <div className="flex items-center">{getStatusBadge(status)}</div>
      </td>
      <td className={`${cellClass} w-[120px]`}>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onEdit?.(item)}
            className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 hover:scale-110 focus:scale-110 focus:outline-none"
            title="Edit"
          >
            <FiEdit2 size={16} aria-hidden="true" />
            <span className="sr-only">Edit</span>
          </button>

          <button
            type="button"
            onClick={deleteHandler}
            disabled={loading}
            className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700 transition-all duration-200 hover:scale-110 focus:scale-110 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
            title={loading ? "Deleting..." : "Delete"}
          >
            <FiTrash2 size={16} aria-hidden="true" />
            <span className="sr-only">Delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
}

// ===== Main page =====
export default function ReorderDetails() {
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [noResults, setNoResults] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [openEdit, setOpenEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  // auto-filter when typing / changing dropdown, but only after data is loaded
  useEffect(() => {
    if (!allItems.length) return; // wait until fetch populated data
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedFilter, allItems]);

  const fetchItems = async () => {
    const { data } = await axios.get(LIST_URL);
    // shape tolerant:
    const list = data?.items || data?.rorders || data;
    const safe = Array.isArray(list) ? list : [];
    setItems(safe);
    setAllItems(safe);
  };
  useEffect(() => {
    fetchItems();
  }, []);

  const handleDeleteFromState = (id) => {
    setItems((prev) => prev.filter((p) => p._id !== id));
    setAllItems((prev) => prev.filter((p) => p._id !== id));
    if (noResults && items.length > 0) setNoResults(false);
  };

  const totalOrders = allItems.length;
  const approvedCount = allItems.filter((item) => String(item.status).toLowerCase() === "approved").length;
  const rejectedCount = allItems.filter((item) => String(item.status).toLowerCase() === "rejected").length;

  const handleSearch = () => {
    const q = searchQuery.trim().toLowerCase();
    let list = [...allItems];

    if (selectedFilter === "approved") list = list.filter((item) => String(item.status).toLowerCase() === "approved");
    else if (selectedFilter === "pending") list = list.filter((item) => String(item.status).toLowerCase() === "pending");
    else if (selectedFilter === "ordered") list = list.filter((item) => String(item.status).toLowerCase() === "ordered");
    else if (selectedFilter === "rejected") list = list.filter((item) => String(item.status).toLowerCase() === "rejected");

    if (q) {
      list = list.filter((item) =>
        Object.values(item).some((field) => String(field ?? "").toLowerCase().includes(q))
      );
    }

    setItems(list);
    setNoResults(list.length === 0);
  };

  return (
    <div className="min-h-screen p-6 font-sans" style={{ backgroundColor: "#f5f5f5" }}>
      {/* Header - Light like dashboard */}
      <div className="mb-8 rounded-3xl bg-white p-5 shadow-lg border-2" style={{ borderColor: "#2a5540" }}>
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="min-w-[280px]">
            <h1 className="m-0 text-4xl font-bold tracking-tight sm:text-5xl" style={{ color: "#2a5540" }}>
              Reorder Details 🔄
            </h1>
            <p className="m-0 text-lg text-gray-600 mt-2 font-medium">Manage reorders and track order status</p>
          </div>
          <div className="flex gap-6">
            {/* Approved Orders Card - Green */}
            <div className="bg-white rounded-2xl border-2 px-5 py-5 h-28 text-center shadow-md" style={{ borderColor: "#16a34a" }}>
              <div className="text-3xl font-extrabold sm:text-4xl" style={{ color: "#16a34a" }}>
                {approvedCount}
              </div>
              <div className="text-sm font-semibold uppercase tracking-wide text-gray-600">Approved</div>
            </div>

            {/* Rejected Orders Card - Red warning */}
            <div
              className={`bg-white rounded-2xl border-2 px-4 py-5 h-28 text-center shadow-md relative ${
                rejectedCount > 0 ? "border-red-300 shadow-red-100" : "border-gray-200"
              }`}
            >
              {rejectedCount > 0 && <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>}
              <div className="text-3xl font-extrabold text-red-600 sm:text-4xl flex items-center justify-center gap-2">
                {rejectedCount > 0 && <span>❌</span>}
                {rejectedCount}
              </div>
              <div className="text-sm font-semibold uppercase tracking-wide text-gray-600">Rejected</div>
              {rejectedCount > 0 && <div className="text-xs font-medium text-red-600 mt-1">Needs Attention!</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar - Clean white with subtle borders */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
        <div className="flex w-full max-w-2xl flex-1 gap-3">
          <input
            className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 outline-none transition-all duration-200 focus:bg-white focus:shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search by order ID, item ID, reorder by..."
            onFocus={(e) => {
              e.target.style.borderColor = "#2a5540";
              e.target.style.backgroundColor = "#ffffff";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e5e7eb";
              e.target.style.backgroundColor = "#f9fafb";
            }}
          />
          <button
            className="rounded-xl px-6 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            style={{ backgroundColor: "#2a5540" }}
            onClick={handleSearch}
          >
            Search
          </button>
        </div>

        <div className="flex items-center gap-3">
          <select
            className="rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none transition-all duration-200 focus:bg-white"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            onFocus={(e) => {
              e.target.style.borderColor = "#2a5540";
              e.target.style.backgroundColor = "#ffffff";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e5e7eb";
              e.target.style.backgroundColor = "#f9fafb";
            }}
          >
            <option value="all">All Types</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="ordered">Ordered</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Create Order Button */}
          <Link
            to="/inventory/addRorder"
            className="rounded-xl px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            style={{ backgroundColor: "#2a5540" }}
          >
            Create Order
          </Link>

          {/* Download Button */}
          <button
            className="rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            style={{ backgroundColor: "#16a34a" }}
            onClick={handleDownloadReorderPdf}
          >
            Download Report
          </button>
        </div>
      </div>

      {/* Table - Clean white with matching dashboard colors */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-lg overflow-hidden">
        {noResults ? (
          <div className="py-16 text-center">
            <div className="text-6xl mb-4 opacity-40">🔄</div>
            <div className="text-xl font-medium text-gray-500 mb-2">No Orders Found</div>
            <p className="text-gray-400">Try adjusting your search criteria or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {items.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-3 opacity-40">🔄</div>
                <p className="text-gray-500 font-medium">No orders available.</p>
              </div>
            ) : (
              <table className="w-full table-auto">
                {/* Define column widths ONCE here */}
                <colgroup>
                  <col className="w-[100px]" /> {/* ORDER ID */}
                  <col className="w-[100px]" /> {/* ITEM ID */}
                  <col className="w-[100px]" /> {/* UNIT COST */}
                  <col className="w-[100px]" />  {/* QTY */}
                  <col className="w-[100px]" /> {/* TOTAL VALUE */}
                  <col className="w-[100px]" /> {/* REORDER BY */}
                  <col className="w-[100px]" /> {/* STATUS */}
                  <col className="w-[100px]" /> {/* ACTIONS */}
                </colgroup>

                <thead style={{ backgroundColor: "#2a5540" }}>
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-white rounded-tl-2xl">
                      ORDER ID
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-white">
                      ITEM ID
                    </th>
                    {/* Numeric columns → right-aligned */}
                    <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-wider text-white">
                      UNIT COST
                    </th>
                    <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-wider text-white">
                      QTY
                    </th>
                    <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-wider text-white">
                      TOTAL VALUE
                    </th>
                    {/* Text column */}
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-white">
                      REORDER BY
                    </th>
                    {/* Status */}
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-white">
                      STATUS
                    </th>
                    {/* Match width + center like buttons */}
                    <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-white rounded-tr-2xl">
                      ACTIONS
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white">
                  {items.map((it) => (
                    <DisplayReorderItem
                      key={it._id}
                      item={it}
                      onDelete={handleDeleteFromState}
                      onEdit={(row) => {
                        setSelected(row);
                        setOpenEdit(true);
                      }}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      <UpdateRorderModal open={openEdit} onClose={() => setOpenEdit(false)} item={selected} onUpdated={fetchItems} />
    </div>
  );
}
