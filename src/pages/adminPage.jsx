import { BsCart2, BsGraphUpArrow } from "react-icons/bs";
import { FiBox } from "react-icons/fi";
import { HiOutlineUsers } from "react-icons/hi";
import { PiSteeringWheelBold } from "react-icons/pi";
import { GrDeliver } from "react-icons/gr";
import { VscFeedback } from "react-icons/vsc";
import { TbTruckLoading } from "react-icons/tb";
import { GiCash } from "react-icons/gi";
import { Link, Route, Routes, useLocation } from "react-router-dom";

import AdminProductPage from "./admin/adminProductPage";
import AdminAddNewProduct from "./admin/adminAddNewProduct";
import AdminUpdateProduct from "./admin/adminUpdateProduct";
import { SiExpensify } from "react-icons/si";
import AdminExpensePage from "./admin/adminExpensePage";
import AdminFinancePage from "./admin/adminFinancePage";
import AdminAddNewExpense from "./admin/adminAddNewExpense";
import AdminAddNewFinance from "./admin/adminAddNewFinance";
import AdminUpdateExpense from "./admin/adminUpdateExpense";
import AdminUpdateFinance from "./admin/adminUpdateFinance";
import AdminOrdersPage from "./admin/adminOrdersPage";
import DriverPage from "./transport/driverPage";
import AddDriver from "./transport/addDriver";
import VehiclePage from "./transport/vehiclePage";
import AddVehicle from "./transport/addVehicle";
import DeliveryPage from "./transport/deliveryPage";
import AddDelivery from "./transport/AddDelivery";
import FeedbackPage from "./feedback/feedbackPage";
import UserPage from "./admin/userPage";
import Dashboard from "./admin/adminTest";
import { BiMenu } from "react-icons/bi";
import { RxDashboard } from "react-icons/rx";

export default function AdminPage() {
  const location = useLocation();

  const menuItems = [
    { path: "/admin", label: "Dashboard", icon: <RxDashboard /> },
    { path: "/admin/orders", label: "Orders", icon: <BsCart2 /> },
    { path: "/admin/products", label: "Products", icon: <FiBox /> },
    { path: "/admin/users", label: "Users", icon: <HiOutlineUsers /> },
    { path: "/admin/expenses", label: "Expenses", icon: <SiExpensify /> },
    { path: "/admin/finances", label: "Finance", icon: <GiCash /> },
    { path: "/admin/drivers", label: "Drivers", icon: <PiSteeringWheelBold /> },
    { path: "/admin/vehicles", label: "Vehicles", icon: <GrDeliver /> },
    { path: "/admin/deliveries", label: "Deliveries", icon: <TbTruckLoading /> }, 
    { path: "/admin/feedback", label: "Feedback", icon: <VscFeedback /> }
  ];

  return (
    <div className="flex min-h-screen bg-white text-gray-800">

      <aside className="fixed top-0 left-0 w-64 h-screen flex flex-col bg-white z-20">
        <div className="flex h-16 items-center gap-2 border-b border-medium-gray px-6">
          <img src="/clogo.png" alt="logo" className="h-13 rounded-md" />
          <div className="flex flex-col justify-center">
            <span className="text-md font-bold tracking-[-0.015em] text-secondary">CocoSmart</span>
            <h1 className="text-xs font-bold tracking-[-0.015em] text-secondary">
              Admin Panel
            </h1>
          </div>
        </div>

        {/*<nav className="flex-1 p-4 space-y-2 overflow-hidden">*/}
        <nav className="flex-1 mt-3 p-4 space-y-3 overflow-hidden">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all 
                ${
                  location.pathname === item.path
                    ? "bg-green-calm text-white shadow-md scale-[1.02]"
                    : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                }`}
            >
              {/*<span className="text-lg">{item.icon}</span>*/}
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-medium-gray text-sm text-center">
          ©2025CocoSmart
        </div>
      </aside>

     <div className="ml-64 flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center whitespace-nowrap border-b border-gray-200 bg-white/80 px-6 backdrop-blur-sm">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
                <button className="rounded-lg p-2 text-slate-600 bg-slate-100 transition-colors">
                  <BiMenu className="w-5 h-5"/>
                </button>
                <div className="hidden md:block">
                  <h1 className="text-sm font-black text-secondary">Dashboard</h1>
                  <p className="text-xs">Welcome back Admin!, Here is what's happening today</p>
                </div>
            </div>
            
            <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
              <img src="/admin.jpg" alt="User" className="h-8 w-8 rounded-full ring-2 ring-accent object-cover"/>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-slate-500">
                  Agash Jeevahan
                </p>
                <p className="text-xs text-slate-500">
                  Administrator
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 bg-primary p-6 overflow-y-auto">
          <div className="rounded-2xl shadow-md min-h-[400px] bg-light-gray">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<AdminProductPage />} />
              <Route path="/orders" element={<AdminOrdersPage />} />
              {/*<Route path="/users" element={<h1 className="text-2xl font-bold text-accent-green">Users</h1>} />*/}
              <Route path="/add-product" element={<AdminAddNewProduct />} />
              <Route path="/update-product" element={<AdminUpdateProduct />} />
              <Route path="/expenses" element={<AdminExpensePage/>} />
              <Route path="/add-expense" element={<AdminAddNewExpense/>} />
              <Route path="/update-expense" element={<AdminUpdateExpense/>} />
              <Route path="/finances" element={<AdminFinancePage/>} />
              <Route path="/add-finance" element={<AdminAddNewFinance/>} />
              <Route path="/update-finance" element={<AdminUpdateFinance/>} />
              <Route path="/users" element={<UserPage />} />
              <Route path="/drivers" element={<DriverPage />} />
              <Route path="/add-driver" element={<AddDriver />} />
              <Route path="/vehicles" element={<VehiclePage />} />
              <Route path="/add-vehicle" element={<AddVehicle />} />
              <Route path="/deliveries" element={<DeliveryPage />} />
              <Route path="/deliveries/add" element={<AddDelivery />} />
              <Route path="/feedback" element={<FeedbackPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
