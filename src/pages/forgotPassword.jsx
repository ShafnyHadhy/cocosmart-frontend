import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaEnvelope, FaLock } from "react-icons/fa";
import "../styles/3dEffects.css"; // Import 3D CSS

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      return toast.error("Please enter your email");
    }

    setIsSubmitting(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/request-reset`,
        { email }
      );
      toast.success("If your email is registered, a reset link has been sent.");
      setEmail("");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 min-h-screen bg-gray-50 relative overflow-hidden perspective-1000">
      {/* Floating decorations */}
      <div className="absolute top-12 left-6 w-16 h-16 opacity-20 animate-float">
        <div className="w-full h-full bg-[url('/coconut-icon.png')] bg-contain bg-no-repeat"></div>
      </div>
      <div className="absolute bottom-12 right-8 w-20 h-20 opacity-15 animate-float-reverse">
        <div className="w-full h-full bg-[url('/palm-leaf.png')] bg-contain bg-no-repeat"></div>
      </div>

      {/* Main card */}
      <div
        className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-medium-gray 
                      w-full max-w-md p-8 transform-style-3d transition-transform duration-700 hover:translate-z-10"
      >
        <h2 className="text-2xl font-semibold text-secondary text-center mb-6 flex items-center justify-center gap-2">
          <FaLock className="text-green-calm" />
          Forgot Password
        </h2>

        <div className="space-y-4">
          {/* Email Input */}
          <div className="relative transform transition-transform duration-300 hover:translate-z-3">
            <label className="text-secondary mb-1 font-medium text-sm flex items-center gap-1">
              <FaEnvelope className="text-green-calm" />
              Registered Email
            </label>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-medium-gray rounded-lg focus:outline-none focus:ring-1 focus:ring-green-calm text-secondary shadow-[inset_0_2px_6px_rgba(0,0,0,0.1)] hover:translate-y-1 transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full py-2 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 text-sm mt-3
              ${
                isSubmitting
                  ? "bg-medium-gray text-secondary cursor-not-allowed"
                  : "bg-green-calm hover:bg-green-calm-90 text-white shadow-lg hover:shadow-xl hover:-translate-y-1"
              }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
