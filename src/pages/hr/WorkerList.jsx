import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { listWorkers, createWorker as apiCreateWorker, deleteWorker as apiDeleteWorker, updateWorker as apiUpdateWorker, listEligibleWorkerUsers as apiListEligible, getWorkerWithTasks } from "../../services/workerService";
import { createTask, getTasks } from "../../services/taskService";

export default function WorkerList() {
  const location = useLocation();
  const [workers, setWorkers] = useState([]);
  const [q, setQ] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [form, setForm] = useState({ workerId: "", userEmail: "", jobRole: "", dateOfBirth: "", nic: "" });
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showAssignOptions, setShowAssignOptions] = useState(false);
  const [selectedWorkerForTask, setSelectedWorkerForTask] = useState(null);
  const [assignForm, setAssignForm] = useState({ taskId: "", title: "", priority: "Medium", scheduledDate: "", scheduledTime: "" });
  const [sortBy, setSortBy] = useState("recent");
  const [roleFilter, setRoleFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateForm, setUpdateForm] = useState({ workerId: "", userEmail: "", jobRole: "", dateOfBirth: "", nic: "" });
  const [existingTasks, setExistingTasks] = useState([]);
  const [showExistingTasks, setShowExistingTasks] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);

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
        userEmail: w.userEmail,
        name: w.name || w.userEmail, // Use the name field from backend, fallback to email
        jobRole: w.jobRole || "",
        isAvailable: w.isAvailable,
        dateOfBirth: w.dateOfBirth,
        nic: w.nic,
        createdAt: w.createdAt
      })));
    } catch (error) {
      console.error("Error loading workers:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingTasks = async () => {
    setLoadingTasks(true);
    try {
      console.log("Loading existing tasks...");
      const data = await getTasks();
      console.log("Loaded tasks data:", data);
      console.log("Tasks array:", data.tasks);
      console.log("Tasks length:", data.tasks?.length || 0);
      setExistingTasks(data.tasks || []);
    } catch (error) {
      console.error("Error loading existing tasks:", error);
      console.error("Error details:", error.response?.data || error.message);
      setExistingTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  const openAdd = useCallback(async () => {
    const u = await apiListEligible();
    setEligibleUsers(u.users || []);
    setForm({ workerId: "", userEmail: "", jobRole: "", dateOfBirth: "", nic: "" });
    setShowAdd(true);
  }, []);

  useEffect(() => { 
    load(); 
    
    // Check if we should auto-open the register form
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('action') === 'register') {
      openAdd();
    }
  }, [location.search, openAdd]);

  const filtered = useMemo(() => {
    let result = workers;
    
    // Apply search filter
    if (q.trim()) {
      const qq = q.toLowerCase();
      result = result.filter((w) =>
        w.workerId.toLowerCase().startsWith(qq) ||
        (w.name || "").toLowerCase().startsWith(qq) ||
        (w.jobRole || "").toLowerCase().startsWith(qq)
      );
    }
    
    // Apply role filter
    if (roleFilter) {
      result = result.filter((w) => w.jobRole === roleFilter);
    }
    
    // Apply availability filter
    if (availabilityFilter) {
      if (availabilityFilter === "available") {
        result = result.filter((w) => w.isAvailable);
      } else if (availabilityFilter === "busy") {
        result = result.filter((w) => !w.isAvailable);
      }
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
  }, [workers, q, sortBy, roleFilter, availabilityFilter]);

  const submitAdd = async (e) => {
    e.preventDefault();
    if (!form.workerId || !form.userEmail || !form.dateOfBirth || !form.nic) return;
    
    
    const today = new Date();
    const birthDate = new Date(form.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 18 || age > 45) {
      alert("Age must be between 18 and 45 years");
      return;
    }
    
    await apiCreateWorker({ 
      workerId: form.workerId, 
      userEmail: form.userEmail, 
      jobRole: form.jobRole,
      dateOfBirth: form.dateOfBirth,
      nic: form.nic
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
    setSelectedWorkerForTask(workerId);
    setShowAssignOptions(true);
  };

  const assignExistingTask = async () => {
    setShowAssignOptions(false);
    await loadExistingTasks();
    setShowExistingTasks(true);
  };

  const createNewTask = () => {
    setShowAssignOptions(false);
    // Redirect to create new task form with the worker pre-selected
    window.location.href = `/hr/tasks/new?workerId=${selectedWorkerForTask}`;
  };

  const assignWorkerToTask = async (taskId) => {
    try {
      console.log('Assigning worker to task:', { taskId, workerId: selectedWorkerForTask });
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workerId: selectedWorkerForTask
        })
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Assignment successful:', result);
        alert('Worker assigned to task successfully!');
        setShowExistingTasks(false);
        load(); // Refresh workers list
      } else {
        const error = await response.json();
        console.error('Assignment error:', error);
        alert('Error assigning worker: ' + (error.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error assigning worker to task:', error);
      alert('Error assigning worker to task: ' + error.message);
    }
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
    console.log("Opening update for worker:", worker); // Debug log
    setUpdateForm({
      workerId: worker.workerId,
      userEmail: worker.name || worker.userEmail || "",
      jobRole: worker.jobRole || "",
      dateOfBirth: worker.dateOfBirth ? new Date(worker.dateOfBirth).toISOString().split('T')[0] : "",
      nic: worker.nic || ""
    });
    setShowUpdateForm(true);
  };

  const submitUpdate = async (e) => {
    e.preventDefault();
    if (!updateForm.workerId || !updateForm.dateOfBirth || !updateForm.nic) return;
    
    
    const today = new Date();
    const birthDate = new Date(updateForm.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 18 || age > 45) {
      alert("Age must be between 18 and 45 years");
      return;
    }
    
    await apiUpdateWorker(updateForm.workerId, {
      jobRole: updateForm.jobRole,
      dateOfBirth: updateForm.dateOfBirth,
      nic: updateForm.nic
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

      {/* Professional Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Filters</span>
          </div>
          <button
            onClick={() => {
              setQ("");
              setRoleFilter("");
              setAvailabilityFilter("");
              setSortBy("recent");
            }}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Clear
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search workers..."
              className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--green-calm)] focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--green-calm)] focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="">All Roles</option>
              <option value="Plantation">Plantation</option>
              <option value="Harvesting">Harvesting</option>
              <option value="Processing">Processing</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Administration">Administration</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Availability Filter */}
          <div className="relative">
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--green-calm)] focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Sort Filter */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--green-calm)] focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="recent">Recent</option>
              <option value="name">Name</option>
              <option value="id">Worker ID</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
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
        <div className="fixed inset-0 bg-[var(--green-calm)] bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 relative shadow-2xl">
            <button
              onClick={() => setShowAdd(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-6 pr-8 text-[var(--green-calm)]">Register New Worker</h2>
            
            <form onSubmit={submitAdd} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Worker ID</label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    form.workerId && !/^[a-zA-Z0-9\-]*$/.test(form.workerId) 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  value={form.workerId}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow alphanumeric and hyphens
                    const isValid = value.split('').every(char => 
                      /[a-zA-Z0-9\-]/.test(char)
                    );
                    if (isValid) {
                      setForm(prev => ({ ...prev, workerId: value }));
                    }
                  }}
                  required
                  placeholder="Enter unique worker ID (letters, numbers, hyphens only)"
                />
                {form.workerId && !/^[a-zA-Z0-9\-]+$/.test(form.workerId) && (
                  <p className="text-red-500 text-sm mt-1">Worker ID can only contain letters, numbers, and hyphens (-)</p>
                )}
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
                <label className="block mb-2 text-sm font-medium text-gray-700">NIC Number</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--green-calm)] focus:border-transparent"
                  value={form.nic}
                  onChange={(e) => {
                    const value = e.target.value;
                    const name = "nic";
                    if (name === "nic") {
                      if (/^[0-9]{0,9}[Vv]?$/.test(value) || /^[0-9]{0,12}$/.test(value)) {
                        setForm((prev) => ({ ...prev, [name]: value }));
                      }
                      return;
                    }
                  }}
                  required
                  placeholder="Enter NIC number (9 digits + V or 12 digits)"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--green-calm)] focus:border-transparent"
                  value={form.dateOfBirth}
                  onChange={(e) => {
                    setForm(prev => ({ ...prev, dateOfBirth: e.target.value }));
                  }}
                  onBlur={(e) => {
                    const selectedDate = e.target.value;
                    if (selectedDate) {
                      const today = new Date();
                      const birthDate = new Date(selectedDate);
                      let age = today.getFullYear() - birthDate.getFullYear();
                      const monthDiff = today.getMonth() - birthDate.getMonth();
                      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                      }
                      
                      // If age is less than 18, auto-correct to exactly 18 years ago
                      if (age < 18) {
                        const correctedDate = new Date();
                        correctedDate.setFullYear(correctedDate.getFullYear() - 18);
                        setForm(prev => ({ ...prev, dateOfBirth: correctedDate.toISOString().split('T')[0] }));
                      } 
                      // If age is more than 45, auto-correct to exactly 45 years ago
                      else if (age > 45) {
                        const correctedDate = new Date();
                        correctedDate.setFullYear(correctedDate.getFullYear() - 45);
                        setForm(prev => ({ ...prev, dateOfBirth: correctedDate.toISOString().split('T')[0] }));
                      }
                    }
                  }}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  min={new Date(new Date().setFullYear(new Date().getFullYear() - 45)).toISOString().split('T')[0]}
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
                  className="px-8 py-3 bg-[var(--green-calm)] text-white rounded-xl hover:shadow-lg font-medium transition-all duration-200 transform hover:-translate-y-0.5"
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
        <div className="fixed inset-0 bg-[var(--green-calm)] bg-opacity-30 flex items-center justify-center z-50">
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

      {/* Assign Task Options Modal */}
      {showAssignOptions && (
        <div className="fixed inset-0 bg-[var(--green-calm)] bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 relative shadow-2xl">
            <button
              onClick={() => setShowAssignOptions(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-6 pr-8 text-[var(--green-calm)]">Assign Task to Worker</h2>
            
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">Choose how you want to assign a task to this worker:</p>
              
              <button
                onClick={assignExistingTask}
                className="w-full p-4 border-2 border-[var(--green-calm)] rounded-xl hover:bg-[var(--green-calm)] hover:text-white transition-all duration-200 flex items-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <div className="text-left">
                  <h3 className="font-semibold">Assign Existing Task</h3>
                  <p className="text-sm text-gray-500">Assign a task that already exists</p>
                </div>
              </button>
              
              <button
                onClick={createNewTask}
                className="w-full p-4 border-2 border-[var(--green-calm)] rounded-xl hover:bg-[var(--green-calm)] hover:text-white transition-all duration-200 flex items-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <div className="text-left">
                  <h3 className="font-semibold">Create New Task</h3>
                  <p className="text-sm text-gray-500">Create a new task and assign it</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Tasks Modal */}
      {showExistingTasks && (
        <div className="fixed inset-0 bg-[var(--green-calm)] bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={() => setShowExistingTasks(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-6 pr-8 text-[var(--green-calm)]">Select Existing Task</h2>
            
            <div className="space-y-4">
              {loadingTasks ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--green-calm)]"></div>
                  <p className="text-gray-500 mt-2">Loading tasks...</p>
                </div>
              ) : existingTasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No existing tasks found.</p>
                  <p className="text-xs text-gray-400 mt-2">Debug: {existingTasks.length} tasks loaded</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {existingTasks.map((task) => (
                    <div key={task.taskId} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-medium text-gray-600">Task ID:</span>
                            <span className="font-semibold text-[var(--green-calm)]">{task.taskId}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">{task.title}</h3>
                          <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              {task.priority}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                              {task.status}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              {task.category}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => assignWorkerToTask(task.taskId)}
                          className="ml-4 px-4 py-2 bg-[var(--green-calm)] text-white rounded-lg hover:bg-[var(--green-calm)]/90 transition-colors font-medium"
                        >
                          Add Worker
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Task Modal */}
      {showAssignForm && (
        <div className="fixed inset-0 bg-[var(--green-calm)] bg-opacity-30 flex items-center justify-center z-50">
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
                  className="px-8 py-3 bg-[var(--green-calm)] text-white rounded-xl hover:shadow-lg font-medium transition-all duration-200 transform hover:-translate-y-0.5"
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
        <div className="fixed inset-0 bg-[var(--green-calm)] bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 relative shadow-2xl">
            <button
              onClick={() => setShowUpdateForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-6 pr-8 text-[var(--green-calm)]">Update Worker</h2>
            
            <form onSubmit={submitUpdate} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Worker ID</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                  value={updateForm.workerId}
                  disabled
                  readOnly
                  placeholder="Worker ID"
                />
                <p className="text-xs text-gray-500 mt-1">Worker ID cannot be changed</p>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                  value={updateForm.userEmail}
                  disabled
                  readOnly
                  placeholder="Name (from user account)"
                />
                <p className="text-xs text-gray-500 mt-1">Name cannot be changed here. Update in user account.</p>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Job Role</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--green-calm)] focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--green-calm)] focus:border-transparent"
                  value={updateForm.dateOfBirth}
                  onChange={(e) => {
                    setUpdateForm(prev => ({ ...prev, dateOfBirth: e.target.value }));
                  }}
                  onBlur={(e) => {
                    const selectedDate = e.target.value;
                    if (selectedDate) {
                      const today = new Date();
                      const birthDate = new Date(selectedDate);
                      let age = today.getFullYear() - birthDate.getFullYear();
                      const monthDiff = today.getMonth() - birthDate.getMonth();
                      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                      }
                      
                      // If age is less than 18, auto-correct to exactly 18 years ago
                      if (age < 18) {
                        const correctedDate = new Date();
                        correctedDate.setFullYear(correctedDate.getFullYear() - 18);
                        setUpdateForm(prev => ({ ...prev, dateOfBirth: correctedDate.toISOString().split('T')[0] }));
                      } 
                      // If age is more than 45, auto-correct to exactly 45 years ago
                      else if (age > 45) {
                        const correctedDate = new Date();
                        correctedDate.setFullYear(correctedDate.getFullYear() - 45);
                        setUpdateForm(prev => ({ ...prev, dateOfBirth: correctedDate.toISOString().split('T')[0] }));
                      }
                    }
                  }}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  min={new Date(new Date().setFullYear(new Date().getFullYear() - 45)).toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">NIC</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--green-calm)] focus:border-transparent"
                  value={updateForm.nic}
                  onChange={(e) => {
                    const value = e.target.value;
                    const name = "nic";
                    if (name === "nic") {
                      if (/^[0-9]{0,9}[Vv]?$/.test(value) || /^[0-9]{0,12}$/.test(value)) {
                        setUpdateForm((prev) => ({ ...prev, [name]: value }));
                      }
                      return;
                    }
                  }}
                  required
                  placeholder="Enter NIC number (9 digits + V or 12 digits)"
                  maxLength={12}
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
                  className="px-8 py-3 bg-[var(--green-calm)] text-white rounded-xl hover:shadow-lg font-medium transition-all duration-200 transform hover:-translate-y-0.5"
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