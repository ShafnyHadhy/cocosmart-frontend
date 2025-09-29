// DisplayStock.jsx
import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FiEdit2,
  FiTrash2,
  FiAlertTriangle,
  FiArrowDownCircle,
  FiArrowUpCircle,
  FiCalendar,
  FiUser,
} from "react-icons/fi";
import Swal from "sweetalert2";

// ---- API base (works in Vite & CRA) ----
const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_URL) ||
  (typeof process !== "undefined" && process.env && process.env.VITE_API_URL) ||
  "http://localhost:5000";

// Adjust if your route differs (e.g., /api/stock-movements)
const STOCK_API = `${API_BASE}/api/stock`;

// ---- Helpers ----
const fmt2 = (n) => {
  const v = Number(n);
  return Number.isFinite(v) ? v.toFixed(2) : "0.00";
};

const numberize = (n) => Number(n ?? 0);

// Visual: in → green, out → red, other → blue/gray
const getRowStyleByType = (type, isWastage) => {
  const base =
    "group relative transition-all duration-300 ease-out transform hover:scale-[1.01] hover:shadow-lg";
  const t = String(type || "").toLowerCase();

  if (isWastage) {
    return `${base} bg-gradient-to-r from-orange-50/80 to-orange-100/60 border-l-4 border-l-orange-400 shadow-orange-100/50 hover:shadow-orange-200/70`;
  }
  if (t === "in") {
    return `${base} bg-gradient-to-r from-emerald-50/80 to-green-100/60 border-l-4 border-l-emerald-400 shadow-emerald-100/50 hover:shadow-emerald-200/70`;
  }
  if (t === "out") {
    return `${base} bg-gradient-to-r from-rose-50/80 to-red-100/60 border-l-4 border-l-rose-400 shadow-rose-100/50 hover:shadow-rose-200/70`;
  }
  return `${base} bg-gradient-to-r from-white/80 to-gray-50/60 hover:from-blue-50/40 hover:to-indigo-50/30 hover:shadow-blue-100/50`;
};

const baseCellClass =
  "px-6 py-4 border-r border-gray-100 last:border-r-0 relative";

export default function DisplayStock({ stock, onDelete }) {
  const {
    _id,
    stock_id,
    item_id,
    category,
    type, // "in" | "out"
    reason, // e.g., "purchase", "wastage", "adjustment"
    qty, // number
    tot_value, // number
    date, // ISO string / Date
    enter_by, // user
  } = stock || {};

  const [loading, setLoading] = useState(false);

  const isWastage = /wastage|waste|expired|damage/i.test(String(reason || ""));
  const isOut = String(type || "").toLowerCase() === "out";
  const isIn = String(type || "").toLowerCase() === "in";

  const rowClass = getRowStyleByType(type, isWastage);

  const deleteHandler = async (e) => {
    e?.stopPropagation?.();
    if (loading) return;

    const titleName = stock_id || item_id || "this movement";

    const result = await Swal.fire({
      title: `Delete ${titleName}?`,
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
      await axios.delete(`${STOCK_API}/${encodeURIComponent(_id)}`);
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
    <tr className={rowClass}>
      {/* Stock ID chip */}
      <td
        className={`${baseCellClass} bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-sm`}
      >
        <div className="relative">
          <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold tracking-wider shadow-lg">
            {stock_id || "—"}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur-sm opacity-30 -z-10" />
        </div>
      </td>

      {/* Item ID */}
      <td className={baseCellClass}>
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse" />
          <span className="font-semibold text-gray-800 text-base group-hover:text-green-700 transition-colors duration-200">
            {item_id}
          </span>
        </div>
      </td>

      {/* Category */}
      <td className={baseCellClass}>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300/50 shadow-sm hover:shadow-md transition-shadow duration-200">
          {category || "—"}
        </span>
      </td>

      {/* Type badge */}
      {/* Type badge */}
      <td className={baseCellClass}>
        <div
          className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold shadow-md text-white bg-gradient-to-r ${
            isIn
              ? "from-emerald-400 to-green-500"
              : isOut
              ? "from-rose-400 to-red-500"
              : "from-slate-400 to-gray-500"
          }`}
        >
          {isIn ? (
            <FiArrowDownCircle className="w-3 h-3 mr-1" />
          ) : (
            <FiArrowUpCircle className="w-3 h-3 mr-1" />
          )}
          {(type || "").toString().toUpperCase() || "—"}
        </div>

        {isWastage && (
          <div className="mt-2 inline-flex items-center px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[11px] font-semibold shadow">
            <FiAlertTriangle className="w-3 h-3 mr-1" />
            WASTAGE
          </div>
        )}
      </td>

      {/* Reason */}
      <td className={`${baseCellClass} text-gray-700 font-medium`}>
        {reason || "—"}
      </td>

      {/* Quantity (signed visual) */}
      <td className={`${baseCellClass} text-right`}>
        <div className="flex flex-col items-end">
          <span
            className={`text-lg font-bold ${
              isOut ? "text-red-600" : "text-green-700"
            }`}
          >
            {isOut ? "-" : "+"}
            {numberize(qty).toLocaleString()}
          </span>
          <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isOut
                  ? "bg-gradient-to-r from-red-400 to-red-600"
                  : "bg-gradient-to-r from-green-400 to-green-600"
              }`}
              style={{
                width: `${Math.min(
                  (Math.abs(numberize(qty)) / 100) * 10,
                  100
                )}%`,
              }}
              title="Relative magnitude (visual only)"
            />
          </div>
        </div>
      </td>

      {/* Total value */}
      <td className={`${baseCellClass} text-right`}>
        <div className="flex items-center justify-end space-x-1">
          <span className="text-xs text-gray-500 font-medium">$</span>
          <span className="text-lg font-bold text-emerald-700 tracking-tight">
            {fmt2(tot_value)}
          </span>
        </div>
        <div className="absolute right-6 bottom-0 w-8 h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
      </td>

      {/* Date */}
      <td className={baseCellClass}>
        <div className="flex flex-col space-y-1">
          <span className="text-sm font-medium text-gray-700">
            {date ? String(date).slice(0, 10) : "N/A"}
          </span>
          <div className="inline-flex items-center text-[11px] text-gray-500">
            <FiCalendar className="w-3 h-3 mr-1" />
            {date ? new Date(date).toLocaleTimeString() : "—"}
          </div>
        </div>
      </td>

      {/* Entered by */}
      <td className={`${baseCellClass} text-gray-600 text-sm font-medium`}>
        <span className="inline-flex items-center">
          <FiUser className="w-4 h-4 mr-2 text-gray-500" />
          {enter_by || "—"}
        </span>
      </td>

      {/* Actions */}
      <td className={`${baseCellClass} w-32`}>
        <div className="flex items-center justify-center space-x-2">
          <Link
            to={`/inventory/updateStock/${_id}`}
            className="group/btn relative p-3 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 hover:from-emerald-500 hover:to-green-600"
            title="Edit Movement"
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
            title={loading ? "Deleting..." : "Delete Movement"}
          >
            <FiTrash2
              size={16}
              className={`relative z-10 transition-transform duration-200 ${
                loading ? "animate-spin" : ""
              }`}
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-400 to-red-500 blur-md opacity-60 group-hover/btn:opacity-80 transition-opacity duration-200" />
            <span className="sr-only">Delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
}
