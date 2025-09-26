// CocoProductDetails.jsx — Single-file Tailwind version (includes row component)
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";

// ===== Shared helpers & constants =====
// Works in both Vite (import.meta.env.VITE_API_BASE) and CRA (process.env.REACT_APP_API_BASE)
const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
  (typeof process !== 'undefined' && process.env && process.env.VITE_API_URL) ||
  "http://localhost:5000";
const LIST_URL = `${API_BASE}/api/cocoProducts`;
const LOW_STOCK_THRESHOLD = 10000; // match backend
const EXPIRY_SOON_DAYS = 30;

const fmt2 = (n) => {
  const v = Number(n);
  return Number.isFinite(v) ? v.toFixed(2) : "0.00";
};

const daysUntil = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d - today) / 86400000);
};

const isRestock = (it) => Number(it.qty_on_hand || 0) < LOW_STOCK_THRESHOLD;
const isExpiringSoonOrExpired = (it) => {
  if (!it.expire_date) return false;
  const now = new Date();
  const soon = new Date(now.getTime() + EXPIRY_SOON_DAYS * 24 * 60 * 60 * 1000);
  const d = new Date(it.expire_date);
  return d <= soon; // includes already expired
};

function getFilenameFromDisposition(disposition) {
  if (!disposition) return null;
  const m = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i.exec(disposition);
  return m && m[1] ? m[1].replace(/["']/g, "") : null;
}

async function fetchHandler() {
  const res = await axios.get(LIST_URL);
  console.log(res);
  return res.data; // expects { cocoProducts: [...] }
}

async function handleDownloadPdf() {
  try {
    const url = `${API_BASE}/api/cocoProducts/report/pdf`;
    const res = await axios.get(url, { responseType: "blob" });
    const blob = new Blob([res.data], { type: "application/pdf" });
    const suggested = getFilenameFromDisposition(res.headers["content-disposition"]);
    const fallback = `cocosmart-inventory-${new Date().toISOString().slice(0, 10)}.pdf`;
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
    alert("Sorry, could not download the report.");
  }
}

// ===== Row component (inlined) =====
function DisplayCocoProduct({ cocoProduct, onDelete }) {
  const {
    _id,
    pro_id,
    pro_name,
    pro_category,
    pro_uom,
    std_cost,
    qty_on_hand,
    qty_reserves,
    qty_reserved,
    expire_date,
    updated_at,
    updated_by,
  } = cocoProduct || {};

  const [loading, setLoading] = useState(false);
  const qtyReserved = qty_reserves ?? qty_reserved ?? 0;

  const du = daysUntil(expire_date);
  const isExpired = du !== null && du <= 0;
  const isExpiringSoon = du !== null && du > 0 && du <= EXPIRY_SOON_DAYS;
  const isLowStock = Number(qty_on_hand) < LOW_STOCK_THRESHOLD;

  const rowClass = [
    "text-sm",
    isExpired ? "border-l-4 border-l-red-600" : "",
    !isExpired && isExpiringSoon ? "border-l-4 border-l-amber-500" : "",
    isLowStock ? "bg-red-50 text-red-800" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const cellClass = "border border-gray-200 px-3 py-2 align-middle";

  const deleteHandler = async (e) => {
    e?.stopPropagation?.();
    if (loading) return;
    const name = pro_name || pro_id || "this item";

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
      await axios.delete(`${API_BASE}/api/cocoProducts/${encodeURIComponent(_id)}`);
      onDelete?.(_id);
      Swal.fire({ icon: "success", title: "Deleted!", timer: 1200, showConfirmButton: false });
    } catch (err) {
      console.error(err?.response?.data || err.message);
      Swal.fire({ icon: "error", title: "Delete failed", text: err?.response?.data?.message || "Try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <tr className={rowClass}>
      <td className={`${cellClass} font-mono font-semibold text-indigo-600 bg-indigo-50/30`}>{pro_id}</td>
      <td className={cellClass}>{pro_name}</td>
      <td className={cellClass}>{pro_category}</td>
      <td className={cellClass}>{pro_uom}</td>
      <td className={`${cellClass} text-right font-semibold text-emerald-700`}>{fmt2(std_cost)}</td>
      <td className={`${cellClass} text-right font-semibold`}>{qty_on_hand}</td>
      <td className={`${cellClass} text-right font-semibold`}>{qtyReserved}</td>
      <td className={cellClass}>
        {expire_date ? String(expire_date).slice(0, 10) : ""}
        {isExpired && (
          <span className="ml-2 inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Expired</span>
        )}
        {isExpiringSoon && !isExpired && (
          <span className="ml-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Expiring soon</span>
        )}
      </td>
      <td className={cellClass}>{updated_at ? String(updated_at).slice(0, 10) : ""}</td>
      <td className={cellClass}>{updated_by}</td>
      <td className={`${cellClass} w-[120px]`}> 
        <div className="flex items-center justify-center gap-2">
          <Link
           to={`/inventory/updateCocoProducts/${_id}`}
            className="text-green-700 transition-transform hover:scale-110 focus:scale-110 focus:outline-none print:hidden"
            title="Edit"
          >
            <FiEdit2 size={18} aria-hidden="true" />
            <span className="sr-only">Edit</span>
          </Link>

          <button
            type="button"
            onClick={deleteHandler}
            disabled={loading}
            className="text-red-700 transition-transform hover:scale-110 focus:scale-110 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none print:hidden"
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
export default function CocoProductDetails() {
  const [cocoProducts, setCocoProducts] = useState([]);
  const [allCocoProducts, setAllCocoProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [noResults, setNoResults] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");

  useEffect(() => {
    fetchHandler()
      .then((data) => {
        const list = data.cocoProducts || [];
        setCocoProducts(list);
        setAllCocoProducts(list);
      })
      .catch((err) => console.error("Fetch coco products failed:", err));
  }, []);

  const handleDeleteFromState = (id) => {
    setCocoProducts((prev) => prev.filter((p) => p._id !== id));
    setAllCocoProducts((prev) => prev.filter((p) => p._id !== id));
    if (noResults && cocoProducts.length > 0) setNoResults(false);
  };

  const totalProducts = allCocoProducts.length;
  const lowStockCount = allCocoProducts.filter(isRestock).length;

  const handleSearch = () => {
    const q = searchQuery.trim().toLowerCase();
    let list = [...allCocoProducts];

    if (selectedFilter === "restock") list = list.filter(isRestock);
    else if (selectedFilter === "expiring") list = list.filter(isExpiringSoonOrExpired);

    if (q) {
      list = list.filter((item) =>
        Object.values(item).some((field) => String(field ?? "").toLowerCase().includes(q))
      );
    }

    setCocoProducts(list);
    setNoResults(list.length === 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-300 to-slate-100 p-6 font-sans print:bg-white">
      {/* Header */}
      <div className="mb-6 rounded-3xl border border-white/40 bg-white/20 p-8 shadow-xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="min-w-[240px]">
            <h1 className="m-0 text-4xl font-bold tracking-tight text-white drop-shadow-sm sm:text-5xl">Coconut Products</h1>
            <p className="m-0 text-base text-white/80">Manage your product inventory and stock levels</p>
          </div>
          <div className="flex gap-4">
            <div className="rounded-2xl border border-white/40 bg-white/90 px-6 py-4 text-center shadow-sm">
              <div className="text-2xl font-extrabold text-slate-800 sm:text-3xl">{totalProducts}</div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Products</div>
            </div>
            <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-center shadow-sm">
              <div className="text-2xl font-extrabold text-red-600 sm:text-3xl">{lowStockCount}</div>
              <div className="text-xs font-semibold uppercase tracking-wide text-red-700">Low Stock</div>
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
            placeholder="Search by ID, name, or category..."
          />
          <button
            className="rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 px-4 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="rounded-xl border-2 border-black/10 bg-white/90 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="restock">Restock Needed</option>
            <option value="expiring">Expiring Soon</option>
          </select>

          <Link
            to="/inventory/addCocoProduct"
            className="rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            Add Product
          </Link>

          <button
            className="rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            onClick={handleDownloadPdf}
          >
            Download Report
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/50 bg-white/90 p-2 shadow-sm backdrop-blur-md">
        {noResults ? (
          <div className="py-12 text-center text-lg font-medium text-slate-500">No Products Found</div>
        ) : (
          <div className="overflow-x-auto rounded-xl">
            {cocoProducts.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">No products found.</p>
            ) : (
              <table className="w-full border-separate text-sm [border-spacing:0]">
                <thead className="bg-[#2a5540] text-white">
                  <tr>
                    {["PRODUCT ID","NAME","CATEGORY","UOM","COST","QTY ON HAND","QTY RESERVED","EXPIRY","UPDATED AT","UPDATED BY","ACTIONS"].map((h) => (
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
                  {cocoProducts.map((cocoProduct) => (
                    <DisplayCocoProduct
                      key={cocoProduct._id}
                      cocoProduct={cocoProduct}
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
