// src/pages/hr/TrashList.jsx
import React, { useEffect, useState } from "react";
import { getDeletedTasks, permanentDeleteTask, restoreTask } from "../../services/taskService";

export default function TrashList() {
  const [tasks, setTasks] = useState([]);

  const load = async () => {
    const data = await getDeletedTasks();
    setTasks(data.tasks || []);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Trash</h2>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3">Task ID</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {tasks.map((t) => (
              <tr key={t.taskId} className="hover:bg-gray-50">
                <td className="px-4 py-3">{t.taskId}</td>
                <td className="px-4 py-3">{t.title}</td>
                <td className="px-4 py-3">{t.priority}</td>
                <td className="px-4 py-3">{t.status}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={async () => { await restoreTask(t.taskId); load(); }}
                      className="rounded-md border px-3 py-1 hover:bg-gray-100"
                    >
                      Restore
                    </button>
                    <button
                      onClick={async () => { await permanentDeleteTask(t.taskId); load(); }}
                      className="rounded-md bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                    >
                      Delete Permanently
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!tasks.length && (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>
                  Trash is empty.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
