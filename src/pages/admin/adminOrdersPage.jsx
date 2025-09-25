import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader } from "../../components/loader";
import OrderModal from "../../components/orderInfoModel";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const navigate = useNavigate();

  // useEffect(() => {
  //   if (isLoading) {
  //     const token = localStorage.getItem("token");
  //     if (token == null) {
  //       navigate("/login");
  //       return;
  //     }

  //     axios
  //       .get(import.meta.env.VITE_API_URL + "/api/orders", {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       })
  //       .then((response) => {
  //         console.log(response.data);
  //         setOrders(response.data.orders);
  //         setIsLoading(false);
  //       });
  //   }
  // }, [isLoading]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const refreshNeeded = localStorage.getItem("ordersNeedRefresh") === "true";

    if (isLoading || refreshNeeded) {
      axios
        .get(import.meta.env.VITE_API_URL + "/api/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          console.log(response.data);
          setOrders(response.data.orders);
          setIsLoading(false);

          if (refreshNeeded) localStorage.removeItem("ordersNeedRefresh");
        });
    }
  }, [isLoading]);

  return (
    <div className="h-full w-full p-6">
      <OrderModal
        isModelOpen={isModelOpen}
        closeModel={() => setIsModelOpen(false)}
        selectedOrder={selectedOrder}
        refresh={() => {
          setIsLoading(true);
        }}
      />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
      </div>

      {/* Table Container */}
      <div className="w-full min h-full">
        {isLoading ? (
          <Loader />
        ) : (
          <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-accent text-white sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-4 text-left rounded-tl-lg">
                    Order ID
                  </th>
                  <th className="py-3 px-4 text-center">Items</th>
                  <th className="py-3 px-4 text-left">Customer</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Date</th>
                  <th className="py-3 px-4 text-center rounded-tr-lg">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((item, index) => (
                  <tr
                    key={item.orderID}
                    className={`border-b last:border-none hover:bg-gray-100 transition-colors ${
                      index % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                    }`}
                  >
                    <td className="py-3 px-4 font-medium">{item.orderID}</td>
                    <td className="py-3 px-4 text-center">
                      {item.items.length}
                    </td>
                    <td className="py-3 px-4">{item.customerName}</td>
                    <td className="py-3 px-4">{item.email}</td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-700">
                      LKR {item.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : item.status === "Processing"
                            ? "bg-blue-100 text-blue-700" // ✅ added
                            : item.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : item.status === "Cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md transition"
                        onClick={() => {
                          setSelectedOrder(item);
                          setIsModelOpen(true);
                        }}
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
    </div>
  );
}
