import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader } from "../../components/loader";
import OrderModal from "../../components/orderInfoModel";
import { RiFilterOffFill } from "react-icons/ri";
import { MdOutlineOpenInFull } from "react-icons/md";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filters + Search
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) {
      const token = localStorage.getItem("token");
      if (token == null) {
        navigate("/login");
        return;
      }

      axios
        .get(import.meta.env.VITE_API_URL + "/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setOrders(response.data.orders);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, [isLoading]);

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase());

    const orderDate = new Date(order.date);
    const afterStart = startDate ? orderDate >= new Date(startDate) : true;
    const beforeEnd = endDate ? orderDate <= new Date(endDate) : true;
    const matchesStatus = statusFilter ? order.status === statusFilter : true;

    return matchesSearch && afterStart && beforeEnd && matchesStatus;
  });

  return (
    <div className="h-full w-full p-6">

      {/* Order Details Modal */}
      <OrderModal
        isModelOpen={isModelOpen}
        closeModel={() => setIsModelOpen(false)}
        selectedOrder={selectedOrder}
        refresh={() => setIsLoading(true)}
      />

      {/* Header Section */}
      <div className="flex flex-col md:flex-col md:items-start md:justify-between mb-8 bg-white p-4 rounded-xl border border-secondary/20 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">
          Order <span className="text-accent">Management</span>
        </h1>
        <p className="text-sm text-gray-500">
            Filter and manage customer orders
          </p>
      </div>

      {/* Filter Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        {/* Search and Status */}
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <input
            type="text"
            placeholder="🔍 Search by ID, Name, or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border rounded-lg border-gray-300 text-sm w-72 focus:ring-1 focus:ring-accent focus:outline-none"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border rounded-lg border-gray-300 text-sm focus:ring-1 focus:ring-accent focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="Completed">Completed</option>
            <option value="shipped">Shipping</option>
            <option value="Processing">Processing</option>
            <option value="pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <Link
            className="p-2 border rounded-lg border-gray-300 hover:bg-gray-100 transition"
            title="Clear Filters"
          >
            <RiFilterOffFill
              size={18}
              className="text-gray-600 hover:text-accent"
              onClick={() => {
                setSearchTerm("");
                setStartDate("");
                setEndDate("");
                setStatusFilter("");
              }}
            />
          </Link>
        </div>

        {/* Date Filters */}
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <label className="text-sm font-medium text-gray-700">From:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className="p-2 border rounded-lg border-gray-300 text-sm focus:ring-1 focus:ring-accent focus:outline-none"
          />
          <label className="text-sm font-medium text-gray-700">To:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className="p-2 border rounded-lg border-gray-300 text-sm focus:ring-1 focus:ring-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="w-full h-full">
        {isLoading ? (
          <Loader />
        ) : (
          <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-accent text-white">
                <tr>
                  <th className="py-3 px-4 text-left rounded-tl-lg">Order ID</th>
                  <th className="py-3 px-4 text-center">Items</th>
                  <th className="py-3 px-4 text-left">Customer</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Date</th>
                  <th className="py-3 px-4 text-center rounded-tr-lg">View</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((item, index) => (
                  <tr
                    key={item.orderID}
                    className={`transition-colors hover:bg-gray-100 ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="py-3 px-4 font-medium text-gray-800">{item.orderID}</td>
                    <td className="py-3 px-4 text-center">{item.items.length}</td>
                    <td className="py-3 px-4 text-gray-700">{item.customerName}</td>
                    <td className="py-3 px-4 text-gray-700">{item.email}</td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-800">
                      Rs.{" "}
                      {item.total.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : item.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : item.status === "Cancelled"
                            ? "bg-red-100 text-red-700"
                            : item.status === "shipped"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <MdOutlineOpenInFull
                        size={18}
                        className="mx-auto text-gray-600 hover:text-accent cursor-pointer transition-transform hover:scale-110"
                        onClick={() => {
                          setSelectedOrder(item);
                          setIsModelOpen(true);
                        }}
                        title="View Order Details"
                      />
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
