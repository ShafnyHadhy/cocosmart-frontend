import React, { useEffect, useMemo, useState } from "react";
import { listWorkers, createWorker as apiCreateWorker, deleteWorker as apiDeleteWorker, updateWorker as apiUpdateWorker, listEligibleWorkerUsers as apiListEligible, getWorkerWithTasks } from "../../services/workerService";
import { createTask } from "../../services/taskService";

export default function WorkerList() {
  const [workers, setWorkers] = useState([]);
  const [q, setQ] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [form, setForm] = useState({ workerId: "", userEmail: "", jobRole: "", dateOfBirth: "" });
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignForm, setAssignForm] = useState({ taskId: "", title: "", priority: "Medium", scheduledDate: "", scheduledTime: "" });
  const [sortBy, setSortBy] = useState("recent");
  const [loading, setLoading] = useState(true);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateForm, setUpdateForm] = useState({ workerId: "", userEmail: "", jobRole: "", dateOfBirth: "" });

  const cssVars = {
    "--green-calm": "#2a5540",
    "--medium-gray": "#e7e9e9",
    "--light-gray": "#f7f9f9",
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await listWorkers();
      setWorkers((data.workers || []).map(w => ({
        workerId: w.workerId,
        name: w.userEmail,
        jobRole: w.jobRole || "",
        isAvailable: w.isAvailable,
        createdAt: w.createdAt
      })));
    } catch (error) {
      console.error("Error loading workers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let result = workers;
    
    if (q.trim()) {
      const qq = q.toLowerCase();
      result = result.filter((w) =>
        w.workerId.toLowerCase().includes(qq) ||
        (w.name || "").toLowerCase().includes(qq) ||
        (w.jobRole || "").toLowerCase().includes(qq)
      );
    }
    
    switch (sortBy) {
      case "name":
        return result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      case "id":
        return result.sort((a, b) => a.workerId.localeCompare(b.workerId));
      case "recent":
      default:
        return result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
  }, [workers, q, sortBy]);

  const openAdd = async () => {
    const u = await apiListEligible();
    setEligibleUsers(u.users || []);
    setForm({ workerId: "", userEmail: "", jobRole: "", dateOfBirth: "" });
    setShowAdd(true);
  };

  const submitAdd = async (e) => {
    e.preventDefault();
    if (!form.workerId || !form.userEmail || !form.dateOfBirth) return;
    
    const today = new Date();
    const birthDate = new Date(form.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 18 || age > 40) {
      alert("Age must be between 18 and 40 years");
      return;
    }
    
    await apiCreateWorker({ 
      workerId: form.workerId, 
      userEmail: form.userEmail, 
      jobRole: form.jobRole,
      dateOfBirth: form.dateOfBirth
    });
    setShowAdd(false);
    load();
  };

  const viewProfile = async (workerId) => {
    const data = await getWorkerWithTasks(workerId);
    setSelectedWorker(data.worker);
    setShowProfile(true);
  };

  const assignTask = (workerId) => {
    setAssignForm({ taskId: "", title: "", priority: "Medium", scheduledDate: "", scheduledTime: "" });
    setShowAssignForm(true);
  };

  const submitAssign = async (e) => {
    e.preventDefault();
    if (!assignForm.taskId || !assignForm.title) return;
    
    await createTask({
      taskId: assignForm.taskId,
      title: assignForm.title,
      priority: assignForm.priority,
      scheduledDate: assignForm.scheduledDate,
      scheduledTime: assignForm.scheduledTime,
      assignedWorkers: [workers.find(w => w.workerId === assignForm.taskId)?.workerId].filter(Boolean)
    });
    setShowAssignForm(false);
  };

  const deleteWorker = async (workerId) => {
    if (window.confirm("Are you sure you want to delete this worker?")) {
      await apiDeleteWorker(workerId);
      load();
    }
  };

  const openUpdate = async (worker) => {
    setUpdateForm({
      workerId: worker.workerId,
      userEmail: worker.name,
      jobRole: worker.jobRole || "",
      dateOfBirth: worker.dateOfBirth || ""
    });
    setShowUpdateForm(true);
  };

  const submitUpdate = async (e) => {
    e.preventDefault();
    if (!updateForm.workerId || !updateForm.userEmail) return;
    
    await apiUpdateWorker(updateForm.workerId, {
      userEmail: updateForm.userEmail,
      jobRole: updateForm.jobRole,
      dateOfBirth: updateForm.dateOfBirth
    });
    setShowUpdateForm(false);
    load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading workers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={cssVars}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workers</h2>
          <p className="text-gray-600">Manage your workforce</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-[var(--green-calm)] hover:bg-[var(--green-calm)]/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Register Worker
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Search:</label>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search workers..."
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="recent">Recent</option>
              <option value="name">Name</option>
              <option value="id">Worker ID</option>
            </select>
          </div>
        </div>
      </div>

      {/* Workers Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[var(--green-calm)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Worker ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Job Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Registered Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((worker, index) => (
                <tr key={worker.workerId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {worker.workerId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {worker.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {worker.jobRole || 'Not specified'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      worker.isAvailable 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {worker.isAvailable ? 'Available' : 'Busy'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {worker.createdAt ? new Date(worker.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewProfile(worker.workerId)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100 transition-colors"
                        title="View Profile"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => openUpdate(worker)}
                        className="text-yellow-600 hover:text-yellow-900 p-1 rounded-full hover:bg-yellow-100 transition-colors"
                        title="Update Worker"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => assignTask(worker.workerId)}
                        className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-100 transition-colors"
                        title="Assign Task"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteWorker(worker.workerId)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100 transition-colors"
                        title="Delete Worker"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No workers found
          </div>
        )}
      </div>

      {/* Register Worker Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 relative shadow-2xl">
            <button
              onClick={() => setShowAdd(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-6 pr-8">Register New Worker</h2>
            
            <form onSubmit={submitAdd} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Worker ID</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.workerId}
                  onChange={(e) => setForm(prev => ({ ...prev, workerId: e.target.value }))}
                  required
                  placeholder="Enter unique worker ID"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Select User</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.userEmail}
                  onChange={(e) => setForm(prev => ({ ...prev, userEmail: e.target.value }))}
                  required
                >
                  <option value="">Select a user...</option>
                  {eligibleUsers.map(user => (
                    <option key={user.email} value={user.email}>
                      {user.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.dateOfBirth}
                  onChange={(e) => setForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Job Role</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={form.jobRole}
                  onChange={(e) => setForm(prev => ({ ...prev, jobRole: e.target.value }))}
                  required
                >
                  <option value="">Select job role...</option>
                  <option value="General">General</option>
                  <option value="Harvesting">Harvesting</option>
                  <option value="Planting">Planting</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Quality Control">Quality Control</option>
                  <option value="Packaging">Packaging</option>
                  <option value="Transportation">Transportation</option>
                </select>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg font-medium transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  Register Worker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Worker Profile Modal */}
      {showProfile && selectedWorker && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={() => setShowProfile(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-6 pr-8">Worker Profile</h2>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                  {selectedWorker.name?.charAt(0) || selectedWorker.workerId?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedWorker.name}</h3>
                  <p className="text-gray-600">Worker ID: {selectedWorker.workerId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{selectedWorker.userEmail}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Job Role</label>
                  <p className="text-gray-900">{selectedWorker.jobRole || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Age</label>
                  <p className="text-gray-900">{selectedWorker.age || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-gray-900">{selectedWorker.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Availability</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedWorker.isAvailable 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedWorker.isAvailable ? 'Available' : 'Busy'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <p className="text-gray-900">{selectedWorker.dateOfBirth ? new Date(selectedWorker.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>

              {selectedWorker.assignedTasks && selectedWorker.assignedTasks.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Tasks</label>
                  <div className="space-y-2">
                    {selectedWorker.assignedTasks.map(task => (
                      <div key={task.taskId} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-gray-600">Status: {task.status}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Task Modal */}
      {showAssignForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 relative shadow-2xl">
            <button
              onClick={() => setShowAssignForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-6 pr-8">Assign Task</h2>
            
            <form onSubmit={submitAssign} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Task ID</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={assignForm.taskId}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, taskId: e.target.value }))}
                  required
                  placeholder="Enter task ID"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Task Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={assignForm.title}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Priority</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={assignForm.priority}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Scheduled Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={assignForm.scheduledDate}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Scheduled Time</label>
                <input
                  type="time"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={assignForm.scheduledTime}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAssignForm(false)}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg font-medium transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Worker Modal */}
      {showUpdateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 relative shadow-2xl">
            <button
              onClick={() => setShowUpdateForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-6 pr-8">Update Worker</h2>
            
            <form onSubmit={submitUpdate} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Worker ID</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={updateForm.workerId}
                  disabled
                  placeholder="Worker ID"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={updateForm.userEmail}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, userEmail: e.target.value }))}
                  required
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Job Role</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={updateForm.jobRole}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, jobRole: e.target.value }))}
                  required
                >
                  <option value="">Select job role...</option>
                  <option value="General">General</option>
                  <option value="Harvesting">Harvesting</option>
                  <option value="Planting">Planting</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Quality Control">Quality Control</option>
                  <option value="Packaging">Packaging</option>
                  <option value="Transportation">Transportation</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={updateForm.dateOfBirth}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowUpdateForm(false)}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg font-medium transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  Update Worker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}