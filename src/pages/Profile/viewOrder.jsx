import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const formatLKR = (n) =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(
    n ?? 0
  );

const statusBadgeClass = (status) => {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";
  switch ((status || "").toLowerCase()) {
    case "paid":
    case "completed":
      return `${base} bg-green-100 text-green-700`;
    case "shipped":
    case "processing":
      return `${base} bg-blue-100 text-blue-700`;
    case "cancelled":
    case "canceled":
      return `${base} bg-red-100 text-red-700`;
    default:
      return `${base} bg-gray-100 text-gray-700`;
  }
};

export default function ViewOrder() {
  const { orderID } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  const token = localStorage.getItem("authToken");
  const getConfig = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/orders/${orderID}`,
          getConfig()
        );
        setOrder(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load order");
      }
    };
    fetchOrder();
  }, [orderID]);

  if (!order)
    return <p className="text-center mt-16 text-gray-500">Loading order...</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-2 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
      >
        ← Back
      </button>

      {/* Order Summary Card */}
      <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-green-500">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Order #{order.orderID}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className={statusBadgeClass(order.status)}>
              {order.status}
            </span>
            <span className="text-gray-500">
              {new Date(order.date).toLocaleString()}
            </span>
            <span className="font-semibold text-gray-800">
              Total: {formatLKR(order.total)}
            </span>
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="rounded-xl bg-gray-50 p-5 shadow-sm border-2 border-green-400">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              Customer Info
            </h3>
            <dl className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <dt>Name</dt>
                <dd className="font-medium">{order.customerName}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Email</dt>
                <dd className="font-medium">{order.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Phone</dt>
                <dd className="font-medium">{order.phone}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Address</dt>
                <dd className="max-w-[60%] text-right font-medium">
                  {order.address}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Items Table */}
        <div className="rounded-2xl bg-white shadow border-2 border-green-400 overflow-hidden">
          <div className="bg-green-50 border-2 border-green-400 px-6 py-3 font-semibold text-gray-700 text-sm rounded-t-xl">
            Order Items Order Items
          </div>
          <ul className="divide-y divide-gray-100">
            {order.items?.map((it) => (
              <li
                key={it.productID}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition"
              >
                <img
                  src={it.image}
                  alt={it.name}
                  className="h-16 w-16 flex-none rounded-lg object-cover border border-gray-200"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className="truncate font-medium text-gray-800">
                      {it.name}
                    </p>
                    <p className="text-gray-600">{formatLKR(it.price)}</p>
                  </div>
                  <div className="mt-1 flex justify-between text-sm text-gray-500">
                    <span>PID: {it.productID}</span>
                    <span>Qty: {it.quantity}</span>
                    <span className="font-semibold text-gray-800">
                      {formatLKR(it.price * it.quantity)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
            {!order.items?.length && (
              <li className="px-6 py-6 text-center text-gray-500">
                No items in this order.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
