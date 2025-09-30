import React, { useState, useEffect } from "react";
import { useWorker } from "../../contexts/WorkerContext";
import { updateWorkerProfile } from "../../services/workerService";
import { getTasksForWorker } from "../../services/taskService";

export default function WorkerProfile() {
  const { workerId, workerData, isLoggedIn, isLoading: contextLoading } = useWorker();
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    jobRole: ""
  });
  const [loading, setLoading] = useState(false);

  const cssVars = {
    "--green-calm": "#2a5540",
    "--medium-gray": "#e7e9e9",
    "--light-gray": "#f7f9f9",
  };

  // Load profile and tasks when worker data is available
  useEffect(() => {
    if (isLoggedIn && workerData) {
      setProfile(workerData);
      setEditForm({
        jobRole: workerData.jobRole || ""
      });
      
      // Load tasks for this worker
      loadWorkerTasks();
    }
  }, [isLoggedIn, workerData, workerId]);

  const loadWorkerTasks = async () => {
    if (!workerId) return;
    
    try {
      const response = await getTasksForWorker(workerId);
      setTasks(response.tasks || []);
    } catch (error) {
      console.error("Error loading worker tasks:", error);
      setTasks([]);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await updateWorkerProfile(workerId, {
        jobRole: editForm.jobRole
      });
      
      setProfile(prev => ({
        ...prev,
        jobRole: editForm.jobRole
      }));
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (contextLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading profile...</span>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Please login first</h3>
        <p className="text-gray-600">Go to the Dashboard to enter your Worker ID and access your profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={cssVars}>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 text-[var(--green-calm)]">
          My Profile
        </h2>
        <p className="text-gray-600">View and update your personal information</p>
      </div>

      {isLoggedIn && profile && (
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-2xl">
                {profile.name?.charAt(0) || profile.workerId?.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">{profile.name || profile.userEmail}</h3>
                <p className="text-lg text-gray-600">{profile.jobRole || 'No role assigned'}</p>
                <p className="text-sm text-gray-500">{profile.userEmail}</p>
                <div className="mt-4 flex gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    profile.isAvailable 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {profile.isAvailable ? 'Available' : 'Busy'}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    Worker ID: {profile.workerId}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-[var(--green-calm)] text-white px-4 py-2 rounded-lg hover:bg-[var(--green-calm)]/90 transition-colors"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {/* Profile Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">Personal Information</h4>
              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Role</label>
                    <select
                      value={editForm.jobRole}
                      onChange={(e) => setEditForm(prev => ({ ...prev, jobRole: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[var(--green-calm)] text-white py-3 rounded-xl hover:bg-[var(--green-calm)]/90 transition-colors font-medium"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Worker ID:</span>
                    <span className="font-medium">{profile.workerId}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{profile.userEmail}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Job Role:</span>
                    <span className="font-medium">{profile.jobRole || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Date of Birth:</span>
                    <span className="font-medium">
                      {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not provided'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">NIC Number:</span>
                    <span className="font-medium">{profile.nic || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Availability:</span>
                    <span className={`font-medium ${profile.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                      {profile.isAvailable ? 'Available' : 'Busy'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Work Statistics */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">Work Statistics</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Join Date:</span>
                  <span className="font-medium">
                    {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Tasks:</span>
                  <span className="font-medium text-blue-600">{tasks.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Completed Tasks:</span>
                  <span className="font-medium text-green-600">
                    {tasks.filter(task => task.status === 'Completed').length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">In Progress:</span>
                  <span className="font-medium text-yellow-600">
                    {tasks.filter(task => task.status === 'In Progress').length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">To Do:</span>
                  <span className="font-medium text-gray-600">
                    {tasks.filter(task => task.status === 'To Do').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}