// Import necessary libraries and modules
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../styles/3dEffects.css";

// Import icons from react-icons for UI
import {
  FaEye,
  FaEyeSlash,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaLock,
} from "react-icons/fa";

// Reusable InputField component
const InputField = ({
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  icon: Icon,
  error,
  required = false,
  autoComplete = "off",
  maxLength,
  showToggle = false,
  onToggle,
  toggleType,
}) => {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
          <Icon className="h-4 w-4 text-gray-500" />
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        autoComplete={autoComplete}
        maxLength={maxLength}
        required={required}
        className={`w-full ${Icon ? "pl-8" : "pl-3"} ${
          showToggle ? "pr-10" : "pr-3"
        } py-2 rounded-xl border-2 border-medium-gray`}
      />
      {showToggle && (
        <button
          type="button"
          aria-label={
            toggleType === "password" ? "Show password" : "Hide password"
          }
          className="absolute inset-y-0 right-0 pr-2 flex items-center"
          onClick={onToggle}
        >
          {toggleType === "password" ? (
            <FaEyeSlash className="h-4 w-4 text-gray-500" />
          ) : (
            <FaEye className="h-4 w-4 text-gray-500" />
          )}
        </button>
      )}
      {error && <p className="text-accent-red text-xs mt-1">{error}</p>}
    </div>
  );
};

