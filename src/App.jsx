import { Route, Routes } from 'react-router-dom'
import './App.css'
import AdminPage from './pages/adminPage'
import HomePage from './pages/homePage'
import LoginPage from './pages/loginPage'
import { Toaster } from 'react-hot-toast'
import PlantationManage from './pages/plantationManage'
import ChatBotPage from './pages/chatbotDash'

function App() {
  return (
    <div className="w-full h-[100vh]">
      <Toaster position="top-right" />
      <Routes>
        <Route path="/*" element={<HomePage />} />
        <Route path="/register" element={<h1>Register Page</h1>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/*" element={<AdminPage />} />
        <Route path="/plant/*" element={<PlantationManage />} />
        {/* <Route path="/chatbot" element={<ChatBotPage />} /> */}
      </Routes>

       <ChatBotPage />
    </div>
  )
}

export default App
