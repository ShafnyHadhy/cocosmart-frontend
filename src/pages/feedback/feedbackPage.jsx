import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaStar, FaRegEdit, FaSearch, FaFilePdf } from "react-icons/fa";
import { TfiTrash } from "react-icons/tfi";
import jsPDF from "jspdf";
import "jspdf-autotable";

const FeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [showSearchFields, setShowSearchFields] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchRating, setSearchRating] = useState("");

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/feedback`
      );
      setFeedbacks(res.data);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      toast.error("Failed to fetch feedbacks");
    }
  };

  const startReply = (id, currentReply = "") => {
    setEditingId(id);
    setReplyText(currentReply);
    setDeletingId(null);
  };

  const cancelReply = () => {
    setEditingId(null);
    setReplyText("");
  };

  const submitReply = async (id) => {
    if (!replyText.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/feedback/${id}/reply`,
        { adminReply: replyText }
      );
      toast.success("Reply sent successfully");
      cancelReply();
      fetchFeedbacks();
    } catch (error) {
      console.error("Error submitting reply:", error);
      toast.error("Failed to send reply");
    }
  };

  const confirmDelete = (id) => {
    setDeletingId(id);
    setEditingId(null);
  };

  const cancelDelete = () => setDeletingId(null);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/feedback/${id}`);
      toast.success("Feedback deleted successfully");
      setDeletingId(null);
      fetchFeedbacks();
    } catch (error) {
      console.error("Error deleting feedback:", error);
      toast.error("Failed to delete feedback");
    }
  };

  const renderStars = (rating) => (
    <div className="flex gap-1 justify-start">
      {[...Array(5)].map((_, i) => (
        <FaStar key={i} size={16} color={i < rating ? "#FFD700" : "#ddd"} />
      ))}
    </div>
  );

  // Filter feedbacks
  const filteredFeedbacks = feedbacks.filter((f) => {
    const query = searchQuery.toLowerCase();
    const matchText =
      f.username.toLowerCase().includes(query) ||
      f.comment.toLowerCase().includes(query) ||
      (f.adminReply ? f.adminReply.toLowerCase().includes(query) : false);

    const matchRating = searchRating ? f.rating === Number(searchRating) : true;

    return matchText && matchRating;
  });

  const generatePDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["User", "Feedback", "Rating", "Reply"];
    const tableRows = [];

    filteredFeedbacks.forEach((f) => {
      const row = [
        f.username,
        f.comment,
        f.rating,
        f.adminReply || "No reply yet",
      ];
      tableRows.push(row);
    });

    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 20 });
    doc.text("Feedback Report", 14, 15);
    doc.save("feedback_report.pdf");
  };

  return (
    <div className="h-full w-full p-6 bg-sec-2 min-h-screen">
      {/* Top buttons */}
      <div className="w-full flex justify-end gap-2 mb-2">
        <button
          className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => setShowSearchFields(!showSearchFields)}
        >
          <FaSearch /> Search
        </button>
        <button
          className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={generatePDF}
        >
          <FaFilePdf /> PDF
        </button>
      </div>

      {/* Search fields */}
      {showSearchFields && (
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search by user, comment, reply"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border px-2 py-1 rounded w-full"
          />
          <select
            value={searchRating}
            onChange={(e) => setSearchRating(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">All Ratings</option>
            {[1, 2, 3, 4, 5].map((r) => (
              <option key={r} value={r}>
                {r} Star{r > 1 && "s"}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="overflow-x-auto shadow-lg rounded-2xl bg-white">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-accent text-white text-end">
            <tr>
              <th className="py-3 px-4 text-left rounded-tl-2xl">User</th>
              <th className="py-3 px-4 text-left">Feedback</th>
              <th className="py-3 px-4 text-left">Rating</th>
              <th className="py-3 px-4 text-left">Reply</th>
              <th className="py-3 px-4 text-center rounded-tr-2xl">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFeedbacks.length > 0 ? (
              filteredFeedbacks.map((f, idx) => (
                <tr
                  key={f._id}
                  className={`border-b hover:bg-gray-50 transition-colors ${
                    idx % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                  }`}
                >
                  <td className="py-3 px-4 text-left font-medium">
                    {f.username}
                  </td>
                  <td className="py-3 px-4 text-left max-w-xs break-words">
                    {f.comment}
                  </td>
                  <td className="py-3 px-4 text-left">
                    {renderStars(f.rating)}
                  </td>
                  <td className="py-3 px-4 text-left">
                    {editingId === f._id ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="border px-2 py-1 rounded w-full"
                          rows={2}
                          placeholder="Type your reply..."
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => submitReply(f._id)}
                            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelReply}
                            className="bg-gray-400 text-white px-3 py-1 rounded text-sm hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <span
                          className={
                            f.adminReply ? "text-gray-800" : "text-gray-400"
                          }
                        >
                          {f.adminReply || "No reply yet"}
                        </span>
                        {!f.adminReply && (
                          <button
                            onClick={() => startReply(f._id)}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600 w-fit"
                          >
                            Reply
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-row gap-4 justify-center items-center text-lg">
                      {deletingId === f._id ? (
                        <div className="flex flex-col items-center gap-2 bg-gray-100 p-2 rounded-lg">
                          <p className="text-xs text-center">
                            Delete feedback?
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDelete(f._id)}
                              className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                            >
                              Yes
                            </button>
                            <button
                              onClick={cancelDelete}
                              className="bg-gray-400 text-white px-2 py-1 rounded text-xs hover:bg-gray-500"
                            >
                              No
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <FaRegEdit
                            className="cursor-pointer hover:text-yellow-500 transition-colors"
                            onClick={() => startReply(f._id, f.adminReply)}
                          />
                          <TfiTrash
                            className="cursor-pointer hover:text-red-600 transition-colors"
                            onClick={() => confirmDelete(f._id)}
                          />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-6 px-4 text-center text-gray-500">
                  No feedback submitted yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeedbackPage;
