import axios from "axios";

const API_URL = "http://localhost:5000/api/workers";

export const listWorkers = async () => {
  const res = await axios.get(API_URL);
  return res.data; // { workers }
};

export const createWorker = async (payload) => {
  const res = await axios.post(API_URL, payload);
  return res.data;
};

export const updateWorker = async (workerId, payload) => {
  const res = await axios.put(`${API_URL}/${workerId}`, payload);
  return res.data;
};

export const deleteWorker = async (workerId) => {
  const res = await axios.delete(`${API_URL}/${workerId}`);
  return res.data;
};

export const listEligibleWorkerUsers = async () => {
  const res = await axios.get(`${API_URL}/eligible/users`);
  return res.data; // { users }
};

export const getWorkerWithTasks = async (workerId) => {
  const res = await axios.get(`${API_URL}/${workerId}/details`);
  return res.data; // { worker }
};

export const listAvailableWorkers = async () => {
  const res = await axios.get(`${API_URL}/available/list`);
  return res.data; // { workers }
};

export const getWorkforceAnalytics = async () => {
  const res = await axios.get(`${API_URL}/analytics`);
  return res.data;
};

export const updateWorkerProfile = async (workerId, profileData) => {
  const res = await axios.put(`${API_URL}/${workerId}/profile`, profileData);
  return res.data;
};


