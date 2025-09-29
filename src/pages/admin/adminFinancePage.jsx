import axios from "axios";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { FaRegEdit, FaTimes } from "react-icons/fa";
import { TfiTrash } from "react-icons/tfi";
import { Link, useNavigate } from "react-router-dom";
import { Loader } from "../../components/loader";
import { MdDownload } from "react-icons/md";
import { RiFilterOffFill } from "react-icons/ri";

// Delete Confirmation Modal
function FinanceDeleteConfirmation({ financeID, close, refresh }) {
  function deleteFinance() {
    const token = localStorage.getItem("token");
    axios
      .delete(import.meta.env.VITE_API_URL + "/api/finances/" + financeID, {
        headers: { Authorization: "Bearer " + token },
      })
      .then((response) => {
        close();
        toast.success("Finance Record Deleted Successfully!");
        refresh();
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to delete the finance record!");
      });
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center">
      <div className="w-[420px] bg-white rounded-2xl shadow-lg relative flex flex-col gap-6 p-8">
        <button
          onClick={close}
          className="absolute -right-4 -top-4 w-10 h-10 bg-red-600 rounded-full flex justify-center items-center text-white hover:bg-white hover:text-red-600 border border-red-600 transition"
        >
          <FaTimes size={18} />
        </button>

        <p className="text-lg font-semibold text-gray-800 text-center leading-relaxed">
          Are you sure you want to delete the finance record with <br />
          <span className="text-red-600 font-bold">ID: {financeID}</span>?
        </p>

        <div className="flex justify-center gap-6 mt-2">
          <button
            onClick={close}
            className="w-28 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-black transition"
          >
            No
          </button>
          <button
            onClick={deleteFinance}
            className="w-28 py-2 rounded-md bg-red-600 text-white font-medium hover:bg-black transition"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}

  export default function AdminFinancePage() {
    const [finances, setFinances] = useState([]);
    const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
    const [financeToBeDeleted, setFinanceToBeDeleted] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    

function generatePDF(finances, startDate, endDate) {
  const doc = new jsPDF();
  const logoImg = new Image();
  logoImg.src = "/clogo.png"; // make sure logo is in public folder

  logoImg.onload = () => {
    // Add logo
    doc.addImage(logoImg, "PNG", 15, 10, 30, 30);

    // Company Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("CocoSmart Pvt Ltd", 105, 20, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text("Smart Solutions for Coconut Plantations", 105, 28, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Hotline: +94 77 123 4567 | Email: info@cocosmart.com  |  Fax: +1-234-567-890", 105, 36, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("123/C, Main Street, Colombo 01, Sri Lanka", 105, 42, { align: "center" });

     // Report Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Finance Report", 105, 53, { align: "center" });

    // Period and Generated On line
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Period: ${startDate || "All"} - ${endDate || "All"}`, 15, 64, { align: "left" });  // left side
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 193, 64, { align: "right" });        // right side

    // Filter finance data by date
    const filtered = finances.filter((f) => {
    const d = new Date(f.date);

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (end) {
      end.setHours(23, 59, 59, 999); // include the entire end day
    }

    return (!start || d >= start) && (!end || d <= end);
  });

    // Separate incomes and expenses
    let orderSalesTotal = 0;
    let incomeData = [];
    let expenseData = [];
    let totalIncome = 0;
    let totalExpense = 0;

    // Group expenses by category
    let expenseGroups = {}; // { Salary: 2000, Utility: 1500, ... }

    filtered.forEach((f) => {
      if (f.type === "income") {
        if (f.source.startsWith("Order Sales")) {
          orderSalesTotal += f.amount; // sum all order sales
        } else {
          incomeData.push([f.source, formatAmount(f.amount), ""]); // other incomes
          totalIncome += f.amount;
        }
      } else if (f.type === "expense") {
          if (!expenseGroups[f.source]) {
            expenseGroups[f.source] = 0;
          }
          expenseGroups[f.source] += f.amount; // sum by category
          totalExpense += f.amount;
        }
    });

    // Add combined Order Sales row at the top if exists
    if (orderSalesTotal > 0) {
      incomeData.unshift(["Order Sales", formatAmount(orderSalesTotal), ""]);
      totalIncome += orderSalesTotal;
    }

    // After grouping expenses
    Object.entries(expenseGroups).forEach(([category, total]) => {
      expenseData.push([category, "", formatAmount(total)]);
    });

    // Merge incomes first, then expenses
    const bodyData = [...incomeData, ...expenseData];

    // Add totals row
    bodyData.push([
      "Total Income",
      formatAmount(totalIncome),
      "",
      "bold",
    ]);
    bodyData.push([
      "Total Expense",
      "",
      formatAmount(totalExpense),
      "bold",
    ]);
    bodyData.push([
      "Net Profit",
      formatAmount(totalIncome - totalExpense),
      "",
      "bold",
    ]);

    // Generate table
    autoTable(doc, {
      startY: 70,
      head: [["Revenue / Expense Source", "Income (Rs.)", "Expense (Rs.)"]],
      body: bodyData.map((row) => row.slice(0, 3)), // drop last "bold" column for styling
      theme: "grid",
      styles: { fontSize: 10, lineWidth: 0.1, lineColor: [0, 0, 0], },
      headStyles: { fillColor: [42, 85, 64], textColor: 255, halign: "center", lineWidth: 0.0, lineColor: [0, 0, 0], },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: 40, halign: "right" },
        2: { cellWidth: 40, halign: "right" },
      },
      didParseCell: function (data) {
        const row = bodyData[data.row.index];
        if (row && row[3] === "bold") {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.lineWidth = 0.1;      // thicker border for bold rows
          data.cell.styles.lineColor = [0, 0, 0];
        }
      },
    });

    // --- FOOTER ---
    const pageCount = doc.internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        // Left footer: prepared/approved info
        doc.text("Prepared by: Admin01 | Approved by: Finance Manager", 15, 290, { align: "left" });
        // Right footer: report ID and page number
        doc.text(`Report ID: FIN-${Date.now()} | Page ${i} of ${pageCount}`, 200, 290, { align: "right" });
    }

    // Save PDF
    doc.save(`Cocosmart_Finance_Report_${Date.now()}.pdf`);
  };

  // Helper: format amounts with comma and 2 decimals
  function formatAmount(amount) {
    return Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}

  // Filters
  const [typeFilter, setTypeFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) {
      axios
        .get(import.meta.env.VITE_API_URL + "/api/finances")
        .then((response) => {
          setFinances(response.data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error(error);
          toast.error("Failed to fetch finance records");
          setIsLoading(false);
        });
    }
  }, [isLoading]);

  // Filtered Finances
  const filteredFinances = finances.filter((item) => {
    const matchesType = typeFilter ? item.type === typeFilter : true;
    const matchesMonth = monthFilter
      ? new Date(item.date).toISOString().slice(0, 7) === monthFilter
      : true;
    return matchesType && matchesMonth;
  });

  return (
    <div className="h-full w-full p-6">
      {/* Delete Modal */}
      {isDeleteConfirmVisible && (
        <FinanceDeleteConfirmation
          refresh={() => setIsLoading(true)}
          financeID={financeToBeDeleted}
          close={() => setIsDeleteConfirmVisible(false)}
        />
      )}

      {/* Header with Add Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Finances</h1>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Add Income</label>
          <Link
            to="/admin/add-finance"
            className="w-10 h-10 flex justify-center items-center bg-accent text-white text-3xl rounded-full drop-shadow-md hover:scale-110 transition-transform"
            title="Add Finance"
          >
            <CiCirclePlus />
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex flex-col md:flex-row md:justify-between items-center gap-3">
        <div className="flex gap-3">
          <label className="self-center text-sm font-medium text-gray-700">From:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className="p-2 border rounded-lg border-gray-300 text-sm"
          />
          <label className="self-center text-sm font-medium text-gray-700">To:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
            max={new Date().toISOString().split("T")[0]}
            className="p-2 border rounded-lg border-gray-300 text-sm"
          />
          <Link className="p-2 border rounded-lg border-gray-300 text-md hover:bg-gray-100 transition" title="Download Finance Report">
            <MdDownload size={20} onClick={() => generatePDF(finances, startDate, endDate)}/>
          </Link>
        </div>
      </div>
        <div className="flex flex-col md:flex-row md:justify-end gap-3 items-center">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="p-2 border rounded-lg border-gray-300 text-sm focus:ring-1 focus:ring-accent focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <input
            type="month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            max={new Date().toISOString().slice(0, 7)}
            className="p-2 border rounded-lg border-gray-300 text-sm focus:ring-1 focus:ring-accent focus:outline-none"
          />
          <Link className="p-2 border rounded-lg border-gray-300 text-md hover:bg-gray-100 transition"  title="Clear Filter">
            <RiFilterOffFill size={18} onClick={() => {
              setTypeFilter("");
              setMonthFilter("");
            }}/>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="w-full h-full">
        {isLoading ? (
          <Loader />
        ) : (
          <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-accent text-white">
                <tr>
                  <th className="py-3 px-4 text-left rounded-tl-lg">Finance ID</th>
                  <th className="py-3 px-4 text-left">Type</th>
                  <th className="py-3 px-4 text-left">Source</th>
                  <th className="py-3 px-4 text-left">Amount</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Linked Expense</th>
                  <th className="py-3 px-4 text-center rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFinances.map((item, index) => (
                  <tr
                    key={item.financeID}
                    className={`transition-colors hover:bg-gray-100 ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="py-3 px-4 font-medium text-gray-700">{item.financeID}</td>
                    <td
                      className={`py-3 px-4 font-semibold ${
                        item.type === "income" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {item.type}
                    </td>
                    <td className="py-3 px-4 text-gray-800">{item.source}</td>
                    <td className="py-3 px-4 font-bold text-gray-700">
                      Rs. {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-gray-500">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-gray-500">{item.expenseID || "-"}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => navigate("/admin/update-finance", { state: item })}
                          className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-600 hover:text-white transition"
                          title="Edit"
                          disabled={item.type === "expense"}
                        >
                          <FaRegEdit />
                        </button>
                        <button
                          onClick={() => {
                            setFinanceToBeDeleted(item.financeID);
                            setIsDeleteConfirmVisible(true);
                          }}
                          className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition"
                          title="Delete"
                          disabled={item.type === "expense"}
                        >
                          <TfiTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
