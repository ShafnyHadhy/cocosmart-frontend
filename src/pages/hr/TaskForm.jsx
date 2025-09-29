// src/pages/hr/TaskForm.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createTask, getTaskById, updateTask } from "../../services/taskService";
import { listAvailableWorkers } from "../../services/workerService";

export default function TaskForm() {
  const { taskId: routeTaskId } = useParams(); // present when editing
  const navigate = useNavigate();

  const cssVars = {
    "--green-calm": "#2a5540",
    "--medium-gray": "#e7e9e9",
    "--light-gray": "#f7f9f9",
  };

  const [taskId, setTaskId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState("General");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [status, setStatus] = useState("To Do");
  const [assignedWorkers, setAssignedWorkers] = useState([]);
  const [availableWorkers, setAvailableWorkers] = useState([]);
  const [estimatedHours, setEstimatedHours] = useState("");

  const editing = Boolean(routeTaskId);

  useEffect(() => {
    (async () => {
      const w = await listAvailableWorkers();
      setAvailableWorkers(w.workers || []);
      if (editing) {
        const t = await getTaskById(routeTaskId);
        setTaskId(t.taskId);
        setTitle(t.title || "");
        setDescription(t.description || "");
        setPriority(t.priority || "Medium");
        setCategory(t.category || "General");
        setScheduledDate(
          t.scheduledDate ? new Date(t.scheduledDate).toISOString().slice(0, 10) : ""
        );
        setScheduledTime(t.scheduledTime || "");
        setStatus(t.status || "To Do");
        setEstimatedHours(t.estimatedHours || "");
        setAssignedWorkers(Array.isArray(t.assignedWorkers) ? t.assignedWorkers : []);
      }
    })();
  }, [editing, routeTaskId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Validate scheduled date is not in the past
    if (scheduledDate) {
      const today = new Date();
      const scheduled = new Date(scheduledDate);
      if (scheduled < today.setHours(0, 0, 0, 0)) {
        alert("Cannot schedule tasks for past dates");
        return;
      }
    }
    
    const payload = {
      taskId,
      title,
      description,
      priority,
      category,
      scheduledDate: scheduledDate || undefined,
      scheduledTime: scheduledTime || undefined,
      status,
      assignedWorkers,
      estimatedHours
    };

    if (editing) {
      await updateTask(routeTaskId, payload);
    } else {
      await createTask(payload);
    }

    navigate("/hr/tasks");
  };

  const addWorker = (workerId) => {
    if (!assignedWorkers.includes(workerId)) {
      setAssignedWorkers([...assignedWorkers, workerId]);
    }
  };

  const removeWorker = (workerId) => {
    setAssignedWorkers(assignedWorkers.filter(id => id !== workerId));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50" style={cssVars}>
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto relative shadow-2xl">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-6 pr-8 text-[var(--green-calm)]">
          {editing ? "Edit Task" : "Create New Task"}
        </h2>

        <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Task ID</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              required
              disabled={editing}
              placeholder="Enter unique task ID"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Category</label>
            <select
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="General">General</option>
              <option value="Harvesting">Harvesting</option>
              <option value="Planting">Planting</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Quality Control">Quality Control</option>
              <option value="Packaging">Packaging</option>
              <option value="Transportation">Transportation</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Task Title</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter task title"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Description</label>
          <textarea
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Enter detailed task description"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Priority</label>
            <select
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
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
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--green-calm)] focus:border-transparent"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Scheduled Time</label>
            <input
              type="time"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--green-calm)] focus:border-transparent"
              value={scheduledTime}
              min={scheduledDate && new Date(scheduledDate).toDateString() === new Date().toDateString() ? new Date().toTimeString().slice(0, 5) : undefined}
              onChange={(e) => {
                const selectedTime = e.target.value;
                const today = new Date();
                const selectedDate = scheduledDate ? new Date(scheduledDate) : today;
                
                // If no date is selected, use today
                if (!scheduledDate) {
                  const currentTime = today.toTimeString().slice(0, 5);
                  if (selectedTime < currentTime) {
                    alert("Cannot schedule task in the past. Please select a future time.");
                    return;
                  }
                } else {
                  // If date is today, check if time is in the past
                  if (selectedDate.toDateString() === today.toDateString()) {
                    const currentTime = today.toTimeString().slice(0, 5);
                    if (selectedTime < currentTime) {
                      alert("Cannot schedule task in the past. Please select a future time.");
                      return;
                    }
                  }
                }
                
                setScheduledTime(selectedTime);
              }}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Estimated Hours</label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--green-calm)] focus:border-transparent"
              value={estimatedHours}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (parseFloat(value) >= 0.5 && parseFloat(value) <= 10)) {
                  setEstimatedHours(value);
                }
              }}
              min="0.5"
              max="10"
              step="0.5"
              placeholder="Hours (max 10)"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Status</label>
            <select
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium mb-3">Available Workers</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto border rounded-lg p-3">
            {availableWorkers.map((w) => {
              const isAssigned = assignedWorkers.includes(w.workerId);
              return (
                <div key={w.workerId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <img
                      src={w.image || "https://www.gravatar.com/avatar/"}
                      alt={w.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium">{w.name}</p>
                      <p className="text-sm text-gray-500">{w.workerId} • {w.jobRole}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => isAssigned ? removeWorker(w.workerId) : addWorker(w.workerId)}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      isAssigned 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {isAssigned ? 'Remove' : 'Add'}
                  </button>
                </div>
              );
            })}
          </div>
          {assignedWorkers.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700">Assigned Workers:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {assignedWorkers.map(workerId => {
                  const worker = availableWorkers.find(w => w.workerId === workerId);
                  return (
                    <span key={workerId} className="bg-[var(--green-calm)] text-white px-2 py-1 rounded text-sm">
                      {worker?.name || workerId}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-[var(--green-calm)] text-white rounded-xl hover:shadow-lg font-medium transition-all duration-200 transform hover:-translate-y-0.5"
          >
            {editing ? "Update Task" : "Create Task"}
          </button>
        </div>
        </form>
      </div>
    </div>
  );
}
