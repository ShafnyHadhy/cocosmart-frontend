// Import libraries
import axios from "axios"; // HTTP client for API calls
import { useState, useEffect } from "react"; // React hooks for state and lifecycle
import toast from "react-hot-toast"; // Popup notifications
import { useNavigate } from "react-router-dom"; // Navigation between pages

import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaUserPlus,
} from "react-icons/fa"; // Icons for UI

// Main component
export default function LoginPage() {
  // State variables
  const [email, setEmail] = useState(""); // store user's email input
  const [password, setPassword] = useState(""); // store user's password input
  const [showPassword, setShowPassword] = useState(false); // toggle password visibility
  const [isLoading, setIsLoading] = useState(false); // track API call status
  const navigate = useNavigate(); // function to redirect user after login

  // Reset input fields when component loads
  useEffect(() => {
    setEmail("");
    setPassword("");
  }, []);

  // Function to handle login
  async function login() {
    // Validation: check if fields are empty
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true); // disable login button while API call is ongoing
    try {
      // Send POST request to backend login API
      const response = await axios.post(
        import.meta.env.VITE_API_URL + "/api/users/login",
        { email, password }
      );

      const user = response.data.user; // get user info from response

      // Save token and email to localStorage for session management
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userEmail", user.email);

      toast.success("Login successful!"); // show success message

      // Redirect user based on role
      switch (user.role) {
        case "admin":
          navigate("/admin");
          break;
        case "worker":
          navigate("/worker");
          break;
        case "Pro.Staff":
          navigate("/prostaff");
          break;
        case "HRM":
          navigate("/hrm");
          break;
        default:
          navigate("/"); // default route
      }
    } catch (error) {
      console.error("Login failed:", error); // log error for debugging
      toast.error("Login failed, check your credentials"); // show error message
    } finally {
      setIsLoading(false); // re-enable login button
    }
  }

  // JSX: Login Page UI
  return (
    <div className="min-h-screen w-full bg-primary flex items-center justify-center p-4">
      {/* Main Container */}
      <div className="flex flex-col md:flex-row w-full max-w-4xl rounded-3xl overflow-hidden shadow-lg border border-medium-gray">
        {/* Left Section - Image */}
        <div className="w-full md:w-3/5">
          <img
            src="/111.png" // your image path
            alt="CocoSmart Visual"
            className="w-full h-full object-cover" // cover whole div
          />
        </div>

        {/* Right Section - Login Form */}
        <div className="w-full md:w-3/5 flex justify-center items-center p-11 bg-white">
          <div className="w-full max-w-xs">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-green-calm mb-1">
                Welcome Back
              </h2>
              <p className="text-secondary text-sm">
                Sign in to your CocoSmart account
              </p>
            </div>

            {/* Login Form */}
            <form
              className="space-y-6"
              autoComplete="off"
              onSubmit={(e) => {
                e.preventDefault(); // prevent page reload
                login(); // call login function
              }}
            >
              {/* Email Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <FaEnvelope className="h-5 w-5 text-gray-500" />{" "}
                  {/* email icon */}
                </div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} // update email state
                  autoComplete="off"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-medium-gray bg-white focus:border-green-calm outline-none"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <FaLock className="h-5 w-5 text-gray-500" /> {/* lock icon */}
                </div>
                <input
                  type={showPassword ? "text" : "password"} // toggle visibility
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full pl-10 pr-12 py-3 rounded-lg border border-medium-gray bg-white focus:border-green-calm outline-none"
                  required
                />
                {/* Show/Hide Password Button */}
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-500" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")} // navigate to forgot password page
                  className="text-sm text-green-calm font-medium"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading} // disable button during API call
                className="w-full py-3 bg-green-calm text-white font-semibold rounded-lg"
              >
                {isLoading ? "Signing in..." : "Sign In"}{" "}
                {/* show loading text */}
              </button>

              {/* Divider */}
              <div className="flex items-center justify-center my-6">
                <div className="flex-1 border-t border-medium-gray"></div>
                <span className="px-3 text-secondary text-sm bg-white">or</span>
                <div className="flex-1 border-t border-medium-gray"></div>
              </div>

              {/* Sign Up Button */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate("/register")} // navigate to register page
                  className="inline-flex items-center text-sm text-green-calm bg-medium-gray font-medium px-4 py-2 rounded-lg border border-medium-gray"
                >
                  <FaUserPlus className="mr-2" />
                  Create a new account
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}