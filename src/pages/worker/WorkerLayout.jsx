import React from "react";
import { NavLink, Outlet, useLocation, Link } from "react-router-dom";
import { useWorker } from "../../contexts/WorkerContext";

export default function WorkerLayout() {
  const location = useLocation();
  const { workerData, logout, isLoggedIn } = useWorker();

  const cssVars = {
    "--green-calm": "#2a5540",
    "--medium-gray": "#e7e9e9",
    "--light-gray": "#f7f9f9",
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-full h-full" style={cssVars}>
      <div className="flex min-h-screen bg-white text-gray-800" style={{ fontFamily: "'Spline Sans', 'Noto Sans', sans-serif" }}>
        <aside className="flex w-64 flex-col bg-[var(--light-gray)]">
          <div className="flex h-16 items-center gap-4 border-b border-[var(--medium-gray)] px-6">
            <img src="/cocosmart logo.jpg" alt="CocoSmart logo" className="h-8 w-8 object-contain" />
            <h1 className="text-xl font-bold tracking-[-0.015em] text-gray-900">CocoSmart</h1>
          </div>

          <nav className="flex-1 space-y-2 p-4">
            <NavLink
              to="/worker"
              end
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                isActive("/worker")
                  ? "bg-[var(--green-calm)] text-white"
                  : "text-gray-700 hover:bg-[var(--medium-gray)] hover:text-gray-900"
              }`}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/worker/tasks"
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                isActive("/worker/tasks")
                  ? "bg-[var(--green-calm)] text-white"
                  : "text-gray-700 hover:bg-[var(--medium-gray)] hover:text-gray-900"
              }`}
            >
              My Tasks
            </NavLink>
            <NavLink
              to="/worker/notifications"
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                isActive("/worker/notifications")
                  ? "bg-[var(--green-calm)] text-white"
                  : "text-gray-700 hover:bg-[var(--medium-gray)] hover:text-gray-900"
              }`}
            >
              Notifications
            </NavLink>
            <NavLink
              to="/worker/profile"
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                isActive("/worker/profile")
                  ? "bg-[var(--green-calm)] text-white"
                  : "text-gray-700 hover:bg-[var(--medium-gray)] hover:text-gray-900"
              }`}
            >
              My Profile
            </NavLink>
          </nav>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 bg-white/80 px-10 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">CocoSmart Worker Portal</h1>
              {isLoggedIn && workerData && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Welcome, {workerData.name}</span>
                  <span className="text-gray-400">|</span>
                  <span>ID: {workerData.workerId}</span>
                </div>
              )}
            </div>
            {isLoggedIn && (
              <div className="flex items-center gap-4">
                {/* Notification Bell */}
                <Link
                  to="/worker/notifications"
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Notifications"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {/* Notification Badge - You can add logic to show/hide based on unread notifications */}
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
                </Link>
                
                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
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


