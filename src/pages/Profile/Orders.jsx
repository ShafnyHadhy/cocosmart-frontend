import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function Orders({ user, orders, setOrders }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  const getConfig = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

  // Fetch orders for the logged-in user
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/orders/user/${user._id}`,
          getConfig()
        );
        setOrders(res.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load orders");
      }
    };

    if (user?._id) fetchOrders();
  }, [user, setOrders]);

  // Cancel order
  const cancelOrder = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/orders/${id}/cancel`,
        {},
        getConfig()
      );
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status: "Cancelled" } : o))
      );
      toast.success("Order cancelled!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel order");
    }
  };

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString() : "-";

  const getStatusClass = (status) => {
    switch (status) {
      case "Shipped":
        return "text-blue-600 font-semibold";
      case "Delivered":
        return "text-green-600 font-semibold";
      case "Cancelled":
        return "text-red-600 font-semibold";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Order History</h2>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">Order ID</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Amount</th>
                <th className="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, idx) => (
                <tr
                  key={o._id}
                  className={`${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } border-b`}
                >
                  <td className="px-6 py-3 font-mono">
                    #{o._id?.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-6 py-3">{formatDate(o.createdAt)}</td>
                  <td className={`px-6 py-3 ${getStatusClass(o.status)}`}>
                    {o.status}
                  </td>
                  <td className="px-6 py-3">Rs. {o.total?.toFixed(2)}</td>
                  <td className="px-6 py-3 text-center flex justify-center gap-2">
                    {/* Cancel button */}
                    {o.status !== "Delivered" && o.status !== "Cancelled" && (
                      <button
                        onClick={() => cancelOrder(o._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                      >
                        Cancel
                      </button>
                    )}

                    {/* View order details */}
                    <button
                      onClick={() => navigate(`/orders/${o._id}`)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                    >
                      View
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
