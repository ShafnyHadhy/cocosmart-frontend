import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Plot/Plantation API functions
export const plotService = {
  // Get all plots
  getAllPlots: () => api.get('/plots'),
  
  // Get plot by ID
  getPlotById: (plotID) => api.get(`/plots/${plotID}`),
  
  // Add new plot
  addPlot: (plotData) => api.post('/plots', plotData),
  
  // Update plot
  updatePlot: (plotID, plotData) => api.put(`/plots/${plotID}`, plotData),
  
  // Delete plot
  deletePlot: (plotID) => api.delete(`/plots/${plotID}`)
};

export default api;