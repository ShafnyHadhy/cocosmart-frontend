import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaStar, FaRegEdit, FaSearch, FaRegFilePdf } from "react-icons/fa";
import { TfiTrash } from "react-icons/tfi";
import { LuReplyAll } from "react-icons/lu";

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

  // Generate PDF
  const generateFeedbackReport = () => {
    const doc = new jsPDF();
    const logoImg = new Image();
    logoImg.src = "/clogo.png";

    const now = new Date();
    const reportId = `RPT-${now.getFullYear()}${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-${now
      .getHours()
      .toString()
      .padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}${now
      .getSeconds()
      .toString()
      .padStart(2, "0")}`;

    // ===== Header =====
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("COCOSMART", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Comprehensive User Feedback Analysis", 105, 38, {
      align: "center",
    }); // moved down

    doc.text("123/C, Main Street, Colombo 01, Sri Lanka", 105, 46, {
      align: "center",
    }); // moved down

    // Generated on / Report ID below address
    doc.setFontSize(10);
    doc.text(
      `Generated on: ${now.toLocaleString()} | Report ID: ${reportId}`,
      105,
      54, // moved down
      { align: "center" }
    );

    // ===== Add FEEDBACK REPORT heading again before table =====
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("FEEDBACK REPORT", 105, 62, { align: "center" }); // startY for tables below this

    // ===== Filter feedbacks by rating =====
    const ratings = [5, 4, 3, 2, 1];
    let startY = 70; // space below repeated heading

    ratings.forEach((rating) => {
      const feedbacksByRating = feedbacks.filter((f) => f.rating === rating);
      if (feedbacksByRating.length === 0) return;

      // Table heading
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(41, 128, 185);
      doc.text(`${rating} Star Feedbacks`, 105, startY, { align: "center" });

      startY += 6; // small gap before table

      // Prepare table data
      const tableColumn = ["User", "Feedback", "Rating", "Reply"];
      const tableRows = feedbacksByRating.map((f) => [
        f.username,
        f.comment,
        f.rating,
        f.adminReply || "No reply yet",
      ]);

      // Add table
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY,
        theme: "grid",
        styles: { fontSize: 9, lineWidth: 0.1, lineColor: [0, 0, 0] },
        headStyles: {
          fillColor: [42, 85, 64],
          textColor: 255,
          halign: "center",
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 5, bottom: 5 },
      });

      startY = doc.lastAutoTable.finalY + 15; // space between tables
    });

    // ===== Footer =====
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Prepared by: Admin | Approved by: Manager", 15, 290, {
        align: "left",
      });
      doc.text(`Report ID: ${reportId} | Page ${i} of ${pageCount}`, 200, 290, {
        align: "right",
      });
    }

    // Save PDF
    doc.save(
      `feedback_report_${now.getFullYear()}${
        now.getMonth() + 1
      }${now.getDate()}.pdf`
    );
  };

  return (
    <div className="h-full w-full p-6 bg-sec-2 min-h-screen">
      {/* Top buttons */}

      <div className="w-full flex justify-end gap-2 mb-2">
        <button
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-400 text-black hover:bg-gray-600 hover:scale-110 transition"
          onClick={() => setShowSearchFields(!showSearchFields)}
          title="Search Feedback"
        >
          <FaSearch size={20} />
        </button>

        {/* PDF icon clickable */}
        <button
          className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500 text-black hover:bg-yellow-600 hover:scale-110 transition"
          title="Generate Report"
          onClick={generateFeedbackReport}
        >
          <FaRegFilePdf size={20} />
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
                          <LuReplyAll
                            title="Reply Feedback"
                            className="cursor-pointer text-blue-600 hover:text-blue-800"
                            size={22} // makes it a bit bigger
                            onClick={() => startReply(f._id)}
                          />
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
                            title="Edit Reply"
                            className="cursor-pointer hover:text-yellow-500 transition-colors"
                            onClick={() => startReply(f._id, f.adminReply)}
                          />
                          <TfiTrash
                            title="Delete Feedback"
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
