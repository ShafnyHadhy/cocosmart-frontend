import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import AdminPage from './pages/adminPage'
import HomePage from './pages/homePage'
import LoginPage from './pages/loginPage'
import { Toaster } from 'react-hot-toast'
import TestPage from './pages/test'
//import ProductPage from './pages/productPage'

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
            {/*<Route path="/product" element={<ProductPage/>}/>*/}
        </Routes>

      </div>
    </BrowserRouter>
  )
}

export default App
