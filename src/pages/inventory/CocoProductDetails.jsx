// CocoProductDetails.jsx — UI matching PurchasedItemDetails
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";
import UpdateCocoProductModal from "./UpdateCocoProductModal.jsx";
import { MdQrCode2 } from "react-icons/md";
import QrCodeModal from "../../components/Nav/QrCodeModal.jsx";


import { useMemo } from "react";


// ===== Shared helpers & constants =====
// Works in both Vite (import.meta.env.VITE_API_BASE) and CRA (process.env.REACT_APP_API_BASE)
const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
  (typeof process !== 'undefined' && process.env && process.env.VITE_API_URL) ||
  "http://localhost:5000";
const LIST_URL = `${API_BASE}/api/cocoProducts`;
const LOW_STOCK_THRESHOLD = 150; // match backend
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
function DisplayCocoProduct({ cocoProduct, onDelete, onEdit, onShowQr }) {

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
    "text-sm hover:bg-green-50/30 transition-colors",
    isExpired ? "border-l-4 border-l-red-500" : "",
    !isExpired && isExpiringSoon ? "border-l-4 border-l-amber-500" : "",
    isLowStock ? "bg-red-50/100 text-red-900" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const cellClass = "border-b border-gray-100 px-4 py-3 align-middle";

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
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#2a5540",
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
      <td className={`${cellClass} font-mono font-semibold text-green-700 bg-green-50/40`}>{pro_id}</td>
      <td className={`${cellClass} font-medium text-gray-800`}>{pro_name}</td>
      <td className={cellClass}>{pro_category}</td>
      <td className={`${cellClass} uppercase text-sm font-medium text-gray-600`}>{pro_uom}</td>
      <td className={`${cellClass} text-right font-semibold text-green-700`}>{fmt2(std_cost)}</td>
      <td className={`${cellClass} text-right font-semibold ${isLowStock ? 'text-red-700' : 'text-gray-800'}`}>{qty_on_hand}</td>
      <td className={`${cellClass} text-right font-semibold`}>{qtyReserved}</td>
      <td className={cellClass}>
        <div className="flex items-center">
          <span className="text-gray-700">
            {expire_date ? String(expire_date).slice(0, 10) : "—"}
          </span>
          {isExpired && (
            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
              Expired
            </span>
          )}
          {isExpiringSoon && !isExpired && (
            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
              Expiring soon
            </span>
          )}
        </div>
      </td>
      <td className={`${cellClass} text-gray-700 font-medium`}>{updated_at ? String(updated_at).slice(0, 10) : ""}</td>
      <td className={`${cellClass} text-gray-700 font-medium`}>{updated_by}</td>
      <td className={`${cellClass} w-[120px]`}>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onEdit?.(cocoProduct)}
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
          <button
  type="button"
  onClick={() => onShowQr?.(cocoProduct)}
  className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700 transition-all duration-200 hover:scale-110 focus:scale-110 focus:outline-none"
  title="Show QR"
