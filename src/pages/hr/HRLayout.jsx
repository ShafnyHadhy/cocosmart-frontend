// src/layouts/HRLayout.jsx
import React, { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { BsGraphUpArrow, BsList } from "react-icons/bs";
import { HiOutlineUsers } from "react-icons/hi";
import { FiTrash2 } from "react-icons/fi";

export default function HRLayout() {
  const location = useLocation();
  const [openTasks, setOpenTasks] = useState(
    location.pathname.startsWith("/hr/tasks") ||
    location.pathname === "/hr/completed" ||
    location.pathname === "/hr/in-progress" ||
    location.pathname === "/hr/todo"
  );

  const isActive = (path) => location.pathname === path;

  const cssVars = {
    "--green-calm": "#2a5540",
    "--earth-brown": "#a07a5f",
    "--earth-orange": "#d88c4b",
    "--accent-red": "#ef4444",
    "--accent-blue": "#3b82f6",
    "--accent-green": "#22c55e",
    "--light-gray": "#f7f9f9",
    "--medium-gray": "#e7e9e9",
  };

  return (
    <div className="w-full h-full" style={cssVars}>
      <div
        className="flex min-h-screen bg-white text-gray-800"
        style={{ fontFamily: "'Spline Sans', 'Noto Sans', sans-serif" }}
      >
        {/* Sidebar */}
        <aside className="flex w-64 flex-col bg-[var(--light-gray)]">
          <div className="flex h-16 items-center gap-4 border-b border-[var(--medium-gray)] px-6">
            <svg className="h-8 w-8 text-[var(--green-calm)]" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M32.5,6.5C32.5,15.869,25.369,23,16,23S-0.5,15.869-0.5,6.5S6.631-2.5,16-2.5S32.5-2.869,32.5,6.5Z" fill="currentColor" fillRule="evenodd" transform="translate(8 5)"></path>
              <path clipRule="evenodd" d="M32,32C32,22.631,24.869,15.5,15.5,15.5S-1,22.631-1,32S6.131,48.5,15.5,48.5S32,41.369,32,32Z" fill="currentColor" fillOpacity="0.6" fillRule="evenodd" transform="translate(8 5)"></path>
            </svg>
            <h1 className="text-xl font-bold tracking-[-0.015em] text-gray-900">CocoSmart</h1>
          </div>

          <nav className="flex-1 space-y-2 p-4">
            <NavLink
              to="/hr"
              end
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                isActive("/hr")
                  ? "bg-[var(--green-calm)] text-white"
                  : "text-gray-700 hover:bg-[var(--medium-gray)] hover:text-gray-900"
              }`}
            >
              <BsGraphUpArrow className="text-lg" />
              Dashboard
            </NavLink>

            {/* Tasks dropdown */}
            <button
              onClick={() => setOpenTasks((s) => !s)}
              className={`w-full flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                location.pathname.startsWith("/hr/tasks") ||
                location.pathname === "/hr/completed" ||
                location.pathname === "/hr/in-progress" ||
                location.pathname === "/hr/todo"
                  ? "bg-[var(--green-calm)] text-white"
                  : "text-gray-700 hover:bg-[var(--medium-gray)] hover:text-gray-900"
              }`}
            >
              <BsList className="text-lg" />
              Tasks
              <span className="ml-auto text-xs">{openTasks ? "▾" : "▸"}</span>
            </button>

            {openTasks && (
              <ul className="ml-4 space-y-1 border-l border-gray-300 pl-4">
                <li>
                  <NavLink
                    to="/hr/tasks"
                    className={`block rounded-lg px-3 py-2 text-sm ${
                      isActive("/hr/tasks")
                        ? "bg-[var(--green-calm)]/10 text-gray-900"
                        : "text-gray-600 hover:bg-[var(--medium-gray)] hover:text-gray-900"
                    }`}
                  >
                    All Tasks
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/hr/completed"
                    className={`block rounded-lg px-3 py-2 text-sm ${
                      isActive("/hr/completed")
                        ? "bg-[var(--green-calm)]/10 text-gray-900"
                        : "text-gray-600 hover:bg-[var(--medium-gray)] hover:text-gray-900"
                    }`}
                  >
                    Completed
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/hr/in-progress"
                    className={`block rounded-lg px-3 py-2 text-sm ${
                      isActive("/hr/in-progress")
                        ? "bg-[var(--green-calm)]/10 text-gray-900"
                        : "text-gray-600 hover:bg-[var(--medium-gray)] hover:text-gray-900"
                    }`}
                  >
                    In Progress
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/hr/todo"
                    className={`block rounded-lg px-3 py-2 text-sm ${
                      isActive("/hr/todo")
                        ? "bg-[var(--green-calm)]/10 text-gray-900"
                        : "text-gray-600 hover:bg-[var(--medium-gray)] hover:text-gray-900"
                    }`}
                  >
                    To Do
                  </NavLink>
                </li>
              </ul>
            )}

            <NavLink
              to="/hr/workers"
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive("/hr/workers")
                  ? "bg-[var(--green-calm)] text-white"
                  : "text-gray-700 hover:bg-[var(--medium-gray)] hover:text-gray-900"
              }`}
            >
              <HiOutlineUsers className="text-lg" />
              Workers
            </NavLink>

            <NavLink
              to="/hr/reports"
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive("/hr/reports")
                  ? "bg-[var(--green-calm)] text-white"
                  : "text-gray-700 hover:bg-[var(--medium-gray)] hover:text-gray-900"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Reports
            </NavLink>

            <NavLink
              to="/hr/analytics"
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive("/hr/analytics")
                  ? "bg-[var(--green-calm)] text-white"
                  : "text-gray-700 hover:bg-[var(--medium-gray)] hover:text-gray-900"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analytics
            </NavLink>

            <NavLink
              to="/hr/trash"
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive("/hr/trash")
                  ? "bg-[var(--green-calm)] text-white"
                  : "text-gray-700 hover:bg-[var(--medium-gray)] hover:text-gray-900"
              }`}
            >
              <FiTrash2 className="text-lg" />
              Trash
            </NavLink>
          </nav>
        </aside>

        {/* Right: header + content */}
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 bg-white/80 px-10 backdrop-blur-sm">
            <div />
            <div className="flex items-center gap-4">
              <button className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                  <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
                </svg>
              </button>
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 h-10"
                style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDpsYYWf6MRv9HKu0OsboL6ji_8RqY7vTqjC-U_rQzjtYYgcwjoTdCzMqBLwUIEJrkBLSh6W4q7ZLHoL1Fdn8Ex7SByzaWKUwrOZzBkmtaio8QQMlRFDIALhHlRqo-g5VBBiId1mwmGC5FOllgxAPsbM-a8A5kLv4CEjEi-ANfiKV_ydNSy4VRDe7-Mwdn8_y0HgSmlWvKSPLcT4i84i68fLEZkgKOD_XFaFax_gD8qWSwQJceyIVMBVhweOgDZtP0SnKc1uu5uxUrR")` }}
              />
            </div>
          </header>

          <main className="flex-1 bg-white px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
