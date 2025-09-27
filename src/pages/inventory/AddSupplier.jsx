import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function AddSupplier() {
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({
    sup_id: "",
    sup_name: "",
    email: "",
    contact: "",
    address: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // NEW: field-level errors + submitted flag
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Allow only letters and spaces for Supplier Name
  const sanitizeSupName = (val) => val.replace(/[^A-Za-z\s\-_]/g, "");

  // Return error message or "" if valid
  const validateSupName = (val) => {
    if (!val) return "Supplier name is required.";
    const ok = /^[A-Za-z\s\-_]+$/.test(val);
    return ok ? "" : "Use only letters, spaces, hyphen (-), and underscore (_).";
  };

  // simple email validation
  const validateEmail = (val) => {
    if (!val) return "Email is required.";
    // must have something@something.something
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    return ok ? "" : "Please enter a valid email address.";
  };

  const validateContact = (val) => {
    if (!val) return "Contact number is required.";
    if (!/^\d{10}$/.test(val)) return "Contact number must be exactly 10 digits.";
    return "";
  };

  const validateAddress = (val) => {
    if (!val) return "Address is required.";
    if (val.length < 5) return "Address must be at least 5 characters long.";
    // Allow letters, numbers, spaces, commas, periods, hyphen, slash
    const ok = /^[A-Za-z0-9\s,.\-\/]+$/.test(val);
    return ok
      ? ""
      : "Address can contain only letters, numbers, spaces, commas, dots, - and /.";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Enforce rule while typing for sup_name
    if (name === "sup_name") {
      const clean = sanitizeSupName(value);
      setInputs((prev) => ({ ...prev, sup_name: clean }));
      // live-clear error if user fixes it after submitting
      if (submitted) {
        setFieldErrors((p) => ({ ...p, sup_name: validateSupName(clean) }));
      }
      return;
    }

    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const sendRequest = async () => {
    const body = {
      sup_id: String(inputs.sup_id),
      sup_name: String(inputs.sup_name),
      email: String(inputs.email),
      contact: String(inputs.contact),
      address: String(inputs.address),
    };
    const res = await axios.post("http://localhost:5000/api/suppliers", body);
    return res.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitted(true);

    // validate only what we added now (name)
    const supNameError = validateSupName(inputs.sup_name);
    const newErrors = { sup_name: supNameError };
    setFieldErrors(newErrors);

    if (Object.values(newErrors).some((m) => m)) {
      setError("Please fix the highlighted fields and try again.");
      return;
    }

    try {
      setSaving(true);
      await sendRequest();
      setSuccess("Supplier added successfully.");
      setTimeout(() => navigate("/inventory/supplierDetails"), 600);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add supplier.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div 
      className="min-h-screen p-6" 
      style={{ backgroundColor: '#f7f9f9' }}
    >
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: '#2a5540' }}>
              Add Supplier 🚚
            </h1>
            <p className="mt-2" style={{ color: '#a4ac86' }}>
              Add a new supplier to your network
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{ 
              color: '#a4ac86',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#e7e9e9';
              e.target.style.color = '#2D3748';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#a4ac86';
            }}
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto">
        {/* Alerts */}
        {error && (
          <div 
            className="mb-6 p-4 rounded-xl border text-sm"
            style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderColor: '#ef4444',
              color: '#ef4444'
            }}
          >
            {error}
          </div>
        )}
        {success && (
          <div 
            className="mb-6 p-4 rounded-xl border text-sm"
            style={{ 
              backgroundColor: 'rgba(42, 85, 64, 0.1)',
              borderColor: '#2a5540',
              color: '#2a5540'
            }}
          >
            {success}
          </div>
        )}

        {/* Form Card */}
        <div 
          className="rounded-2xl shadow-sm border p-8"
          style={{ 
            backgroundColor: '#fcfaf6',
            borderColor: '#e7e9e9'
          }}
        >
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Supplier ID */}
              <div className="md:col-span-2">
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: '#2D3748' }}
                >
                  Supplier ID *
                </label>
                <input
                  type="text"
                  name="sup_id"
                  value={inputs.sup_id}
                  onChange={handleChange}
                  placeholder="Enter unique supplier identifier (e.g., SUP001)"
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
                  style={{ 
                    borderColor: '#e7e9e9',
                    backgroundColor: '#f5f3f1'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2a5540';
                    e.target.style.boxShadow = '0 0 0 2px rgba(42, 85, 64, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e7e9e9';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Supplier Name */}
              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: '#2D3748' }}
                >
                  Supplier Name *
                </label>
                <input
                  type="text"
                  name="sup_name"
                  value={inputs.sup_name}
                  onChange={handleChange}
                  required
                  onBeforeInput={(e) => {
                    if (e.data && /[^A-Za-z\s\-_]/.test(e.data)) e.preventDefault();
                  }}
                  onPaste={(e) => {
                    const pasted = (e.clipboardData || window.clipboardData).getData("text");
                    if (/[^A-Za-z\s\-_]/.test(pasted)) {
                      e.preventDefault();
                      const clean = sanitizeSupName(pasted);
                      const target = e.target;
                      const start = target.selectionStart;
                      const end = target.selectionEnd;
                      const newVal =
                        inputs.sup_name.slice(0, start) + clean + inputs.sup_name.slice(end);
                      setInputs((prev) => ({ ...prev, sup_name: newVal }));
                    }
                  }}
                  placeholder="Enter supplier company name"
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
                  style={{ 
                    borderColor: submitted && fieldErrors.sup_name ? '#ef4444' : '#e7e9e9',
                    backgroundColor: '#f5f3f1'
                  }}
                  onFocus={(e) => {
                    const borderColor = submitted && fieldErrors.sup_name ? '#ef4444' : '#2a5540';
                    e.target.style.borderColor = borderColor;
                    e.target.style.boxShadow = `0 0 0 2px ${submitted && fieldErrors.sup_name ? 'rgba(239, 68, 68, 0.1)' : 'rgba(42, 85, 64, 0.1)'}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = submitted && fieldErrors.sup_name ? '#ef4444' : '#e7e9e9';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {submitted && fieldErrors.sup_name && (
                  <p className="mt-2 text-sm" style={{ color: '#ef4444' }}>
                    {fieldErrors.sup_name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: '#2D3748' }}
                >
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={inputs.email}
                  onChange={handleChange}
                  onBlur={(e) => {
                    const msg = validateEmail(e.target.value);
                    setFieldErrors((p) => ({ ...p, email: msg }));
                  }}
                  placeholder="supplier@company.com"
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
                  style={{ 
                    borderColor: fieldErrors.email ? '#ef4444' : '#e7e9e9',
                    backgroundColor: '#f5f3f1'
                  }}
                  onFocus={(e) => {
                    const borderColor = fieldErrors.email ? '#ef4444' : '#2a5540';
                    e.target.style.borderColor = borderColor;
                    e.target.style.boxShadow = `0 0 0 2px ${fieldErrors.email ? 'rgba(239, 68, 68, 0.1)' : 'rgba(42, 85, 64, 0.1)'}`;
                  }}
                />
                {fieldErrors.email && (
                  <p className="mt-2 text-sm" style={{ color: '#ef4444' }}>
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Contact */}
              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: '#2D3748' }}
                >
                  Contact Number *
                </label>
                <input
                  type="text"
                  name="contact"
                  value={inputs.contact}
                  onChange={(e) => {
                    // allow only digits, max 10
                    let v = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setInputs((prev) => ({ ...prev, contact: v }));
                  }}
                  onBlur={(e) => {
                    const msg = validateContact(e.target.value);
                    setFieldErrors((p) => ({ ...p, contact: msg }));
                  }}
                  placeholder="0771234567 (10 digits)"
                  required
                  inputMode="numeric"
                  pattern="\d{10}"
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors"
                  style={{ 
                    borderColor: fieldErrors.contact ? '#ef4444' : '#e7e9e9',
                    backgroundColor: '#f5f3f1'
                  }}
                  onFocus={(e) => {
                    const borderColor = fieldErrors.contact ? '#ef4444' : '#2a5540';
                    e.target.style.borderColor = borderColor;
                    e.target.style.boxShadow = `0 0 0 2px ${fieldErrors.contact ? 'rgba(239, 68, 68, 0.1)' : 'rgba(42, 85, 64, 0.1)'}`;
                  }}
                />
                {fieldErrors.contact && (
                  <p className="mt-2 text-sm" style={{ color: '#ef4444' }}>
                    {fieldErrors.contact}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: '#2D3748' }}
                >
                  Address *
                </label>
                <textarea
                  name="address"
                  rows={4}
                  value={inputs.address}
                  onChange={(e) => {
                    // strip forbidden characters live
                    const clean = e.target.value.replace(/[^A-Za-z0-9\s,.\-\/]/g, "");
                    setInputs((prev) => ({ ...prev, address: clean }));
                  }}
                  onBlur={(e) => {
                    const msg = validateAddress(e.target.value);
                    setFieldErrors((p) => ({ ...p, address: msg }));
                  }}
                  placeholder="Complete supplier address including street, city, and province"
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors resize-none"
                  style={{ 
                    borderColor: fieldErrors.address ? '#ef4444' : '#e7e9e9',
                    backgroundColor: '#f5f3f1'
                  }}
                  onFocus={(e) => {
                    const borderColor = fieldErrors.address ? '#ef4444' : '#2a5540';
                    e.target.style.borderColor = borderColor;
                    e.target.style.boxShadow = `0 0 0 2px ${fieldErrors.address ? 'rgba(239, 68, 68, 0.1)' : 'rgba(42, 85, 64, 0.1)'}`;
                  }}
                />
                {fieldErrors.address && (
                  <p className="mt-2 text-sm" style={{ color: '#ef4444' }}>
                    {fieldErrors.address}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex justify-end space-x-4">
              <Link
                to="/inventory/supplierDetails"
                className="px-6 py-3 rounded-xl transition-colors font-medium"
                style={{ 
                  color: '#a4ac86',
                  backgroundColor: 'transparent',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#e7e9e9';
                  e.target.style.color = '#2D3748';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#a4ac86';
                }}
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 rounded-xl font-semibold transition-all"
                style={{
                  backgroundColor: saving ? '#e7e9e9' : '#2a5540',
                  color: saving ? '#a4ac86' : 'white',
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!saving) {
                    e.target.style.backgroundColor = 'rgba(42, 85, 64, 0.9)';
                    e.target.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!saving) {
                    e.target.style.backgroundColor = '#2a5540';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                {saving ? (
                  <span className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 border-2 rounded-full animate-spin"
                      style={{ 
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        borderTopColor: 'white'
                      }}
                    ></div>
                    <span>Adding...</span>
                  </span>
                ) : (
                  "Add Supplier"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}