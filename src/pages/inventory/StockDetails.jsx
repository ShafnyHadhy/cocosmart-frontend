// StockDetails.jsx — mirrors PurchasedItemDetails.jsx style
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";

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
function DisplayStock({ stock, onDelete }) {
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
  const cellClass = "border border-gray-200 px-3 py-2 align-middle";

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
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
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
    <tr>
      <td className={`${cellClass} font-mono font-semibold text-indigo-600 bg-indigo-50/30`}>
        {stock_id}
      </td>
      <td className={cellClass}>{item_id}</td>
      <td className={cellClass}>{category}</td>
      <td className={cellClass}>{type}</td>
      <td className={cellClass}>{reason}</td>
      <td className={`${cellClass} text-right font-semibold`}>{qty}</td>
      <td className={`${cellClass} text-right text-emerald-700 font-semibold`}>
        {fmt2(tot_value)}
      </td>
      <td className={cellClass}>{date ? String(date).slice(0, 10) : ""}</td>
      <td className={cellClass}>{enter_by}</td>
      <td className={`${cellClass} w-[100px]`}>
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={deleteHandler}
            disabled={loading}
            className="text-red-700 transition-transform hover:scale-110 focus:scale-110 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
            title={loading ? "Deleting..." : "Delete"}
          >
            <FiTrash2 size={18} aria-hidden="true" />
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
      list = list.filter((s) =>
        Object.values(s).some((field) =>
          String(field ?? "").toLowerCase().includes(q)
        )
      );
    }

    setStocks(list);
    setNoResults(list.length === 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-300 to-slate-100 p-6 font-sans">
      {/* Header */}
      <div className="mb-6 rounded-3xl border border-white/40 bg-white/20 p-8 shadow-xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="min-w-[240px]">
            <h1 className="m-0 text-4xl font-bold tracking-tight text-white drop-shadow-sm sm:text-5xl">
              Stock Movements
            </h1>
            <p className="m-0 text-base text-white/80">
              Manage all stock in/out records
            </p>
          </div>
          <div className="flex gap-4">
            <div className="rounded-2xl border border-white/40 bg-white/90 px-6 py-4 text-center shadow-sm">
              <div className="text-2xl font-extrabold text-slate-800 sm:text-3xl">
                {totalStocks}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total Records
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/50 bg-white/90 p-4 shadow-sm backdrop-blur-md">
        <div className="flex w-full max-w-xl flex-1 gap-2">
          <input
            className="w-full rounded-xl border-2 border-black/10 bg-white/90 px-4 py-3 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search by stock ID, item ID, reason, category..."
          />
          <button
            className="rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 px-4 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/inventory/addStock"
            className="rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            Add Stock
          </Link>

          <button
            className="rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            onClick={handleDownloadStockPdf}
          >
            Download Report
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/50 bg-white/90 p-2 shadow-sm backdrop-blur-md">
        {noResults ? (
          <div className="py-12 text-center text-lg font-medium text-slate-500">
            No Records Found
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl">
            {stocks.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">No stock records found.</p>
            ) : (
              <table className="w-full border-separate text-sm [border-spacing:0]">
                <thead className="bg-[#2a5540] text-white">
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
                    ].map((h) => (
                      <th
                        key={h}
                        className="relative border-b border-white/10 px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider first:rounded-tl-xl last:rounded-tr-xl"
                      >
                        {h}
                        <span className="absolute right-0 top-1/4 hidden h-1/2 w-px bg-white/20 last-of-type:block" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white/90">
                  {stocks.map((s) => (
                    <DisplayStock
                      key={s._id}
                      stock={s}
                      onDelete={handleDeleteFromState}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
