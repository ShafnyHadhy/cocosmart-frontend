import React, { useEffect, useState } from "react";
import { getTasksForWorker, updateTaskStatusByWorker } from "../../services/taskService";

export default function WorkerTasks() {
  const [workerId, setWorkerId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async (id) => {
    setLoading(true);
    const data = await getTasksForWorker(id);
    setTasks(data.tasks || []);
    setLoading(false);
  };

  const handleFetch = () => {
    if (!workerId.trim()) return;
    load(workerId.trim());
  };

  const updateStatus = async (taskId, status) => {
    await updateTaskStatusByWorker(taskId, status);
    load(workerId);
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <h2 className="text-2xl font-bold">My Tasks</h2>
        <input
          className="border rounded-lg px-3 py-2"
          placeholder="Enter your Worker ID"
          value={workerId}
          onChange={(e) => setWorkerId(e.target.value)}
        />
        <button
          onClick={handleFetch}
          className="rounded-lg bg-[var(--green-calm)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--green-calm)]/90"
        >
          View Tasks
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((t) => (
            <div key={t.taskId} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{t.title}</h3>
                <span className="text-xs rounded-full border px-2 py-0.5">{t.priority}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Task ID: {t.taskId}</p>
              <p className="text-sm text-gray-600">Scheduled: {t.scheduledDate ? new Date(t.scheduledDate).toLocaleDateString() : "—"}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm">Status:</span>
                <select
                  className="border rounded-lg px-2 py-1 text-sm"
                  value={t.status}
                  onChange={(e) => updateStatus(t.taskId, e.target.value)}
                >
                  <option>To Do</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>
          ))}
          {!tasks.length && (
            <div className="text-gray-500">No tasks found. Enter Worker ID to load.</div>
          )}
        </div>
      )}
    </div>
  );
}


