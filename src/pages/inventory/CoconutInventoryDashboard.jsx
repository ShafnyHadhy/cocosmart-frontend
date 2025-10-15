import React, { useState } from "react";
import {
  Package,
  ShoppingCart,
  Truck,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Bell,
  DollarSign,
  Box,
  Layers,
} from "lucide-react";

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Mock data for the dashboard
const revenueData = [
  { month: "Jan", revenue: 45000, expenses: 32000 },
  { month: "Feb", revenue: 52000, expenses: 35000 },
  { month: "Mar", revenue: 48000, expenses: 33000 },
  { month: "Apr", revenue: 61000, expenses: 38000 },
  { month: "May", revenue: 58000, expenses: 40000 },
  { month: "Jun", revenue: 67000, expenses: 42000 },
];

const categoryData = [
  { name: "Coconut Oil", value: 35, color: "#2a5540" },
  { name: "Coconut Water", value: 28, color: "#3b82f6" },
  { name: "Coconut Powder", value: 22, color: "#d88c4b" },
  { name: "Other Products", value: 15, color: "#a4ac86" },
];

const stockMovementData = [
  { date: "Mon", inbound: 120, outbound: 95 },
  { date: "Tue", inbound: 85, outbound: 110 },
  { date: "Wed", inbound: 140, outbound: 88 },
  { date: "Thu", inbound: 95, outbound: 125 },
  { date: "Fri", inbound: 110, outbound: 102 },
  { date: "Sat", inbound: 75, outbound: 80 },
  { date: "Sun", inbound: 60, outbound: 45 },
];

const MetricCard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
  bgColor,
}) => (
  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border-2 border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden group">
    {/* Background gradient overlay */}
    <div
      className="absolute inset-0 opacity-5 transition-opacity duration-300 group-hover:opacity-10"
      style={{
        background: `linear-gradient(135deg, ${color}15, ${color}05)`,
      }}
    ></div>

    <div className="flex items-center justify-between relative z-10">
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-600 mb-2">{title}</p>
        <p className="text-3xl font-black text-gray-900 mb-3">{value}</p>
        <div className="flex items-center">
          {changeType === "increase" ? (
            <div className="flex items-center px-2 py-1 bg-green-100 rounded-full">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-sm font-bold text-green-700">{change}</span>
            </div>
          ) : changeType === "decrease" ? (
            <div className="flex items-center px-2 py-1 bg-red-100 rounded-full">
              <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
              <span className="text-sm font-bold text-red-700">{change}</span>
            </div>
          ) : null}
          <span className="text-xs text-gray-500 ml-2">vs last month</span>
        </div>
      </div>
      <div className="relative">
        <div
          className="w-18 h-18 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110"
          style={{
            background: `linear-gradient(135deg, ${color}, ${color}CC)`,
            boxShadow: `0 8px 32px ${color}40`,
          }}
        >
          <Icon className="w-9 h-9 text-white" />
        </div>
        {/* Pulse animation */}
        <div
          className="absolute inset-0 rounded-2xl animate-pulse opacity-20"
          style={{ backgroundColor: color }}
        ></div>
      </div>
    </div>
  </div>
);

