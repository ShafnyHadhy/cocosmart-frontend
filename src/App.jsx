import { Route, Routes } from 'react-router-dom'
import './App.css'
import AdminPage from './pages/adminPage'
import HomePage from './pages/homePage'
import TestPage from './pages/test'
import LoginPage from './pages/loginPage'
import Plantations from './pages/Plantations/Plantations'
import AddPlantation from './pages/Plantations/AddPlantation'
import Plantation from './pages/Plantations/Plantation'
import ViewPlantations from './pages/Plantations/ViewPlantations'
import UpdatePlantation from './pages/Plantations/UpdatePlantation'
import PlantationGallery from './pages/Plantations/PlantationsGallery'
import { Toaster } from 'react-hot-toast'
import PlantationManage from './pages/plantationManage'

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
      


      </Routes>
    </div>
  )
}

export default App
