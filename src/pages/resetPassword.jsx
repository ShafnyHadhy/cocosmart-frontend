import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleReset = async () => {
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/reset-password/${token}`,
        {
          password,
        }
      );
      toast.success("Password reset successful!");
      navigate("/login");
    } catch (err) {
      toast.error("Reset failed. Link may be expired.");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[url('/bgg.jpg')] bg-cover">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-[350px]">
        <h2 className="text-2xl font-semibold text-secondary text-center mb-6">
          Reset Password
        </h2>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full h-12 px-4 mb-4 rounded-xl border border-gray-300"
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full h-12 px-4 mb-6 rounded-xl border border-gray-300"
        />
        <button
          onClick={handleReset}
          className="w-full h-12 bg-accent text-white font-semibold rounded-xl shadow-md hover:bg-[#b6ad90ff] transition"
        >
          Reset Password
        </button>
      </div>
    </div>
  );
}
