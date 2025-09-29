// SupplierDetails.jsx — Light theme matching dashboard
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";
import UpdateSupplierModal from "./UpdateSupplierModal.jsx";

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
function DisplaySupplier({ supplier, onDelete, onEdit }) {
  const { _id, sup_id, sup_name, email, contact, address } = supplier || {};
  const [loading, setLoading] = useState(false);

  const rowClass = [
    "text-sm hover:bg-green-50/30 transition-colors",
  ].filter(Boolean).join(" ");

  const cellClass = "border-b border-gray-100 px-4 py-3 align-middle";

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
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#2a5540",
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
    <tr className={rowClass}>
      <td className={`${cellClass} font-mono font-semibold text-green-700 bg-green-50/40`}>{sup_id}</td>
      <td className={`${cellClass} font-medium text-gray-800`}>{sup_name}</td>
      <td className={cellClass}>
        {email ? (
          <a href={`mailto:${email}`} className="text-green-700 underline decoration-green-300 underline-offset-2">
            {email}
          </a>
        ) : (
          "—"
        )}
      </td>
      <td className={`${cellClass} text-gray-700 font-medium`}>{contact}</td>
      <td className={`${cellClass} text-gray-700 font-medium`}>{address}</td>
      <td className={`${cellClass} w-[120px]`}>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onEdit?.(supplier)}
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
  const [openEdit, setOpenEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  const fetchSuppliers = async () => {
    const { data } = await axios.get("http://localhost:5000/api/suppliers");
    const list = data?.suppliers || data; // shape-tolerant
    setSuppliers(Array.isArray(list) ? list : []);
    setAllSuppliers(Array.isArray(list) ? list : []);
  };

  useEffect(() => { fetchSuppliers(); }, []);

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
    <div className="min-h-screen p-6 font-sans" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Header - Light like dashboard */}
      <div className="mb-8 rounded-3xl bg-white p-5 shadow-lg border-2" style={{ borderColor: '#2a5540' }}>
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="min-w-[280px]">
            <h1 
              className="m-0 text-4xl font-bold tracking-tight sm:text-5xl"
              style={{ color: '#2a5540' }}
            >
              Suppliers 🏪
            </h1>
            <p className="m-0 text-lg text-gray-600 mt-2 font-medium">
              Manage supplier directory and contacts
            </p>
          </div>
          <div className="flex gap-6">
            {/* Total Suppliers Card - Clean white with green accent */}
            <div className="bg-white rounded-2xl border-2 px-5 py-5 h-28 text-center shadow-md" style={{ borderColor: '#2a5540' }}>
              <div 
                className="text-3xl font-extrabold sm:text-4xl"
                style={{ color: '#2a5540' }}
              >
                {totalSuppliers}
              </div>
              <div className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                Total Suppliers
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
            placeholder="Search by ID, name, email, contact, address..."
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
          {/* Add Supplier Button */}
          <Link
            to="/inventory/addSupplier"
            className="rounded-xl px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            style={{ backgroundColor: '#2a5540' }}
          >
            Add Supplier
          </Link>
        </div>
      </div>

      {/* Table - Clean white with matching dashboard colors */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-lg overflow-hidden">
        {noResults ? (
          <div className="py-16 text-center">
            <div className="text-6xl mb-4 opacity-40">🏪</div>
            <div className="text-xl font-medium text-gray-500 mb-2">No Suppliers Found</div>
            <p className="text-gray-400">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {suppliers.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-3 opacity-40">🏪</div>
                <p className="text-gray-500 font-medium">No suppliers available.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead style={{ backgroundColor: '#2a5540' }}>
                  <tr>
                    {[
                      "SUPPLIER ID",
                      "NAME",
                      "EMAIL",
                      "CONTACT",
                      "ADDRESS",
                      "ACTIONS",
                    ].map((h, index) => (
                      <th
                        key={h}
                        className={`px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-white ${
                          index === 0 ? 'rounded-tl-2xl' : 
                          index === 5 ? 'rounded-tr-2xl' : ''
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {suppliers.map((s) => (
                    <DisplaySupplier
                      key={s._id}
                      supplier={s}
                      onDelete={handleDeleteFromState}
                      onEdit={(row) => { setSelected(row); setOpenEdit(true); }}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      <UpdateSupplierModal
        key={selected ? selected._id : "empty"}  // force remount per supplier
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        supplier={selected}
        onUpdated={fetchSuppliers}               // call your list refresher
      />
    </div>
  );
}