>
  <MdQrCode2 size={18} aria-hidden="true" />
  <span className="sr-only">Show QR</span>
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
  const [editOpen, setEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

const [qrOpen, setQrOpen] = useState(false);
const [qrProId, setQrProId] = useState(null);

const openQr = (item) => { setQrProId(item.pro_id); setQrOpen(true); };
const closeQr = () => { setQrOpen(false); setQrProId(null); };

const currentQrItem = useMemo(
  () => allCocoProducts.find(p => String(p.pro_id) === String(qrProId)) || null,
  [qrProId, allCocoProducts]
);


  useEffect(() => {
    fetchHandler()
      .then((data) => {
        const list = data.cocoProducts || [];
        setCocoProducts(list);
        setAllCocoProducts(list);
      })
      .catch((err) => console.error("Fetch coco products failed:", err));
  }, []);

  const openEdit = (item) => { setSelectedItem(item); setEditOpen(true); };
  const closeEdit = () => { setEditOpen(false); setSelectedItem(null); };
  const reloadAfterUpdate = async () => {
    try {
      const data = await fetchHandler();
      const list = data.cocoProducts || [];
      setCocoProducts(list);
      setAllCocoProducts(list);
    } catch (e) {
      console.error("Reload failed:", e);
    }
  };

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

  // Apply filter dropdowns (restock / expiring)
  if (selectedFilter === "restock") list = list.filter(isRestock);
  else if (selectedFilter === "expiring") list = list.filter(isExpiringSoonOrExpired);

  // Prefix-based search on product name
  if (q) {
    list = list.filter((item) => {
      const name = String(item.pro_name || "").toLowerCase();
      return name.startsWith(q); // only match names that BEGIN with query
    });
  }

  setCocoProducts(list);
  setNoResults(list.length === 0);
};


  // auto-filter when typing / changing dropdown, but only after data is loaded
  useEffect(() => {
    if (!allCocoProducts.length) return;   // wait until fetch populated data
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedFilter, allCocoProducts]);

  return (
    <div className="min-h-screen p-6 font-sans" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Header - Light like dashboard */}
      <div className="mb-8 rounded-3xl bg-white p-5 shadow-lg border-2" style={{ borderColor: '#2a5540' }}>
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="min-w-[280px]">
            <h1
              className="m-0 text-4xl font-bold tracking-tight sm:text-5xl"
              style={{ color: '#2a5540' }}
            >
              Coconut Products 🥥
            </h1>
            <p className="m-0 text-lg text-gray-600 mt-2 font-medium">
              Manage your product inventory and stock levels
            </p>
          </div>
          <div className="flex gap-6">
            {/* Total Products Card - Clean white with green accent */}
            <div className="bg-white rounded-2xl border-2 px-5 py-5 h-28 text-center shadow-md" style={{ borderColor: '#2a5540' }}>
              <div
                className="text-3xl font-extrabold sm:text-4xl"
                style={{ color: '#2a5540' }}
              >
                {totalProducts}
              </div>
              <div className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                Total Products
              </div>
            </div>

            {/* Low Stock Card - Prominent red warning */}
            <div
              className={`bg-white rounded-2xl border-2 px-4 py-5 h-28 text-center shadow-md relative ${
                lowStockCount > 0
                  ? 'border-red-300 shadow-red-100'
                  : 'border-gray-200'
              }`}
            >
              {lowStockCount > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              )}
              <div className="text-3xl font-extrabold text-red-600 sm:text-4xl flex items-center justify-center gap-2">
                {lowStockCount > 0 && <span>⚠️</span>}
                {lowStockCount}
              </div>
              <div className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                Low Stock
              </div>
              {lowStockCount > 0 && (
                <div className="text-xs font-medium text-red-600 mt-1">
                  Needs Attention!
                </div>
              )}
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
            placeholder="Search by ID, name, or category..."
            onFocus={(e) => {
              e.target.style.borderColor = '#2a5540';
              e.target.style.backgroundColor = '#ffffff';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.backgroundColor = '#f9fafb';
            }}
          />
          <button
            className="rounded-xl px-6 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            style={{ backgroundColor: '#2a5540' }}
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
              e.target.style.borderColor = '#2a5540';
              e.target.style.backgroundColor = '#ffffff';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.backgroundColor = '#f9fafb';
            }}
          >
            <option value="all">All Types</option>
            <option value="restock">Restock Needed</option>
            <option value="expiring">Expiring Soon</option>
          </select>

          {/* Add Product Button */}
          <Link
            to="/inventory/addCocoProduct"
            className="rounded-xl px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            style={{ backgroundColor: '#2a5540' }}
          >
            Add Product
          </Link>

          {/* Download Button */}
          <button
            className="rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            style={{ backgroundColor: '#16a34a' }}
            onClick={handleDownloadPdf}
          >
            Download Report
          </button>
        </div>
      </div>

      {/* Table - Clean white with matching dashboard colors */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-lg overflow-hidden">
        {noResults ? (
          <div className="py-16 text-center">
            <div className="text-6xl mb-4 opacity-40">🥥</div>
            <div className="text-xl font-medium text-gray-500 mb-2">No Products Found</div>
            <p className="text-gray-400">Try adjusting your search criteria or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {cocoProducts.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-3 opacity-40">🥥</div>
                <p className="text-gray-500 font-medium">No products available.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead style={{ backgroundColor: '#2a5540' }}>
                  <tr>
                    {[
                      "PRODUCT ID",
                      "NAME",
                      "CATEGORY",
                      "UOM",
                      "COST",
                      "QTY ON HAND",
                      "QTY RESERVED",
                      "EXPIRY",
                      "UPDATED AT",
                      "UPDATED BY",
                      "ACTIONS",
                    ].map((h, index) => (
                      <th
                        key={h}
                        className={`px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-white ${
                          index === 0 ? 'rounded-tl-2xl' :
                          index === 10 ? 'rounded-tr-2xl' : ''
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {cocoProducts.map((cocoProduct) => (
                    <DisplayCocoProduct
                      key={cocoProduct._id}
                      cocoProduct={cocoProduct}
                      onDelete={handleDeleteFromState}
                      onEdit={openEdit}
                      onShowQr={openQr} 
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal — after the card, before page container closes */}
      <UpdateCocoProductModal
        open={editOpen}
        onClose={closeEdit}
        item={selectedItem}
        onUpdated={reloadAfterUpdate}
      />

      <QrCodeModal
  open={qrOpen}
  onClose={closeQr}
  product={currentQrItem}
/>
    </div>
  );
}
