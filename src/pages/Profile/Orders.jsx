// File: frontend/src/components/Orders.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FaRegEye } from "react-icons/fa";

export default function Orders({ user, orders, setOrders }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  const getConfig = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

  // Fetch orders for the logged-in user
  useEffect(() => {
    if (!user?._id) return;

    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/orders/user/${user._id}`,
          getConfig()
        );
        setOrders(res.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load orders");
      }
    };

    fetchOrders();
  }, [user, setOrders]);

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString() : "-";

  // Status color coding same as AdminOrdersPage
  const getStatusClass = (status) => {
    switch ((status || "").toLowerCase()) {
      case "completed":
      case "delivered":
        return "bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium";
      case "processing":
      case "shipped":
        return "bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium";
      case "pending":
        return "bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium";
      case "cancelled":
      case "canceled":
        return "bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium";
      default:
        return "bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium";
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Order History</h2>

      {orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-2xl bg-white">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-accent text-white text-end">
              <tr>
                <th className="py-3 px-4 text-left rounded-tl-2xl">Order ID</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Amount</th>
                <th className="py-3 px-4 text-center rounded-tr-2xl">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, idx) => (
                <tr
                  key={o.orderID}
                  className={`border-b hover:bg-gray-50 transition-colors ${
                    idx % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                  }`}
                >
                  <td className="py-3 px-4 font-mono">{o.orderID}</td>
                  <td className="py-3 px-4">{formatDate(o.date)}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={getStatusClass(o.status)}>{o.status}</span>
                  </td>
                  <td className="py-3 px-4">Rs. {o.total?.toFixed(2)}</td>
                  <td className="py-3 px-4 flex justify-center gap-2 text-lg">
                    <button
                      onClick={() => navigate(`/orders/${o.orderID}`)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="View Orders"
                    >
                      <FaRegEye size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
