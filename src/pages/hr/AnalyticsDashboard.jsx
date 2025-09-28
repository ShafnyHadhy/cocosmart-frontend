import React, { useState, useEffect } from "react";
import { getTaskAnalytics, getWorkerAnalytics } from "../../services/taskService";
import { getWorkforceAnalytics } from "../../services/workerService";

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState({
    taskAnalytics: null,
    workforceAnalytics: null,
    loading: true
  });

  const loadAnalytics = async () => {
    try {
      setAnalytics(prev => ({ ...prev, loading: true }));
      
      const [taskAnalytics, workforceAnalytics] = await Promise.all([
        getTaskAnalytics(),
        getWorkforceAnalytics()
      ]);
      
      setAnalytics({
        taskAnalytics,
        workforceAnalytics,
        loading: false
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
      setAnalytics(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (analytics.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Analytics Dashboard
        </h2>
        <p className="text-gray-600">Comprehensive insights into workforce and task performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.taskAnalytics?.totalTasks || 0}</p>
              <p className="text-xs text-green-600 mt-1">
                {analytics.taskAnalytics?.completionRate?.toFixed(1)}% completion rate
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Overdue Tasks</p>
              <p className="text-3xl font-bold text-red-600">{analytics.taskAnalytics?.overdueTasks || 0}</p>
              <p className="text-xs text-red-600 mt-1">Requires attention</p>
            </div>
            <div className="p-3 bg-red-100 rounded-xl">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Avg Completion Time</p>
              <p className="text-3xl font-bold text-purple-600">
                {analytics.taskAnalytics?.avgCompletionTime?.toFixed(1) || 0} days
              </p>
              <p className="text-xs text-purple-600 mt-1">Per task</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Workforce Rating</p>
              <p className="text-3xl font-bold text-green-600">
                {analytics.workforceAnalytics?.avgPerformanceRating?.toFixed(1) || 0}/5
              </p>
              <p className="text-xs text-green-600 mt-1">
                {analytics.workforceAnalytics?.utilizationRate?.toFixed(1)}% utilization
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Task Status Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium">Completed</span>
              </div>
              <div className="flex items-center">
                <span className="text-lg font-bold text-green-600 mr-2">
                  {analytics.taskAnalytics?.completedTasks || 0}
                </span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ 
                      width: `${analytics.taskAnalytics?.totalTasks > 0 
                        ? (analytics.taskAnalytics.completedTasks / analytics.taskAnalytics.totalTasks) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium">In Progress</span>
              </div>
              <div className="flex items-center">
                <span className="text-lg font-bold text-yellow-600 mr-2">
                  {analytics.taskAnalytics?.inProgressTasks || 0}
                </span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ 
                      width: `${analytics.taskAnalytics?.totalTasks > 0 
                        ? (analytics.taskAnalytics.inProgressTasks / analytics.taskAnalytics.totalTasks) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium">To Do</span>
              </div>
              <div className="flex items-center">
                <span className="text-lg font-bold text-gray-600 mr-2">
                  {analytics.taskAnalytics?.todoTasks || 0}
                </span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gray-500 h-2 rounded-full" 
                    style={{ 
                      width: `${analytics.taskAnalytics?.totalTasks > 0 
                        ? (analytics.taskAnalytics.todoTasks / analytics.taskAnalytics.totalTasks) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium">On Hold</span>
              </div>
              <div className="flex items-center">
                <span className="text-lg font-bold text-orange-600 mr-2">
                  {analytics.taskAnalytics?.onHoldTasks || 0}
                </span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ 
                      width: `${analytics.taskAnalytics?.totalTasks > 0 
                        ? (analytics.taskAnalytics.onHoldTasks / analytics.taskAnalytics.totalTasks) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Priority Distribution</h3>
          <div className="space-y-3">
            {analytics.taskAnalytics?.priorityStats && Object.entries(analytics.taskAnalytics.priorityStats).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    priority === 'Critical' ? 'bg-red-500' :
                    priority === 'High' ? 'bg-orange-500' :
                    priority === 'Medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}></div>
                  <span className="text-sm font-medium">{priority}</span>
                </div>
                <span className="text-sm font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Workforce Analytics */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Workforce Analytics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium">Available Workers</span>
              </div>
              <span className="text-lg font-bold text-green-600">
                {analytics.workforceAnalytics?.availableWorkers || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium">Busy Workers</span>
              </div>
              <span className="text-lg font-bold text-red-600">
                {analytics.workforceAnalytics?.busyWorkers || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium">Recent Registrations</span>
              </div>
              <span className="text-lg font-bold text-blue-600">
                {analytics.workforceAnalytics?.recentRegistrations || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium">Utilization Rate</span>
              </div>
              <span className="text-lg font-bold text-purple-600">
                {analytics.workforceAnalytics?.utilizationRate?.toFixed(1) || 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Top Performers</h3>
          <div className="space-y-3">
            {analytics.workforceAnalytics?.topPerformers?.length > 0 ? (
              analytics.workforceAnalytics.topPerformers.map((performer, index) => (
                <div key={performer.workerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{performer.workerId}</p>
                      <p className="text-sm text-gray-600">{performer.totalTasksCompleted} tasks completed</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < performer.performanceRating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No performance data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      {analytics.taskAnalytics?.categoryStats && Object.keys(analytics.taskAnalytics.categoryStats).length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Task Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(analytics.taskAnalytics.categoryStats).map(([category, count]) => (
              <div key={category} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-600">{category}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
