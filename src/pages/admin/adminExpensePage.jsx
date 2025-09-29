import axios from "axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { FaRegEdit, FaTimes } from "react-icons/fa";
import { TfiTrash } from "react-icons/tfi";
import { Link, useNavigate } from "react-router-dom";
import { Loader } from "../../components/loader";
import { RiFilterOffFill } from "react-icons/ri";

function ExpenseDeleteConfirmation({ expenseID, close, refresh }) {
  function deleteExpense() {
    const token = localStorage.getItem("token");
    axios
      .delete(import.meta.env.VITE_API_URL + "/api/expenses/" + expenseID, {
        headers: { Authorization: "Bearer " + token },
      })
      .then(() => {
        close();
        toast.success("Expense Deleted Successfully!");
        refresh();
      })
      .catch(() => {
        toast.error("Failed to delete the expense!");
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
          Are you sure you want to delete the expense with <br />
          <span className="text-red-600 font-bold">ID: {expenseID}</span>?
        </p>
        <div className="flex justify-center gap-6 mt-2">
          <button
            onClick={close}
            className="w-28 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-black transition"
          >
            No
          </button>
          <button
            onClick={deleteExpense}
            className="w-28 py-2 rounded-md bg-red-600 text-white font-medium hover:bg-black transition"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminExpensePage() {
  const [expenses, setExpenses] = useState([]);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [expenseToBeDeleted, setExpenseToBeDeleted] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [categoryFilter, setCategoryFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState(""); // YYYY-MM for month filter

  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) {
      axios
        .get(import.meta.env.VITE_API_URL + "/api/expenses")
        .then((response) => {
          setExpenses(response.data);
          setIsLoading(false);
        })
        .catch(() => {
          toast.error("Failed to fetch expenses");
          setIsLoading(false);
        });
    }
  }, [isLoading]);

  // Get unique categories
  const categories = [...new Set(expenses.map((e) => e.category))];

  // Filtered expenses
  const filteredExpenses = expenses.filter((expense) => {
    const matchesCategory = categoryFilter ? expense.category === categoryFilter : true;

    const matchesMonth = monthFilter
      ? new Date(expense.date).toISOString().slice(0, 7) === monthFilter
      : true;

    return matchesCategory && matchesMonth;
  });

  return (
    <div className="h-full w-full p-6">
      {/* Delete Modal */}
      {isDeleteConfirmVisible && (
        <ExpenseDeleteConfirmation
          refresh={() => setIsLoading(true)}
          expenseID={expenseToBeDeleted}
          close={() => setIsDeleteConfirmVisible(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Expenses</h1>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Add Expense</label>
          <Link
          to="/admin/add-expense"
          className="w-10 h-10 flex justify-center items-center bg-accent text-white text-3xl rounded-full drop-shadow-md hover:scale-110 transition-transform"
          title="Add Expense"
        >
          <CiCirclePlus />
        </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-center mb-4 md:justify-end">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="p-2 border rounded-lg border-gray-300 text-sm focus:ring-1 focus:ring-accent focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
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
              setCategoryFilter("");
              setMonthFilter("");
            }}/>
          </Link>
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
                  <th className="py-3 px-4 text-left rounded-tl-lg">Expense ID</th>
                  <th className="py-3 px-4 text-left">Category</th>
                  <th className="py-3 px-4 text-left">Amount</th>
                  <th className="py-3 px-4 text-left">Description</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-center rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((item, index) => (
                  <tr
                    key={item.expenseID}
                    className={`transition-colors hover:bg-gray-100 ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="py-3 px-4 font-medium text-gray-700">{item.expenseID}</td>
                    <td className="py-3 px-4 font-semibold text-gray-800">{item.category}</td>
                    <td className="py-3 px-4 text-red-600 font-bold">
                      Rs. {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{item.description}</td>
                    <td className="py-3 px-4 text-gray-500">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => navigate("/admin/update-expense", { state: item })}
                          className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-600 hover:text-white transition"
                          title="Edit"
                        >
                          <FaRegEdit />
                        </button>
                        <button
                          onClick={() => {
                            setExpenseToBeDeleted(item.expenseID);
                            setIsDeleteConfirmVisible(true);
                          }}
                          className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition"
                          title="Delete"
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
