import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { listWorkers, getWorkforceAnalytics } from "../../services/workerService";
import { listTasks, getTaskAnalytics } from "../../services/taskService";

export default function HRDashboard() {
  const [stats, setStats] = useState({
    totalWorkers: 0,
    availableWorkers: 0,
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    avgCompletionTime: 0,
    completionRate: 0,
    utilizationRate: 0,
    avgPerformanceRating: 0
  });
  const [recentWorkers, setRecentWorkers] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [analytics, setAnalytics] = useState({
    taskAnalytics: null,
    workforceAnalytics: null
  });

  const cssVars = {
    "--green-calm": "#2a5540",
    "--medium-gray": "#e7e9e9",
    "--light-gray": "#f7f9f9",
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load analytics data in parallel
      const [workersResponse, tasksResponse, taskAnalytics, workforceAnalytics] = await Promise.all([
        listWorkers(),
        listTasks(),
        getTaskAnalytics(),
        getWorkforceAnalytics()
      ]);
      
      const workers = workersResponse.workers || [];
      const tasks = tasksResponse.tasks || [];
      
      // Use real analytics data
      setAnalytics({
        taskAnalytics,
        workforceAnalytics
      });
      
      // Calculate stats from real data
      const availableWorkers = workers.filter(w => w.isAvailable).length;
      const completedTasks = tasks.filter(t => t.status === 'Completed').length;
      const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
      const pendingTasks = tasks.filter(t => t.status === 'To Do').length;
      
      setStats({
        totalWorkers: workers.length,
        availableWorkers,
        totalTasks: tasks.length,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        overdueTasks: taskAnalytics.overdueTasks || 0,
        avgCompletionTime: taskAnalytics.avgCompletionTime || 0,
        completionRate: taskAnalytics.completionRate || 0,
        utilizationRate: workforceAnalytics.utilizationRate || 0,
        avgPerformanceRating: workforceAnalytics.avgPerformanceRating || 0
      });
      
      // Get recent workers (last 5)
      setRecentWorkers(workers.slice(0, 5));
      
      // Get recent tasks (last 5)
      setRecentTasks(tasks.slice(0, 5));
      
      // Generate real notifications based on actual data
      const realNotifications = [];
      if (taskAnalytics.overdueTasks > 0) {
        realNotifications.push({
          id: 1,
          type: 'warning',
          message: `${taskAnalytics.overdueTasks} tasks are overdue`,
          time: 'Just now'
        });
      }
      if (availableWorkers > 0) {
        realNotifications.push({
          id: 2,
          type: 'info',
          message: `${availableWorkers} workers are available`,
          time: 'Just now'
        });
      }
      if (completedTasks > 0) {
        realNotifications.push({
          id: 3,
          type: 'success',
          message: `${completedTasks} tasks completed`,
          time: 'Just now'
        });
      }
      setNotifications(realNotifications);
      
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8" style={cssVars}>
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
    <div>
          <h2 className="text-3xl font-bold mb-2 text-[var(--green-calm)]">
              Manager Dashboard
          </h2>
          <p className="text-gray-600">Welcome back! Here's what's happening with your workforce today.</p>
        </div>
        
        {/* Quick Action Buttons */}
        <div className="flex gap-3">
          <Link
            to="/hr/workers?action=register"
            className="bg-[var(--green-calm)] text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Register Worker
          </Link>
          <Link
            to="/hr/tasks/new"
            className="bg-[var(--green-calm)] text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Task
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link
          to="/hr/workers"
          className="group bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-xl group-hover:scale-110 transition-all duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Manage Workers</h3>
              <p className="text-blue-100 text-sm">View & manage workforce</p>
            </div>
          </div>
        </Link>

        <Link
          to="/hr/tasks"
          className="group bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-xl group-hover:scale-110 transition-all duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Manage Tasks</h3>
              <p className="text-green-100 text-sm">Create & assign tasks</p>
            </div>
          </div>
        </Link>

        <Link
          to="/hr/reports"
          className="group bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-xl group-hover:scale-110 transition-all duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Generate Reports</h3>
              <p className="text-orange-100 text-sm">PDF reports</p>
            </div>
          </div>
        </Link>

        <Link
          to="/hr/analytics"
          className="group bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-xl group-hover:scale-110 transition-all duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Analytics</h3>
              <p className="text-indigo-100 text-sm">Detailed insights</p>
            </div>
          </div>
        </Link>
      </div>


      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Workers</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalWorkers}</p>
              <p className="text-xs text-green-600 mt-1">
                {analytics.workforceAnalytics?.recentRegistrations || 0} new this month
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Available Workers</p>
              <p className="text-3xl font-bold text-green-600">{stats.availableWorkers}</p>
              <p className="text-xs text-green-600 mt-1">
                {Math.round(stats.utilizationRate)}% utilization rate
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Tasks</p>
              <p className="text-3xl font-bold text-purple-600">{stats.totalTasks}</p>
              <p className="text-xs text-red-600 mt-1">{stats.overdueTasks} overdue</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Completion Rate</p>
              <p className="text-3xl font-bold text-blue-600">
                {Math.round(stats.completionRate)}%
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Avg: {stats.avgCompletionTime} days
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Workers */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Workers</h3>
            <Link to="/hr/workers" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentWorkers.length > 0 ? (
              recentWorkers.map((worker) => (
                <div key={worker.workerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {worker.name?.charAt(0) || worker.workerId?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{worker.name}</p>
                      <p className="text-sm text-gray-500">{worker.jobRole || 'No role'}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    worker.isAvailable 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {worker.isAvailable ? 'Available' : 'Busy'}
                  </span>
        </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No workers registered yet</p>
            )}
        </div>
      </div>

        {/* Recent Tasks */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Tasks</h3>
            <Link to="/hr/tasks" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All
            </Link>
        </div>
          <div className="space-y-3">
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => (
                <div key={task.taskId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-500">{task.taskId}</p>
        </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    task.status === 'To Do' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {task.status}
                  </span>
        </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No tasks created yet</p>
            )}
        </div>
      </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Notifications</h3>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className={`flex items-center gap-3 p-3 rounded-lg ${
                notification.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                notification.type === 'success' ? 'bg-green-50 border border-green-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  notification.type === 'warning' ? 'bg-yellow-500' :
                  notification.type === 'success' ? 'bg-green-500' :
                  'bg-blue-500'
                }`}></div>
                <p className="text-sm text-gray-700">{notification.message}</p>
                <span className="text-xs text-gray-500 ml-auto">{notification.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
