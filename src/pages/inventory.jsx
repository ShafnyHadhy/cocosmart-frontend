import { BsCart2, BsGraphUpArrow } from "react-icons/bs";
import { FiBox } from "react-icons/fi";
import { SiExpensify } from "react-icons/si";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { FaInvision } from "react-icons/fa";

import CocoProductDetails from "./inventory/CocoProductDetails";
import AddCocoProduct from "./inventory/AddCocoProduct";
import UpdateCocoProduct from "./inventory/UpdateCocoProduct";

import PurchasedItemDetails from "./inventory/PurchasedItemDetails";////////////
import UpdatePurchasedItem from "./inventory/UpdatePurchasedItem";
import AddPurchasedItem from "./inventory/AddPurchasedItem";

export default function Inventory() {
  const location = useLocation();

  const menuItems = [
    { path: "/inventory", label: "Dashboard", icon: <BsGraphUpArrow className="text-[15px]"/> },

    { path: "/inventory/cocoProductDetails", label: "Coco Products", icon: <FiBox /> },
    { path: "/inventory/purchasedItemDetails", label: "Purchased Items", icon: <FiBox /> },////////////////
    
  ];

  return (
    <div className="flex min-h-screen bg-white text-gray-800">

      <aside className="fixed top-0 left-0 w-64 h-screen flex flex-col bg-white z-20">
        <div className="flex h-16 items-center gap-2 border-b border-medium-gray px-6">
          <img src="/clogo.png" alt="logo" className="h-13 rounded-md" />
          <h1 className="text-xl font-bold tracking-[-0.015em] text-accent">
            Inventory
          </h1>
        </div>

        {/*<nav className="flex-1 p-4 space-y-2 overflow-hidden">*/}
        <nav className="flex-1 mt-3 p-4 space-y-3 overflow-hidden">
          {menuItems.map((item, index) => (
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
        <header className="sticky top-0 z-10 flex h-16 items-center justify-end whitespace-nowrap border-b border-gray-200 bg-white/80 px-6 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <button className="rounded-lg px-4 py-1 text-md font-normal text-gray-500 border-1 border-accent cursor-pointer hover:bg-gray-200 hover:text-accent transition">
              Logout
            </button>
            <button className="rounded-full px-3 py-1 font-bold text-white  bg-accent border-1 border-accent cursor-pointer hover:bg-gray-100 hover:text-gray-900 transition">
              A
            </button>
          </div>
        </header>

        <main className="flex-1 bg-primary p-6 overflow-y-auto">
          <div className="rounded-2xl shadow-md min-h-[400px] bg-light-gray">
            <Routes>
            <Route index element={<h1>Dashboard</h1>} />
            <Route path="cocoProductDetails" element={<CocoProductDetails />} />
            <Route path="addCocoProduct" element={<AddCocoProduct />} />
            <Route path="updateCocoProducts/:id" element={<UpdateCocoProduct />} />
            <Route path="purchasedItemDetails" element={<PurchasedItemDetails />} />
            <Route path="updatePurchasedItems/:id" element={<UpdatePurchasedItem />} />
            <Route path="addPurchasedItem" element={<AddPurchasedItem />} />
          </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}