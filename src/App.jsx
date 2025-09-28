import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import AdminPage from './pages/adminPage'
import HomePage from './pages/homePage'
import TestPage from './pages/test'
import LoginPage from './pages/loginPage'
import { Toaster } from 'react-hot-toast'
import HRLayout from './pages/hr/HRLayout'
import HRDashboard from "./pages/hr/HRDashboard";
import TaskList from "./pages/hr/TaskList";
import TaskForm from "./pages/hr/TaskForm";
import TrashList from './pages/hr/TrashList'
import WorkerList from './pages/hr/WorkerList'
import WorkerTasks from './pages/worker/WorkerTasks'
import WorkerLayout from './pages/worker/WorkerLayout'
import WorkerDashboard from './pages/worker/WorkerDashboard'
import WorkerProfile from './pages/worker/WorkerProfile'
import WorkerNotifications from './pages/worker/WorkerNotifications'
import { WorkerProvider } from './contexts/WorkerContext'
import ReportsPage from './pages/hr/ReportsPage'
import AnalyticsDashboard from './pages/hr/AnalyticsDashboard'

function App() {
 
  return (
    <BrowserRouter>
      <div className="w-full h-[100vh]">

        <Toaster position="top-right"/>
        <Routes path="/">
            <Route path="/*" element={<HomePage/>}/>
            <Route path="/register" element={<h1>Register Page</h1>}/>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/admin/*" element={<AdminPage/>}/>
            <Route path="/test" element={<TestPage/>}/>
            <Route path="/hr" element={<HRLayout />}>
            <Route index element={<HRDashboard />} />
              <Route path="tasks" element={<TaskList />} />
              <Route path="completed" element={<TaskList statusFilter="Completed" />} />
              <Route path="in-progress" element={<TaskList statusFilter="In Progress" />} />
              <Route path="todo" element={<TaskList statusFilter="To Do" />} />
              <Route path="tasks/new" element={<TaskForm />} />
              <Route path="tasks/:taskId/edit" element={<TaskForm />} />
              <Route path="trash" element={<TrashList />} />
              <Route path="workers" element={<WorkerList />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="analytics" element={<AnalyticsDashboard />} />
            </Route>

            <Route path="/worker" element={<WorkerProvider><WorkerLayout /></WorkerProvider>}>
              <Route index element={<WorkerDashboard />} />
              <Route path="tasks" element={<WorkerTasks />} />
              <Route path="profile" element={<WorkerProfile />} />
              <Route path="notifications" element={<WorkerNotifications />} />
            </Route>
            
        </Routes>

      </div>
    </BrowserRouter>
  )
}

export default App
