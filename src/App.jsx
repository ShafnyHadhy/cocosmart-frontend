import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";

import AdminPage from "./pages/adminPage";
import HomePage from "./pages/homePage";
import TestPage from "./pages/test";
import LoginPage from "./pages/loginPage";
import SignupPage from "./pages/signUpPage";
import ForgotPassword from "./pages/forgotPassword";
import ResetPassword from "./pages/resetPassword";
import UserProfile from "./pages/Profile/UserProfile";
import { Toaster } from "react-hot-toast";
import PlantationManage from "./pages/plantationManage";
import ChatBotPage from './pages/chatbotDash'

function App() {
  return (
    <BrowserRouter>
      <div className="w-full h-[100vh]">
        <Toaster position="top-right" />
        <Routes path="/">
          <Route path="/*" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />
          <Route path="/admin/*" element={<AdminPage />} /> 
          <Route path="/test" element={<TestPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/plant/*" element={<PlantationManage />} />
        </Routes>
      </div>
      
          <ChatBotPage />
      
    </BrowserRouter>
  );
}

export default App;