// Main SignupPage component
export default function SignupPage() {
  const navigate = useNavigate();

  // State variables to store form inputs
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validate first name input
  const validateFirstname = (val) => {
    const filteredVal = val.replace(/[^a-zA-Z]/g, "");
    handleInputChange("firstname", filteredVal);
    setErrors((prev) => ({
      ...prev,
      firstname: val && !/^[a-zA-Z]+$/.test(val) ? "Only letters allowed" : "",
    }));
  };

  // Validate last name input
  const validateLastname = (val) => {
    const filteredVal = val.replace(/[^a-zA-Z]/g, "");
    handleInputChange("lastname", filteredVal);
    setErrors((prev) => ({
      ...prev,
      lastname: val && !/^[a-zA-Z]+$/.test(val) ? "Only letters allowed" : "",
    }));
  };

  // Validate email on input change
  const validateEmail = (val) => {
    const lowerVal = val.toLowerCase();
    if (lowerVal.length === 1 && /[0-9]/.test(lowerVal)) {
      setErrors((prev) => ({
        ...prev,
        email: "Email must start with a letter",
      }));
      return;
    }
    handleInputChange("email", lowerVal);
    setErrors((prev) => ({ ...prev, email: "" }));
  };

  // Validate email when input loses focus
  const validateEmailOnBlur = () => {
    if (formData.email) {
      if (formData.email.length > 0 && !/^[a-z]/.test(formData.email)) {
        setErrors((prev) => ({
          ...prev,
          email: "Email must start with a lowercase letter",
        }));
        return;
      }
      if (
        !/^[a-z][a-z0-9._%+-]*@[a-z0-9.-]+\.[a-z]{2,}$/.test(formData.email)
      ) {
        setErrors((prev) => ({
          ...prev,
          email: "Please enter a valid email address (e.g., user@example.com)",
        }));
      } else {
        setErrors((prev) => ({ ...prev, email: "" }));
      }
    } else {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
    }
  };

  // Validate password length
  const validatePassword = (val) => {
    handleInputChange("password", val);
    setErrors((prev) => ({
      ...prev,
      password:
        val && val.length < 8 ? "Password must be at least 8 characters" : "",
    }));
  };

  // Validate confirm password
  const validateConfirmPassword = (val) => {
    handleInputChange("confirmPassword", val);
  };

  // Validate phone number input
  const validatePhone = (val) => {
    if (val.length === 1 && val === "0") {
      handleInputChange("phone", "");
      return;
    }
    const onlyDigits = val.replace(/[^0-9]/g, "");
    handleInputChange("phone", onlyDigits.slice(0, 9));

    if (onlyDigits && onlyDigits.length !== 9) {
      setErrors((prev) => ({ ...prev, phone: "Must be exactly 9 digits" }));
    } else {
      setErrors((prev) => ({ ...prev, phone: "" }));
    }
  };

  // Check if form is valid to enable the submit button
  const isFormValid =
    formData.firstname &&
    formData.lastname &&
    formData.email &&
    formData.password &&
    formData.confirmPassword &&
    formData.phone.length === 9 &&
    !errors.firstname &&
    !errors.lastname &&
    !errors.email &&
    !errors.password &&
    !errors.phone &&
    agreed;

  // Function to handle signup
  async function signup() {
    // Re-validate email before submission
    if (formData.email) {
      if (!/^[a-z]/.test(formData.email)) {
        setErrors((prev) => ({
          ...prev,
          email: "Email must start with a lowercase letter",
        }));
        return;
      }
      if (
        !/^[a-z][a-z0-9._%+-]*@[a-z0-9.-]+\.[a-z]{2,}$/.test(formData.email)
      ) {
        setErrors((prev) => ({
          ...prev,
          email: "Please enter a valid email address (e.g., user@example.com)",
        }));
        return;
      }
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
      return;
    }

    if (!isFormValid) return;

    try {
      // Send POST request to create user
      await axios.post(import.meta.env.VITE_API_URL + "/api/users", {
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        password: formData.password,
        phone: "0" + formData.phone,
      });
      toast.success("User created successfully!");
      navigate("/login");
    } catch (e) {
      console.error("Signup failed:", e);
      toast.error(e.response?.data?.message || "Signup failed");
    }
  }

  // Clear form fields on component mount
  useEffect(() => {
    setFormData({
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
    });
    setAgreed(false);
  }, []);

  return (
    <div className="min-h-screen w-full bg-primary flex items-center justify-center p-4">
      {/* Main Container */}
      <div className="flex flex-col md:flex-row w-full max-w-5xl rounded-3xl overflow-hidden shadow-lg border border-medium-gray">
        {/* Left Section - Image */}
        <div className="w-full md:w-3/5">
          <img
            src="/ff.jpg"
            alt="CocoSmart Visual"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Section - Signup Form */}
        <div className="w-full md:w-3/5 flex justify-center items-center p-5 md:p-10 bg-white">
          <div className="w-full max-w-sm">
            {/* Form header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-green-calm mb-1">
                Create Your Account
              </h2>
              <p className="text-gray-600 text-xs">
                Join CocoSmart and start shopping
              </p>
            </div>

            <form
              className="space-y-4"
              autoComplete="off"
              onSubmit={(e) => {
                e.preventDefault();
                signup();
              }}
            >
              {/* First & Last Name Inputs */}
              <div className="flex gap-3">
                {/* First Name */}
                <div className="w-1/2">
                  <InputField
                    type="text"
                    placeholder="First Name"
                    value={formData.firstname}
                    onChange={(e) => validateFirstname(e.target.value)}
                    icon={FaUser}
                    error={errors.firstname}
                    required
                  />
                </div>

                {/* Last Name */}
                <div className="w-1/2">
                  <InputField
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastname}
                    onChange={(e) => validateLastname(e.target.value)}
                    icon={FaUser}
                    error={errors.lastname}
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <InputField
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => validateEmail(e.target.value)}
                onBlur={validateEmailOnBlur}
                icon={FaEnvelope}
                error={errors.email}
                required
              />

              {/* Phone Input */}
              <div className="flex relative">
                <span className="inline-flex items-center px-3 py-2 rounded-l-xl border-2 border-r-0 border-medium-gray bg-medium-gray text-gray-600 text-xs">
                  +94
                </span>
                <div className="relative flex-1">
                  <InputField
                    type="text"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => validatePhone(e.target.value)}
                    icon={FaPhone}
                    error={errors.phone}
                    maxLength={9}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <InputField
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => validatePassword(e.target.value)}
                icon={FaLock}
                error={errors.password}
                showToggle={true}
                toggleType={showPassword ? "text" : "password"}
                onToggle={() => setShowPassword(!showPassword)}
                autoComplete="new-password"
                required
              />

              {/* Confirm Password Input */}
              <InputField
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(e) => validateConfirmPassword(e.target.value)}
                icon={FaLock}
                error={errors.confirmPassword}
                showToggle={true}
                toggleType={showConfirmPassword ? "text" : "password"}
                onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                autoComplete="new-password"
                required
              />

              {/* Terms & Conditions */}
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mr-2 w-3 h-3 text-green-calm border-medium-gray rounded"
                  required
                  aria-checked={agreed}
                />
                <label className="text-xs text-gray-700">
                  I agree to the{" "}
                  <a href="#" className="text-green-calm underline">
                    Terms & Conditions
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid}
                className={`w-full py-3 font-semibold rounded-xl ${
                  isFormValid
                    ? "bg-green-calm text-white hover-bg-green-calm-90"
                    : "bg-medium-gray text-gray-500 cursor-not-allowed"
                }`}
              >
                Sign Up
              </button>

              {/* Login Link */}
              <p className="text-center text-xs text-gray-600 mt-4">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-green-calm font-medium underline"
                >
                  Log In
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
