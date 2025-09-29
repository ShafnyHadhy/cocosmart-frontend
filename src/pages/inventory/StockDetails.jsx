// StockDetails.jsx — Light theme matching dashboard
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FiTrash2, FiEdit2 } from "react-icons/fi";
import Swal from "sweetalert2";
import UpdateStockModal from "./UpdateStockModal.jsx";

// ===== Shared helpers & constants =====
const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_URL) ||
  (typeof process !== "undefined" && process.env && process.env.VITE_API_URL) ||
  "http://localhost:5000";

const LIST_URL = `${API_BASE}/api/stocks`;

const fmt2 = (n) => {
  const v = Number(String(n).replace(/,/g, ""));
  return Number.isFinite(v)
    ? new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(v)
    : "0.00";
};

// ===== PDF Helpers =====
function getFilenameFromDisposition(disposition) {
  if (!disposition) return null;
  const m = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i.exec(disposition);
  return m && m[1] ? m[1].replace(/["']/g, "") : null;
}

async function handleDownloadStockPdf() {
  try {
    const url = `${API_BASE}/api/stocks/report/pdf`;
    const res = await axios.get(url, { responseType: "blob" });

    const blob = new Blob([res.data], { type: "application/pdf" });
    const suggested = getFilenameFromDisposition(
      res.headers["content-disposition"]
    );
    const fallback = `stocks-report-${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`;
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
    alert("Sorry, could not download the Stock report.");
  }
}

// ===== Row component =====
function DisplayStock({ stock, onDelete, onEdit }) {
  const {
    _id,
    stock_id,
    item_id,
    category,
    type,
    reason,
    qty,
    tot_value,
    date,
    enter_by,
  } = stock || {};

  const [loading, setLoading] = useState(false);

  const rowClass = ["text-sm hover:bg-green-50/30 transition-colors"]
    .filter(Boolean)
    .join(" ");

  const cellClass = "border-b border-gray-100 px-4 py-3 align-middle";

  const deleteHandler = async (e) => {
    e?.stopPropagation?.();
    if (loading) return;

    const name = stock_id || item_id || "this stock record";

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
      await axios.delete(`${API_BASE}/api/stocks/${encodeURIComponent(_id)}`);
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
      <td
        className={`${cellClass} font-mono font-semibold text-green-700 bg-green-50/40`}
      >
        {stock_id}
      </td>
      <td className={`${cellClass} font-medium text-gray-800`}>{item_id}</td>
      <td className={`${cellClass} text-gray-700 font-medium`}>{category}</td>
      <td className={`${cellClass} text-gray-700 font-medium`}>{type}</td>
      <td className={`${cellClass} text-gray-700 font-medium`}>{reason}</td>
      <td className={`${cellClass} text-right font-semibold text-gray-800`}>
        {qty}
      </td>
      <td className={`${cellClass} text-right text-green-700 font-semibold`}>
        LKR {fmt2(tot_value)}
      </td>
      <td className={`${cellClass} text-gray-700 font-medium`}>
        {date ? String(date).slice(0, 10) : "—"}
      </td>
      <td className={`${cellClass} text-gray-700 font-medium`}>{enter_by}</td>
      <td className={`${cellClass} w-[140px]`}>
        <div className="flex items-center justify-center gap-3">
          {/* EDIT button (opens modal) */}
          <button
            type="button"
            onClick={() => onEdit?.(_id)}
            className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800 transition-all duration-200 hover:scale-110 focus:scale-110"
            title="Edit"
          >
            <FiEdit2 size={16} aria-hidden="true" />
            <span className="sr-only">Edit</span>
          </button>

          {/* DELETE button */}
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
export default function StockDetails() {
  const [stocks, setStocks] = useState([]);
  const [allStocks, setAllStocks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [noResults, setNoResults] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");

  // modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchStocks = async () => {
    const { data } = await axios.get(LIST_URL);
    const list = data?.stocks || data;
    const safe = Array.isArray(list) ? list : [];
    setStocks(safe);
    setAllStocks(safe);
  };
  useEffect(() => {
    fetchStocks();
  }, []);

  const handleDeleteFromState = (id) => {
    setStocks((prev) => prev.filter((s) => s._id !== id));
    setAllStocks((prev) => prev.filter((s) => s._id !== id));
    if (noResults && stocks.length > 0) setNoResults(false);
  };

  const totalStocks = allStocks.length;

  const handleSearch = () => {
    const q = searchQuery.trim().toLowerCase();
    let list = [...allStocks];

    if (q) {
      if (selectedFilter === "category") {
        list = list.filter((s) =>
          String(s.category ?? "").toLowerCase().includes(q)
        );
      } else if (selectedFilter === "type") {
        list = list.filter((s) =>
          String(s.type ?? "").toLowerCase().includes(q)
        );
      } else if (selectedFilter === "reason") {
        list = list.filter((s) =>
          String(s.reason ?? "").toLowerCase().includes(q)
        );
      } else {
        // "all"
        list = list.filter((s) =>
          [s.stock_id, s.item_id, s.category, s.type, s.reason, s.enter_by]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q))
        );
      }
    }

    setStocks(list);
    setNoResults(list.length === 0);
  };

  // auto-filter when typing / changing dropdown, but only after data is loaded
  useEffect(() => {
    if (!allStocks.length) return; // wait until fetch populated data
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedFilter, allStocks]);

  return (
    <div
      className="min-h-screen p-6 font-sans"
      style={{ backgroundColor: "#f5f5f5" }}
    >
      {/* Header - Light like dashboard */}
      <div
        className="mb-8 rounded-3xl bg-white p-5 shadow-lg border-2"
        style={{ borderColor: "#2a5540" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="min-w-[280px]">
            <h1
              className="m-0 text-4xl font-bold tracking-tight sm:text-5xl"
              style={{ color: "#2a5540" }}
            >
              Stock Movements 📊
            </h1>
            <p className="m-0 text-lg text-gray-600 mt-2 font-medium">
              Manage all stock in/out records
            </p>
          </div>
          <div className="flex gap-6">
            {/* Total Records Card - Clean white with green accent */}
            <div
              className="bg-white rounded-2xl border-2 px-5 py-5 h-28 text-center shadow-md"
              style={{ borderColor: "#2a5540" }}
            >
              <div
                className="text-3xl font-extrabold sm:text-4xl"
                style={{ color: "#2a5540" }}
              >
                {totalStocks}
              </div>
              <div className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                Total Records
              </div>
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
            placeholder="Search by stock ID, item ID, reason, category..."
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
            title="Filter scope"
          >
            <option value="all">All Stock</option>
            <option value="category">Category</option>
            <option value="type">Type</option>
            <option value="reason">Reason</option>
          </select>

          {/* Add Stock Button */}
          <Link
            to="/inventory/addStock"
            className="rounded-xl px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            style={{ backgroundColor: "#2a5540" }}
          >
            Add Stock
          </Link>

          {/* Download Button */}
          <button
            className="rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            style={{ backgroundColor: "#16a34a" }}
            onClick={handleDownloadStockPdf}
          >
            Download Report
          </button>
        </div>
      </div>

      {/* Table - Clean white with matching dashboard colors */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-lg overflow-hidden">
        {noResults ? (
          <div className="py-16 text-center">
            <div className="text-6xl mb-4 opacity-40">📊</div>
            <div className="text-xl font-medium text-gray-500 mb-2">
              No Records Found
            </div>
            <p className="text-gray-400">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {stocks.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-3 opacity-40">📊</div>
                <p className="text-gray-500 font-medium">
                  No stock records found.
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead style={{ backgroundColor: "#2a5540" }}>
                  <tr>
                    {[
                      "STOCK ID",
                      "ITEM ID",
                      "CATEGORY",
                      "TYPE",
                      "REASON",
                      "QTY",
                      "TOTAL VALUE",
                      "DATE",
                      "ENTERED BY",
                      "ACTIONS",
                    ].map((h, index) => (
                      <th
                        key={h}
                        className={`px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-white ${
                          index === 0
                            ? "rounded-tl-2xl"
                            : index === 9
                            ? "rounded-tr-2xl"
                            : ""
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {stocks.map((s) => (
                    <DisplayStock
                      key={s._id}
                      stock={s}
                      onDelete={handleDeleteFromState}
                      onEdit={(id) => {
                        setEditingId(id);
                        setEditOpen(true);
                      }}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      <UpdateStockModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        stockId={editingId}
        onUpdated={fetchStocks}
      />
    </div>
  );
}
