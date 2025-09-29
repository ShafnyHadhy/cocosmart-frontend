// DisplaySupplier.jsx — animated row for SupplierDetails table
import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FiEdit2, FiTrash2, FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import Swal from "sweetalert2";

export default function DisplaySupplier({ supplier, onDelete }) {
  const { _id, sup_id, sup_name, email, contact, address } = supplier || {};
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getRowStyle = () => {
    const base =
      "group relative transition-all duration-300 ease-out transform hover:scale-[1.01] hover:shadow-lg";
    // Neutral/clean style for directory rows
    return `${base} bg-gradient-to-r from-white/80 to-gray-50/60 hover:from-blue-50/40 hover:to-indigo-50/30 hover:shadow-blue-100/50 border-l-4 border-l-indigo-300`;
  };

  const baseCellClass =
    "px-6 py-4 border-r border-gray-100 last:border-r-0 relative";

  const deleteHandler = async (e) => {
    e?.stopPropagation?.();
    if (loading) return;

    const name = sup_name || sup_id || "this supplier";

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
        `http://localhost:5000/api/suppliers/${encodeURIComponent(_id)}`
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
      {/* Supplier ID with gradient badge */}
      <td
        className={`${baseCellClass} bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-sm`}
      >
        <div className="relative">
          <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold tracking-wider shadow-lg">
            {sup_id}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur-sm opacity-30 -z-10"></div>
        </div>
      </td>

      {/* Supplier Name */}
      <td className={baseCellClass}>
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse"></div>
          <span className="font-semibold text-gray-800 text-base group-hover:text-green-700 transition-colors duration-200">
            {sup_name}
          </span>
        </div>
      </td>

      {/* Email */}
      <td className={baseCellClass}>
        {email ? (
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-2 text-indigo-700 hover:text-indigo-800 underline decoration-indigo-300 underline-offset-2"
            title="Send email"
          >
            <FiMail className="w-4 h-4" />
            <span className="truncate max-w-[220px] sm:max-w-[280px]">
              {email}
            </span>
          </a>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>

      {/* Contact */}
      <td className={baseCellClass}>
        {contact ? (
          <a
            href={`tel:${contact}`}
            className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900"
            title="Call"
          >
            <FiPhone className="w-4 h-4" />
            <span className="font-medium tracking-wide">{contact}</span>
          </a>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>

      {/* Address */}
      <td className={baseCellClass}>
        <div className="flex items-start gap-2 text-gray-700">
          <FiMapPin className="mt-0.5 w-4 h-4 text-rose-500" />
          <span
            className="line-clamp-2 max-w-[340px] sm:max-w-[420px]"
            title={address}
          >
            {address || "—"}
          </span>
        </div>
      </td>

      {/* Actions */}
      <td className={`${baseCellClass} w-32`}>
        <div className="flex items-center justify-center space-x-2">
          <Link
            to={`/inventory/updateSupplier/${_id}`}
            className="group/btn relative p-3 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 hover:from-emerald-500 hover:to-green-600"
            title="Edit Supplier"
          >
            <FiEdit2 size={16} className="relative z-10" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 blur-md opacity-60 group-hover/btn:opacity-80 transition-opacity duration-200"></div>
            <span className="sr-only">Edit</span>
          </Link>

          <button
            type="button"
            onClick={deleteHandler}
            disabled={loading}
            className="group/btn relative p-3 rounded-xl bg-gradient-to-r from-red-400 to-red-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 hover:from-red-500 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
            title={loading ? "Deleting..." : "Delete Supplier"}
          >
            <FiTrash2
              size={16}
              className={`relative z-10 transition-transform duration-200 ${
                loading ? "animate-spin" : ""
              }`}
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-400 to-red-500 blur-md opacity-60 group-hover/btn:opacity-80 transition-opacity duration-200"></div>
            <span className="sr-only">Delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
}