const AlertCard = ({
  title,
  count,
  icon: Icon,
  color,
  bgColor,
  description,
}) => (
  <div className="bg-gradient-to-br from-white via-white to-gray-50 rounded-2xl p-5 shadow-lg border-2 border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden group">
    {/* Animated background pattern */}
    <div
      className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 transition-all duration-300 group-hover:scale-150 group-hover:opacity-20"
      style={{ backgroundColor: color }}
    ></div>

    <div className="flex items-start relative z-10">
      <div className="relative mr-4">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110"
          style={{
            background: `linear-gradient(135deg, ${bgColor}, ${color}20)`,
            border: `2px solid ${color}30`,
          }}
        >
          <Icon className="w-7 h-7" style={{ color }} />
        </div>
        {/* Notification dot for urgent alerts */}
        {(title.includes("Expired") ||
          (title.includes("Low Stock") && count > 15)) && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-bounce">
            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping"></div>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-700 mb-1">{title}</p>
        <p className="text-2xl font-black text-gray-900 mb-1">{count}</p>
        <p className="text-xs text-gray-600 font-medium">{description}</p>
      </div>
    </div>

    {/* Progress indicator for visual appeal */}
    <div className="mt-3 w-full bg-gray-200 rounded-full h-1 overflow-hidden">
      <div
        className="h-1 rounded-full transition-all duration-1000 ease-out"
        style={{
          width: `${Math.min(count * 5, 100)}%`,
          background: `linear-gradient(90deg, ${color}, ${color}AA)`,
        }}
      ></div>
    </div>
  </div>
);

export default function CoconutInventoryDashboard() {
  const [timeRange, setTimeRange] = useState("6M");

  // --- notifications that should reappear after refresh ---
  const initialOrderNotifications = [
    {
      id: "REQ-001",
      productId: "COCO001",
      name: "Virgin Coconut Oil 500ml",
      qty: 120,
    },
    {
      id: "REQ-002",
      productId: "COCO006",
      name: "Coconut Sugar 1kg",
      qty: 80,
    },
  ];

  const [notifications, setNotifications] = useState(initialOrderNotifications);
  const [notifOpen, setNotifOpen] = useState(false);
  const [hasSeen, setHasSeen] = useState(false);

  const toggleNotifications = () => {
    if (!notifOpen) {
      // opening → mark as seen (dot disappears)
      setHasSeen(true);
    } else {
      // closing → clear messages (session only)
      if (notifications.length) setNotifications([]);
    }
    setNotifOpen((s) => !s);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7f9f9" }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-white via-white to-gray-50 shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: "#2a5540" }}
                >
                  <Package className="w-7 h-7 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl opacity-20 animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-green-700 to-green-900 bg-clip-text text-transparent">
                  Coconut Inventory Dashboard
                </h1>
                <p className="text-gray-600 font-medium">
                  Monitor your coconut products and supplies
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <button
                  onClick={toggleNotifications}
                  className="relative p-2 rounded-lg hover:bg-gray-100 transition"
                  title="Notifications"
                >
                  <Bell className="w-6 h-6 text-gray-700" />
                  {!hasSeen && notifications.length > 0 && (
                    <>
                      <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full" />
                      <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full animate-ping bg-red-400" />
                    </>
                  )}
                </button>

                {notifOpen && (
                  <>
                    {/* Backdrop (click to close) */}
                    <div
                      className="fixed inset-0 bg-black/20 z-40"
                      onClick={() => setNotifOpen(false)}
                    />

                    {/* Popover */}
                    <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-2xl shadow-xl z-50">
                      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <span className="font-bold text-gray-800">
                          Notifications
                        </span>
                        <button
                          onClick={toggleNotifications}
                          className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded-md hover:bg-gray-100"
                        >
                          Close
                        </button>
                      </div>
                      {/* … leave your existing notifications list + footer exactly as is … */}
                      <div className="max-h-80 overflow-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-sm text-gray-500">
                            No new notifications.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className="p-4 border-b border-gray-100 hover:bg-gray-50 transition"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-semibold text-gray-500">
                                  Order Request • {n.id}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                                  New
                                </span>
                              </div>
                              <div className="text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-800">
                                    Product:
                                  </span>
                                  <span className="font-mono text-gray-700">
                                    {n.productId}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-800">
                                    Name:
                                  </span>
                                  <span className="text-gray-700">
                                    {n.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-800">
                                    Qty:
                                  </span>
                                  <span className="text-gray-700">{n.qty}</span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-right">
                          <button
                            className="text-sm font-semibold text-white px-4 py-2 rounded-xl"
                            style={{ backgroundColor: "#2a5540" }}
                            onClick={() => {
                              setNotifOpen(false);
                              setNotifications([]);
                            }}
                          >
                            View Requests
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <button
                className="px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #f5f3f1, #e7e9e9)",
                  color: "#2a5540",
                  border: "1px solid #2a554020",
                }}
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                Today
              </button>
              <button
                className="px-6 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                style={{
                  background: "linear-gradient(135deg, #2a5540, #1e3a2e)",
                  boxShadow: "0 4px 20px rgba(42, 85, 64, 0.4)",
                }}
              >
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Coconut Products"
            value="10"
            change="+9.9%"
            changeType="increase"
            icon={Package}
            color="#2a5540"
            bgColor="rgba(42, 85, 64, 0.1)"
          />
          <MetricCard
            title="Purchased Items"
            value="9"
            change="+8.7%"
            changeType="increase"
            icon={ShoppingCart}
            color="#3b82f6"
            bgColor="rgba(59, 130, 246, 0.1)"
          />
          <MetricCard
            title="Active Suppliers"
            value="4"
            change="+2"
            changeType="increase"
            icon={Truck}
            color="#d88c4b"
            bgColor="rgba(216, 140, 75, 0.1)"
          />
          <MetricCard
            title="Inventory Value"
            value="LKR 1M"
            change="+15.2%"
            changeType="increase"
            icon={DollarSign}
            color="#22c55e"
            bgColor="rgba(34, 197, 94, 0.1)"
          />
        </div>

        {/* Alert Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Inventory Alerts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AlertCard
              title="Low-Products"
              count="3"
              icon={AlertTriangle}
              color="#ef4444"
              bgColor="rgba(239, 68, 68, 0.1)"
              description="Products need restocking"
            />
            <AlertCard
              title="Low-Purchases"
              count="2"
              icon={Box}
              color="#f59e0b"
              bgColor="rgba(245, 158, 11, 0.1)"
              description="Tools, fertilizers, packaging"
            />
            <AlertCard
              title="Expiring Soon"
              count="4"
              icon={Clock}
              color="#8b5cf6"
              bgColor="rgba(139, 92, 246, 0.1)"
              description="Items expire within 30 days"
            />
            <AlertCard
              title="Expired Items"
              count="1"
              icon={AlertTriangle}
              color="#ef4444"
              bgColor="rgba(239, 68, 68, 0.1)"
              description="Immediate attention required"
            />
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-gray-900">
                  Revenue & Expenses
                </h3>
                <p className="text-gray-600 text-sm font-medium">
                  Monthly financial overview
                </p>
              </div>
              <div className="flex space-x-2">
                {["3M", "6M", "1Y"].map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimeRange(period)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                      timeRange === period
                        ? "text-white shadow-md scale-105"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                    style={{
                      background:
                        timeRange === period
                          ? "linear-gradient(135deg, #2a5540, #1e3a2e)"
                          : "transparent",
                    }}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stackId="1"
                  stroke="#2a5540"
                  fill="rgba(42, 85, 64, 0.8)"
                  name="Revenue"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stackId="2"
                  stroke="#ef4444"
                  fill="rgba(239, 68, 68, 0.8)"
                  name="Expenses"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Product Distribution */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-black text-gray-900 mb-2">
              Product Distribution
            </h3>
            <p className="text-gray-600 text-sm font-medium mb-6">
              Inventory by category
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <RePieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-3">
              {categoryData.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-3 shadow-sm"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm font-semibold text-gray-700">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-black text-gray-900">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stock Movement Chart */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-black text-gray-900">
                Stock Movement
              </h3>
              <p className="text-gray-600 text-sm font-medium">
                Daily inbound vs outbound inventory
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center px-3 py-2 bg-green-50 rounded-full">
                <div
                  className="w-3 h-3 rounded-full mr-2 shadow-sm"
                  style={{ backgroundColor: "#2a5540" }}
                ></div>
                <span className="text-sm font-bold text-green-700">
                  Inbound
                </span>
              </div>
              <div className="flex items-center px-3 py-2 bg-red-50 rounded-full">
                <div
                  className="w-3 h-3 rounded-full mr-2 shadow-sm"
                  style={{ backgroundColor: "#ef4444" }}
                ></div>
                <span className="text-sm font-bold text-red-700">Outbound</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stockMovementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Bar dataKey="inbound" fill="#2a5540" radius={[4, 4, 0, 0]} />
              <Bar dataKey="outbound" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-xl font-black text-gray-900 mb-6">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {[
              {
                action: "Low stock alert",
                item: "Coconut Oil 500ml",
                time: "2 minutes ago",
                type: "alert",
              },
              {
                action: "Inventory updated",
                item: "Coconut Water 1L",
                time: "15 minutes ago",
                type: "update",
              },
              {
                action: "New supplier added",
                item: "Green Valley Fertilizers",
                time: "1 hour ago",
                type: "supplier",
              },
              {
                action: "Stock movement",
                item: "Coconut Powder 250g",
                time: "2 hours ago",
                type: "movement",
              },
              {
                action: "Expiry warning",
                item: "Organic Fertilizer",
                time: "3 hours ago",
                type: "warning",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mr-4 shadow-md"
                    style={{
                      background:
                        activity.type === "alert"
                          ? "linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))"
                          : activity.type === "warning"
                          ? "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1))"
                          : activity.type === "supplier"
                          ? "linear-gradient(135deg, rgba(216, 140, 75, 0.2), rgba(216, 140, 75, 0.1))"
                          : "linear-gradient(135deg, rgba(42, 85, 64, 0.2), rgba(42, 85, 64, 0.1))",
                    }}
                  >
                    {activity.type === "alert" ? (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    ) : activity.type === "warning" ? (
                      <Clock className="w-5 h-5 text-amber-500" />
                    ) : activity.type === "supplier" ? (
                      <Truck className="w-5 h-5" style={{ color: "#d88c4b" }} />
                    ) : (
                      <Package
                        className="w-5 h-5"
                        style={{ color: "#2a5540" }}
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">
                      {activity.item}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-full">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
