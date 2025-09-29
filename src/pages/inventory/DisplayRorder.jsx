// DisplayRorder.jsx
import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FiEdit2,
  FiTrash2,
  FiUser,
  FiDollarSign,
  FiHash,
  FiCheckCircle,
  FiXCircle,
  FiClock,
} from "react-icons/fi";
import Swal from "sweetalert2";

// ---- API base (works in Vite & CRA) ----
const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) ||
  (typeof process !== "undefined" && process.env && process.env.VITE_API_URL) ||
  "http://localhost:5000";

const RORDER_API = `${API_BASE}/api/rorders`;

// ---- Helpers ----
const fmt2 = (n) => {
  const v = Number(n);
  return Number.isFinite(v) ? v.toFixed(2) : "0.00";
};

const StatusBadge = ({ status }) => {
  const s = String(status || "").toLowerCase();
  const base =
    "inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold shadow-md text-white";
  if (s === "approved")
    return (
      <span className={`${base} bg-gradient-to-r from-emerald-400 to-green-600`}>
        <FiCheckCircle className="w-3 h-3" />
        APPROVED
      </span>
    );
  if (s === "rejected")
    return (
      <span className={`${base} bg-gradient-to-r from-rose-400 to-red-600`}>
        <FiXCircle className="w-3 h-3" />
        REJECTED
      </span>
    );
  return (
    <span className={`${base} bg-gradient-to-r from-amber-400 to-yellow-600`}>
      <FiClock className="w-3 h-3" />
      PENDING
    </span>
  );
};

const baseCellClass = "px-6 py-4 border-r border-gray-100 last:border-r-0 relative";

export default function DisplayRorder({ rorder, onDelete }) {
  const {
    _id,
    order_id,
    item_id,
    unit_cost,
    qty,
    tot_value,
    requested_by,
    status, // pending | approved | rejected
  } = rorder || {};

  const [loading, setLoading] = useState(false);

  const deleteHandler = async (e) => {
    e?.stopPropagation?.();
    if (loading) return;

    const titleName = order_id || item_id || "this reorder";

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
      await axios.delete(`${RORDER_API}/${encodeURIComponent(_id)}`);
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
    <tr className="group relative transition-all duration-300 ease-out transform hover:scale-[1.01] hover:shadow-lg bg-gradient-to-r from-white/80 to-gray-50/60 hover:from-blue-50/40 hover:to-indigo-50/30 hover:shadow-blue-100/50">
      {/* Order ID chip */}
      <td className={`${baseCellClass} bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-sm`}>
        <div className="relative">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold tracking-wider shadow-lg">
            <FiHash className="w-4 h-4" />
            {order_id || "—"}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur-sm opacity-30 -z-10" />
        </div>
      </td>

      {/* Item ID */}
      <td className={baseCellClass}>
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse" />
          <span className="font-semibold text-gray-800 text-base group-hover:text-green-700 transition-colors duration-200">
            {item_id || "—"}
          </span>
        </div>
      </td>

      {/* Unit Cost */}
      <td className={`${baseCellClass} text-right`}>
        <div className="flex items-center justify-end gap-1">
          <FiDollarSign className="w-4 h-4 text-gray-500" />
          <span className="text-lg font-bold text-gray-800">{fmt2(unit_cost)}</span>
        </div>
      </td>

      {/* Quantity */}
      <td className={`${baseCellClass} text-right`}>
        <span className="text-lg font-bold text-gray-800">{Number(qty ?? 0).toLocaleString()}</span>
        <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-indigo-600 transition-all duration-500"
            style={{ width: `${Math.min(Math.abs(Number(qty ?? 0)) / 100 * 10, 100)}%` }}
            title="Relative magnitude (visual only)"
          />
        </div>
      </td>

      {/* Total Value */}
      <td className={`${baseCellClass} text-right`}>
        <div className="flex items-center justify-end space-x-1">
          <span className="text-xs text-gray-500 font-medium">LKR</span>
          <span className="text-lg font-bold text-emerald-700 tracking-tight">
            {fmt2(tot_value)}
          </span>
        </div>
        <div className="absolute right-6 bottom-0 w-8 h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
      </td>

      {/* Requested By */}
      <td className={`${baseCellClass} text-gray-600 text-sm font-medium`}>
        <span className="inline-flex items-center">
          <FiUser className="w-4 h-4 mr-2 text-gray-500" />
          {requested_by || "—"}
        </span>
      </td>

      {/* Status */}
      <td className={baseCellClass}>
        <StatusBadge status={status} />
      </td>

      {/* Actions */}
      <td className={`${baseCellClass} w-32`}>
        <div className="flex items-center justify-center space-x-2">
          <Link
            to={`/rorders/${_id}/edit`}
            className="group/btn relative p-3 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 hover:from-emerald-500 hover:to-green-600"
            title="Edit Reorder"
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
            title={loading ? "Deleting..." : "Delete Reorder"}
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
