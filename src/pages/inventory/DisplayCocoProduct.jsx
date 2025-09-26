import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";

// Helper: 2-decimal formatter
const fmt2 = (n) => {
  const v = Number(n);
  return Number.isFinite(v) ? v.toFixed(2) : "0.00";
};

// Thresholds
const LOW_STOCK_THRESHOLD = 100000; // adjust as needed
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

export default function DisplayCocoProduct({ cocoProduct, onDelete }) {
  const {
    _id,
    pro_id,
    pro_name,
    pro_category,
    pro_uom,
    // pro_description,
    std_cost,
    // sell_price,
    qty_on_hand,
    qty_reserves, // current API name in some cases
    qty_reserved, // tolerate alternate name
    expire_date,
    updated_at,
    updated_by,
  } = cocoProduct || {};

  const [loading, setLoading] = useState(false);
  const qtyReserved = qty_reserves ?? qty_reserved ?? 0;

  // Expiry/stock flags
  const du = daysUntil(expire_date);
  const isExpired = du !== null && du <= 0;
  const isExpiringSoon = du !== null && du > 0 && du <= EXPIRING_SOON_DAYS;
  const isLowStock = Number(qty_on_hand) < LOW_STOCK_THRESHOLD;

  const rowClass = [
    // base row look
    "text-sm",
    // left accent for expiry status
    isExpired ? "border-l-4 border-l-red-600" : "",
    !isExpired && isExpiringSoon ? "border-l-4 border-l-amber-500" : "",
    // low stock background wins
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
      await axios.delete(
        `http://localhost:5000/api/cocoProducts/${encodeURIComponent(_id)}`
      );
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
      <td className={cellClass}>{pro_id}</td>
      <td className={cellClass}>{pro_name}</td>
      <td className={cellClass}>{pro_category}</td>
      <td className={cellClass}>{pro_uom}</td>
      {/* <td className={cellClass}>{pro_description}</td> */}
      <td className={cellClass}>{fmt2(std_cost)}</td>
      {/* <td className={`${cellClass} text-right`}>{fmt2(sell_price)}</td> */}
      <td className={cellClass}>{qty_on_hand}</td>
      <td className={cellClass}>{qtyReserved}</td>
      <td className={cellClass}>
        {expire_date ? String(expire_date).slice(0, 10) : ""}
        {isExpired && (
          <span className="ml-2 inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
            Expired
          </span>
        )}
        {isExpiringSoon && !isExpired && (
          <span className="ml-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            Expiring soon
          </span>
        )}
      </td>
      <td className={cellClass}>{updated_at ? String(updated_at).slice(0, 10) : ""}</td>
      <td className={cellClass}>{updated_by}</td>
      <td className={`${cellClass} w-[80px]`}> 
        <div className="flex items-center justify-center gap-2">
          <Link
            to={`/inventory/updateCocoProducts/${_id}`}
            className="text-green-700 transition-transform hover:scale-110 focus:scale-110 focus:outline-none"
            title="Edit"
          >
            <FiEdit2 size={18} aria-hidden="true" />
            <span className="sr-only">Edit</span>
          </Link>

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
