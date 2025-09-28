import React, { createContext, useContext, useState, useEffect } from 'react';

const WorkerContext = createContext();

export const useWorker = () => {
  const context = useContext(WorkerContext);
  if (!context) {
    throw new Error('useWorker must be used within a WorkerProvider');
  }
  return context;
};

export const WorkerProvider = ({ children }) => {
  const [workerId, setWorkerId] = useState('');
  const [workerData, setWorkerData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load worker ID from localStorage on mount and load data
  useEffect(() => {
    const savedWorkerId = localStorage.getItem('cocosmart_worker_id');
    if (savedWorkerId) {
      setWorkerId(savedWorkerId);
      // Automatically load worker data if ID exists
      loadWorkerDataOnMount(savedWorkerId);
    }
  }, []);

  const loadWorkerDataOnMount = async (id) => {
    if (!id.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/workers/${id}/details`);
      const data = await response.json();
      
      if (response.ok) {
        setWorkerData(data.worker);
      } else {
        // If worker not found, clear the stored ID
        setWorkerId('');
        localStorage.removeItem('cocosmart_worker_id');
        setWorkerData(null);
      }
    } catch (error) {
      console.error("Error loading worker data:", error);
      // If error, clear the stored ID
      setWorkerId('');
      localStorage.removeItem('cocosmart_worker_id');
      setWorkerData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Save worker ID to localStorage when it changes
  useEffect(() => {
    if (workerId) {
      localStorage.setItem('cocosmart_worker_id', workerId);
    } else {
      localStorage.removeItem('cocosmart_worker_id');
    }
  }, [workerId]);

  const loadWorkerData = async (id) => {
    if (!id.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/workers/${id}/details`);
      const data = await response.json();
      
      if (response.ok) {
        setWorkerData(data.worker);
        setWorkerId(id);
      } else {
        alert("Worker not found. Please check your Worker ID.");
        setWorkerData(null);
      }
    } catch (error) {
      console.error("Error loading worker data:", error);
      alert("Error loading worker data. Please try again.");
      setWorkerData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setWorkerId('');
    setWorkerData(null);
    localStorage.removeItem('cocosmart_worker_id');
  };

  const value = {
    workerId,
    workerData,
    isLoading,
    loadWorkerData,
    logout,
    isLoggedIn: !!workerId && !!workerData
  };

  return (
    <WorkerContext.Provider value={value}>
      {children}
    </WorkerContext.Provider>
  );
};
