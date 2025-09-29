import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const WorkerContext = createContext();

export const useWorker = () => {
  const context = useContext(WorkerContext);
  if (!context) {
    throw new Error('useWorker must be used within a WorkerProvider');
  }
  return context;
};

export const WorkerProvider = ({ children }) => {
  const [workerData, setWorkerData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(null);

  // Check for existing authentication on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');
    
    console.log("WorkerContext: Checking auth on mount", { savedToken: !!savedToken, userEmail });
    
    if (savedToken && userEmail) {
      setToken(savedToken);
      
      // Get worker data directly using the email
      const loadWorkerData = async () => {
        try {
          const workerResponse = await axios.get(`http://localhost:5000/api/workers/email/${userEmail}`, {
            headers: {
              'Authorization': `Bearer ${savedToken}`
            }
          });
          
          if (workerResponse.data.worker) {
            setWorkerData(workerResponse.data.worker);
            console.log("Worker data loaded on mount:", workerResponse.data.worker.workerId);
          } else {
            console.log("Worker not found for email:", userEmail);
            logout();
          }
        } catch (error) {
          console.error("Error loading worker data on mount:", error);
          logout();
        }
      };
      
      loadWorkerData();
    }
  }, []);

  // Function to manually trigger authentication from main login
  const authenticateFromMainLogin = async () => {
    const savedToken = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');
    
    console.log("WorkerContext: Manual authentication from main login", { savedToken: !!savedToken, userEmail });
    
    if (savedToken && userEmail && !token) {
      setToken(savedToken);
      
      // Get worker data directly using the email
      try {
        const workerResponse = await axios.get(`http://localhost:5000/api/workers/email/${userEmail}`, {
          headers: {
            'Authorization': `Bearer ${savedToken}`
          }
        });
        
        if (workerResponse.data.worker) {
          setWorkerData(workerResponse.data.worker);
          console.log("Worker data loaded automatically from main login:", workerResponse.data.worker.workerId);
        } else {
          console.log("Worker not found for email:", userEmail);
          logout();
        }
      } catch (error) {
        console.error("Error loading worker data from main login:", error);
        logout();
      }
    }
  };

  const loadWorkerDataByEmail = async (email) => {
    if (!email) return;
    
    console.log("WorkerContext: Loading worker data for email:", email);
    setIsLoading(true);
    try {
      // Find worker by email
      const response = await axios.get(`http://localhost:5000/api/workers/email/${email}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("WorkerContext: Worker data response:", response.data);
      
      if (response.data.worker) {
        setWorkerData(response.data.worker);
        console.log("WorkerContext: Worker data set successfully");
      } else {
        // If worker not found, clear authentication
        console.log("Worker not found for email:", email);
        logout();
      }
    } catch (error) {
      console.error("Error loading worker data:", error);
      // If error, clear authentication
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/users/login', {
        email,
        password
      });

      const { token: newToken, user } = response.data;
      
      // Check if user is a worker
      if (user.role !== 'worker') {
        return { success: false, error: 'Only workers can access this dashboard' };
      }
      
      // Save token and email
      localStorage.setItem('token', newToken);
      localStorage.setItem('userEmail', user.email);
      setToken(newToken);
      
      // Get worker ID from email and load worker data
      const workerResponse = await axios.get(`http://localhost:5000/api/workers/email/${user.email}`, {
        headers: {
          'Authorization': `Bearer ${newToken}`
        }
      });
      
      if (workerResponse.data.worker) {
        setWorkerData(workerResponse.data.worker);
        console.log("Worker data loaded automatically:", workerResponse.data.worker.workerId);
      } else {
        return { success: false, error: 'Worker profile not found. Please contact HR manager.' };
      }
      
      return { success: true, user };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setWorkerData(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
  };

  const value = {
    workerData,
    isLoading,
    login,
    logout,
    authenticateFromMainLogin,
    isLoggedIn: !!token && !!workerData,
    workerId: workerData?.workerId || null
  };

  return (
    <WorkerContext.Provider value={value}>
      {children}
    </WorkerContext.Provider>
  );
};
