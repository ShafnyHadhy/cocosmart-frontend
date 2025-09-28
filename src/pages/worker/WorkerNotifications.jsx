import React, { useState, useEffect } from 'react';
import { useWorker } from '../../contexts/WorkerContext';
import { getTasksForWorker } from '../../services/taskService';
import { Link } from 'react-router-dom';

export default function WorkerNotifications() {
  const { workerId, isLoggedIn, isLoading: contextLoading } = useWorker();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const cssVars = {
    "--green-calm": "#2a5540",
    "--medium-gray": "#e7e9e9",
    "--light-gray": "#f7f9f9",
  };

  const loadNotifications = async () => {
    if (!isLoggedIn || !workerId) return;
    
    setLoading(true);
    try {
      const response = await getTasksForWorker(workerId);
      const tasks = response.tasks || [];
      
      // Generate notifications based on task status
      const newNotifications = [];
      
      // New tasks assigned
      const newTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        const now = new Date();
        const diffHours = (now - taskDate) / (1000 * 60 * 60);
        return diffHours <= 24 && task.status === 'To Do';
      });
      
      if (newTasks.length > 0) {
        newNotifications.push({
          id: 'new-tasks',
          type: 'info',
          title: 'New Tasks Assigned',
          message: `You have ${newTasks.length} new task(s) assigned to you`,
          time: 'Just now',
          action: '/worker/tasks'
        });
      }
      
      // Overdue tasks
      const overdueTasks = tasks.filter(task => {
        if (!task.scheduledDate || task.status === 'Completed') return false;
        return new Date(task.scheduledDate) < new Date() && task.status !== 'Completed';
      });
      
      if (overdueTasks.length > 0) {
        newNotifications.push({
          id: 'overdue-tasks',
          type: 'warning',
          title: 'Overdue Tasks',
          message: `You have ${overdueTasks.length} overdue task(s) that need attention`,
          time: 'Just now',
          action: '/worker/tasks'
        });
      }
      
      // Completed tasks today
      const today = new Date();
      const completedToday = tasks.filter(task => {
        if (!task.completedAt) return false;
        const completedDate = new Date(task.completedAt);
        return completedDate.toDateString() === today.toDateString();
      });
      
      if (completedToday.length > 0) {
        newNotifications.push({
          id: 'completed-today',
          type: 'success',
          title: 'Great Work!',
          message: `You completed ${completedToday.length} task(s) today`,
          time: 'Just now',
          action: '/worker/tasks'
        });
      }
      
      // Tasks due today
      const dueToday = tasks.filter(task => {
        if (!task.scheduledDate || task.status === 'Completed') return false;
        const scheduledDate = new Date(task.scheduledDate);
        return scheduledDate.toDateString() === today.toDateString();
      });
      
      if (dueToday.length > 0) {
        newNotifications.push({
          id: 'due-today',
          type: 'info',
          title: 'Tasks Due Today',
          message: `You have ${dueToday.length} task(s) due today`,
          time: 'Just now',
          action: '/worker/tasks'
        });
      }
      
      setNotifications(newNotifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && workerId) {
      loadNotifications();
      
      // Refresh notifications every 30 seconds
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, workerId]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (contextLoading || loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading notifications...</span>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V1H4v4zM15 3h5l-5-5v5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
        <p className="text-gray-600">Please log in to see your notifications.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={cssVars}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-600">Stay updated with your task assignments</p>
        </div>
        <button
          onClick={loadNotifications}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh notifications"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200 ${
                notification.type === 'warning' ? 'border-l-4 border-l-yellow-500' :
                notification.type === 'success' ? 'border-l-4 border-l-green-500' :
                'border-l-4 border-l-blue-500'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-full ${
                  notification.type === 'warning' ? 'bg-yellow-100' :
                  notification.type === 'success' ? 'bg-green-100' :
                  'bg-blue-100'
                }`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{notification.title}</h3>
                  <p className="text-gray-600 mb-3">{notification.message}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{notification.time}</span>
                    {notification.action && (
                      <Link
                        to={notification.action}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        View Details →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V1H4v4zM15 3h5l-5-5v5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
            <p className="text-gray-600">You're all caught up! Check back later for updates.</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/worker/tasks"
          className="bg-[var(--green-calm)] text-white p-4 rounded-xl hover:bg-[var(--green-calm)]/90 transition-colors text-center"
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="font-medium">View My Tasks</span>
          </div>
        </Link>
        
        <Link
          to="/worker/profile"
          className="bg-gray-100 text-gray-700 p-4 rounded-xl hover:bg-gray-200 transition-colors text-center"
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="font-medium">My Profile</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
