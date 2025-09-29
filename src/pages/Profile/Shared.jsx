// src/pages/userProfile/Shared.jsx
export function InputField({
  label,
  name,
  value,
  onChange,
  disabled,
  type = "text",
  placeholder,
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium">{label}</label>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full border px-3 py-2 rounded ${
          disabled ? "bg-gray-100 text-gray-500" : "bg-white"
        }`}
      />
    </div>
  );
}

export function Button({ children, onClick, variant = "primary" }) {
  const styles =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : "bg-gray-300 text-black hover:bg-gray-400";
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded ${styles}`}>
      {children}
    </button>
  );
}
