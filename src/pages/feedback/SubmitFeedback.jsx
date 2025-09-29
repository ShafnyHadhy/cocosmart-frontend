import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaStar, FaLeaf } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
//import "../../styles/3dEffects.css";

export default function SubmitFeedback() {
  const [username, setUsername] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      toast.error("Please login to submit feedback");
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/users/email/${userEmail}`
        );
        setUserData(response.data);
        setUsername(`${response.data.firstname} ${response.data.lastname}`);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load user information");
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast.error("Please provide your feedback");
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/feedback`, {
        username: isAnonymous ? "Anonymous" : username,
        rating,
        comment,
        userId: userData?._id,
      });
      toast.success("Feedback submitted successfully!");
      setComment("");
      setRating(5);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center p-4 min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-green-700">Loading your information...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center h-[85vh] relative overflow-hidden pt-4"
      style={{
        backgroundImage: `url('/o2.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Blurred overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[3px]"></div>

      {/* Main feedback card with 3D hover effect */}
      <div className="relative z-10 bg-sec-2 rounded-xl shadow-2xl border border-medium-gray overflow-hidden w-full max-w-lg transform-style-3d transition-transform duration-700 hover:translate-z-10">
        {/* Header */}
        <div className="bg-green-calm p-5">
          <h1 className="text-2xl font-bold text-white text-center flex items-center justify-center gap-2">
            <FaLeaf className="text-earth-white" />
            Share Your Feedback
          </h1>
          <p className="text-white text-center mt-1 text-sm">
            We value your experience with us
          </p>
        </div>

        {/* Form */}
        <div className="p-5 space-y-4 bg-white/95 backdrop-blur-sm">
          {/* User info (read-only) */}
          <div className="relative transform transition-transform duration-300 hover:translate-z-3">
            <label className="block text-green-800 mb-1 font-medium text-sm">
              👤 Your Account
            </label>
            <div className="w-full px-4 py-3 bg-accent-green-20 border border-medium-gray rounded-lg text-green-calm">
              {username}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 accent-green-calm"
            />
            <label
              htmlFor="anonymous"
              className="text-black text-xs font-medium"
            >
              Submit feedback as Anonymous
            </label>
          </div>

          {/* Rating */}
          <div className="relative transform transition-transform duration-300 hover:translate-z-3">
            <label className="block text-green-800 mb-2 font-medium text-sm">
              🥥 How was your experience?
            </label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <div
                  key={star}
                  className="relative group cursor-pointer"
                  onClick={() => setRating(star)}
                >
                  <div className="absolute -inset-1 bg-amber-300/30 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 transform group-hover:scale-110 ${
                        star <= rating
                          ? "bg-amber-600 border-2 border-amber-800"
                          : "bg-amber-200 border-2 border-amber-300"
                      }`}
                    >
                      <FaStar size={12} className="text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-2 text-sm text-green-calm">
              {rating}/5 {rating === 1 ? "coconut" : "coconuts"}
            </div>
          </div>

          {/* Comment box */}
          <div className="relative transform transition-transform duration-300 hover:translate-z-3">
            <label className="block text-green-800 mb-1 font-medium text-sm">
              💬 Your Feedback *
            </label>
            <textarea
              placeholder="Please share your thoughts about our services..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-medium-gray rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-green-calm text-secondary 
                         resize-none shadow-[inset_0_2px_6px_rgba(0,0,0,0.1)] hover:translate-y-1 transition-all"
              rows={3}
              required
            />
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !comment.trim()}
            className={`w-full py-3 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2
              ${
                isSubmitting || !comment.trim()
                  ? "bg-medium-gray text-secondary cursor-not-allowed"
                  : "bg-green-calm hover:bg-green-calm-90 text-white shadow-lg hover:shadow-xl hover:-translate-y-1"
              }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              <>
                <FaLeaf className="text-sm" />
                Submit Feedback
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="p-3 text-center text-green-calm text-xs border-t border-medium-gray bg-accent-green-20">
          CocoSmart Feedback System • Protected User Session
        </div>
      </div>
    </div>
  );
}
