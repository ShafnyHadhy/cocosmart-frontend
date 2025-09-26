import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FiEdit2, FiTrash2, FiAlertTriangle, FiClock } from "react-icons/fi";
import Swal from "sweetalert2";

// Helper: 2-decimal formatter
const fmt2 = (n) => {
  const v = Number(n);
  return Number.isFinite(v) ? v.toFixed(2) : "0.00";
};

// Thresholds
const EXPIRING_SOON_DAYS = 30;

const daysUntil = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d - today) / 86400000);
};

export default function DisplayPurchasedItem({ item, onDelete }) {
  const {
    _id,
    item_id,
    item_name,
    category,
    item_unit,
    unit_cost,
    ROL,
    quantity,
    expire_date,
    supplier,
  } = item || {};

  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Status flags
  const du = daysUntil(expire_date);
  const isExpired = du !== null && du <= 0;
  const isExpiringSoon = du !== null && du > 0 && du <= EXPIRING_SOON_DAYS;
  const isBelowROL = Number(quantity) < Number(ROL || 0);

  const getRowStyle = () => {
    let baseClasses =
      "group relative transition-all duration-300 ease-out transform hover:scale-[1.01] hover:shadow-lg";

    if (isBelowROL) {
      return `${baseClasses} bg-gradient-to-r from-red-50/80 to-red-100/60 border-l-4 border-l-red-400 shadow-red-100/50 hover:shadow-red-200/70`;
    } else if (isExpired) {
      return `${baseClasses} bg-gradient-to-r from-orange-50/80 to-orange-100/60 border-l-4 border-l-orange-400 shadow-orange-100/50 hover:shadow-orange-200/70`;
    } else if (isExpiringSoon) {
      return `${baseClasses} bg-gradient-to-r from-amber-50/80 to-amber-100/60 border-l-4 border-l-amber-400 shadow-amber-100/50 hover:shadow-amber-200/70`;
    } else {
      return `${baseClasses} bg-gradient-to-r from-white/80 to-gray-50/60 hover:from-blue-50/40 hover:to-indigo-50/30 hover:shadow-blue-100/50`;
    }
  };

  const baseCellClass = "px-6 py-4 border-r border-gray-100 last:border-r-0 relative";

  const deleteHandler = async (e) => {
    e?.stopPropagation?.();
    if (loading) return;
    const name = item_name || item_id || "this item";

    const result = await Swal.fire({
      title: `Delete ${name}?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      background: "#ffffff",
      customClass: {
        popup: "rounded-2xl shadow-2xl",
        confirmButton: "rounded-xl px-6 py-3 font-semibold",
        cancelButton: "rounded-xl px-6 py-3 font-semibold",
      },
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      await axios.delete(
        `http://localhost:5000/api/purchasedItems/${encodeURIComponent(_id)}`
      );
      onDelete?.(_id);
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        timer: 1200,
        showConfirmButton: false,
        background: "#ffffff",
        customClass: { popup: "rounded-2xl shadow-2xl" },
      });
    } catch (err) {
      console.error(err?.response?.data || err.message);
      Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: err?.response?.data?.message || "Try again.",
        background: "#ffffff",
        customClass: { popup: "rounded-2xl shadow-2xl" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <tr
      className={getRowStyle()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Item ID chip */}
      <td className={`${baseCellClass} bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-sm`}>
        <div className="relative">
          <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold tracking-wider shadow-lg">
            {item_id}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur-sm opacity-30 -z-10" />
        </div>
      </td>

      {/* Item Name */}
      <td className={baseCellClass}>
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse" />
          <span className="font-semibold text-gray-800 text-base group-hover:text-green-700 transition-colors duration-200">
            {item_name}
          </span>
        </div>
      </td>

      {/* Category */}
      <td className={baseCellClass}>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300/50 shadow-sm hover:shadow-md transition-shadow duration-200">
          {category}
        </span>
      </td>

      {/* Unit */}
      <td className={`${baseCellClass} text-gray-600 font-medium`}>
        <span className="uppercase text-xs tracking-wider bg-gray-100 px-2 py-1 rounded-md">
          {item_unit}
        </span>
      </td>

      {/* Unit Cost */}
      <td className={`${baseCellClass} text-right`}>
        <div className="flex items-center justify-end space-x-1">
          <span className="text-xs text-gray-500 font-medium">$</span>
          <span className="text-lg font-bold text-green-600 tracking-tight">
            {fmt2(unit_cost)}
          </span>
        </div>
        <div className="absolute right-6 bottom-0 w-8 h-0.5 bg-gradient-to-r from-green-400 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
      </td>

      {/* ROL */}
      <td className={`${baseCellClass} text-right`}>
        <span className="text-base font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg">
          {Number(ROL ?? 0).toLocaleString()}
        </span>
      </td>

      {/* Quantity with gauge relative to ROL */}
      <td className={`${baseCellClass} text-right`}>
        <div className="flex flex-col items-end">
          <span className={`text-lg font-bold ${isBelowROL ? "text-red-600" : "text-blue-600"}`}>
            {Number(quantity ?? 0).toLocaleString()}
          </span>
          <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${isBelowROL ? "bg-gradient-to-r from-red-400 to-red-600" : "bg-gradient-to-r from-blue-400 to-blue-600"}`}
              style={{
                width: `${Math.min((Number(quantity || 0) / Math.max(Number(ROL || 0), 1)) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      </td>

      {/* Expiry badges */}
      <td className={baseCellClass}>
        <div className="flex flex-col space-y-2">
          <span className="text-sm font-medium text-gray-700">
            {expire_date ? String(expire_date).slice(0, 10) : "N/A"}
          </span>
          {isExpired && (
            <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold shadow-lg animate-pulse">
              <FiAlertTriangle className="w-3 h-3 mr-1" />
              EXPIRED
            </div>
          )}
          {isExpiringSoon && !isExpired && (
            <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold shadow-lg">
              <FiClock className="w-3 h-3 mr-1" />
              EXPIRING SOON
            </div>
          )}
        </div>
      </td>

      {/* Supplier */}
      <td className={`${baseCellClass} text-gray-600 text-sm font-medium`}>{supplier || "—"}</td>

      {/* Actions */}
      <td className={`${baseCellClass} w-32`}>
        <div className="flex items-center justify-center space-x-2">
          <Link
            to={`/inventory/updatePurchasedItems/${_id}`}
            className="group/btn relative p-3 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 hover:from-emerald-500 hover:to-green-600"
            title="Edit Item"
          >
            <FiEdit2 size={16} className="relative z-10" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 blur-md opacity-60 group-hover/btn:opacity-80 transition-opacity duration-200" />
            <span className="sr-only">Edit</span>
          </Link>

          <button
            type="button"
            onClick={deleteHandler}
            disabled={loading}
            className="group/btn relative p-3 rounded-xl bg-gradient-to-r from-red-400 to-red-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 hover:from-red-500 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
            title={loading ? "Deleting..." : "Delete Item"}
          >
            <FiTrash2
              size={16}
              className={`relative z-10 transition-transform duration-200 ${loading ? "animate-spin" : ""}`}
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-400 to-red-500 blur-md opacity-60 group-hover/btn:opacity-80 transition-opacity duration-200" />
            <span className="sr-only">Delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
}
