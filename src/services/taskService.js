// src/services/taskService.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/tasks";

export const getTasks = async () => {
  const res = await axios.get(API_URL);
  return res.data; // { tasks }
};

export const listTasks = async () => {
  const res = await axios.get(API_URL);
  return res.data; // { tasks }
};

export const getTaskAnalytics = async (startDate, endDate) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const res = await axios.get(`${API_URL}/analytics`, { params });
  return res.data;
};

export const getWorkerAnalytics = async (workerId) => {
  const res = await axios.get(`${API_URL}/worker/${workerId}/analytics`);
  return res.data;
};

export const getDeletedTasks = async () => {
  const res = await axios.get(`${API_URL}/trash`);
  return res.data; // { tasks }
};

export const getTaskById = async (taskId) => {
  const res = await axios.get(`${API_URL}/${taskId}`);
  return res.data;
};

export const createTask = async (taskData) => {
  const res = await axios.post(API_URL, taskData);
  return res.data;
};

export const updateTask = async (taskId, taskData) => {
  const res = await axios.put(`${API_URL}/${taskId}`, taskData);
  return res.data;
};

export const softDeleteTask = async (taskId) => {
  const res = await axios.delete(`${API_URL}/${taskId}`);
  return res.data;
};

export const restoreTask = async (taskId) => {
  const res = await axios.post(`${API_URL}/${taskId}/restore`);
  return res.data;
};

export const permanentDeleteTask = async (taskId) => {
  const res = await axios.delete(`${API_URL}/${taskId}/permanent`);
  return res.data;
};

// Worker-facing helpers
export const getTasksForWorker = async (workerId) => {
  const res = await axios.get(`${API_URL}/worker/${workerId}`);
  return res.data; // { tasks }
};

export const updateTaskStatusByWorker = async (taskId, status, workerId) => {
  const res = await axios.patch(`${API_URL}/${taskId}/status`, { status, workerId });
  return res.data;
};