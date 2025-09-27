// SupplierDetails.jsx — mirrors your CocoProductDetails/PurchasedItemDetails style
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";

// ===== Shared helpers & constants =====
// Works in both Vite (import.meta.env.VITE_API_URL) and CRA (process.env.VITE_API_URL)
const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) ||
  (typeof process !== "undefined" && process.env && process.env.VITE_API_URL) ||
  "http://localhost:5000";

const LIST_URL = `${API_BASE}/api/suppliers`;

async function fetchHandler() {
  const res = await axios.get(LIST_URL);
  // expect { suppliers: [...] }; fallback if API returns raw array
  return res.data?.suppliers ?? res.data ?? [];
}

// ===== Row component (inlined) =====
function DisplaySupplier({ supplier, onDelete }) {
  const { _id, sup_id, sup_name, email, contact, address } = supplier || {};
  const [loading, setLoading] = useState(false);

  const cellClass = "border border-gray-200 px-3 py-2 align-middle";

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
      cancelButtonColor: "#64748b",
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      await axios.delete(`${API_BASE}/api/suppliers/${encodeURIComponent(_id)}`);
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
    <tr className="text-sm">
      <td className={`${cellClass} font-mono font-semibold text-indigo-600 bg-indigo-50/30`}>{sup_id}</td>
      <td className={cellClass}>{sup_name}</td>
      <td className={cellClass}>
        {email ? (
          <a href={`mailto:${email}`} className="text-indigo-700 underline decoration-indigo-300 underline-offset-2">
            {email}
          </a>
        ) : (
          ""
        )}
      </td>
      <td className={cellClass}>{contact}</td>
      <td className={cellClass}>{address}</td>
      <td className={`${cellClass} w-[120px]`}>
        <div className="flex items-center justify-center gap-2">
          <Link
            to={`/inventory/updateSupplier/${_id}`}
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
export default function SupplierDetails() {
  const [suppliers, setSuppliers] = useState([]);
  const [allSuppliers, setAllSuppliers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [noResults, setNoResults] = useState(false);

  useEffect(() => {
    fetchHandler()
      .then((list) => {
        setSuppliers(list);
        setAllSuppliers(list);
      })
      .catch((err) => console.error("Fetch suppliers failed:", err));
  }, []);

  const handleDeleteFromState = (id) => {
    setSuppliers((prev) => prev.filter((p) => p._id !== id));
    setAllSuppliers((prev) => prev.filter((p) => p._id !== id));
    if (noResults && suppliers.length > 0) setNoResults(false);
  };

  const totalSuppliers = allSuppliers.length;

  const handleSearch = () => {
    const q = searchQuery.trim().toLowerCase();
    let list = [...allSuppliers];

    if (q) {
      list = list.filter((s) =>
        [
          s.sup_id,
          s.sup_name,
          s.email,
          s.contact,
          s.address,
        ].some((field) => String(field ?? "").toLowerCase().includes(q))
      );
    }

    setSuppliers(list);
    setNoResults(list.length === 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-300 to-slate-100 p-6 font-sans print:bg-white">
      {/* Header */}
      <div className="mb-6 rounded-3xl border border-white/40 bg-white/20 p-8 shadow-xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="min-w-[240px]">
            <h1 className="m-0 text-4xl font-bold tracking-tight text-white drop-shadow-sm sm:text-5xl">Suppliers</h1>
            <p className="m-0 text-base text-white/80">Manage supplier directory and contacts</p>
          </div>
          <div className="flex gap-4">
            <div className="rounded-2xl border border-white/40 bg-white/90 px-6 py-4 text-center shadow-sm">
              <div className="text-2xl font-extrabold text-slate-800 sm:text-3xl">{totalSuppliers}</div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Suppliers</div>
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
            placeholder="Search by ID, name, email, contact, address..."
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
            to="/inventory/addSupplier"
            className="rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            Add Supplier
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/50 bg-white/90 p-2 shadow-sm backdrop-blur-md">
        {noResults ? (
          <div className="py-12 text-center text-lg font-medium text-slate-500">No Suppliers Found</div>
        ) : (
          <div className="overflow-x-auto rounded-xl">
            {suppliers.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">No suppliers found.</p>
            ) : (
              <table className="w-full border-separate text-sm [border-spacing:0]">
                <thead className="bg-[#2a5540] text-white">
                  <tr>
                    {["SUPPLIER ID", "NAME", "EMAIL", "CONTACT", "ADDRESS", "ACTIONS"].map((h) => (
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
                  {suppliers.map((s) => (
                    <DisplaySupplier key={s._id} supplier={s} onDelete={handleDeleteFromState} />
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
