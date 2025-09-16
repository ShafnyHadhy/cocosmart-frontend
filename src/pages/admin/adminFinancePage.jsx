import axios from "axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { FaRegEdit, FaTimes } from "react-icons/fa";
import { TfiTrash } from "react-icons/tfi";
import { Link, useNavigate } from "react-router-dom";
import { Loader } from "../../components/loader";

// Delete Confirmation Modal
function FinanceDeleteConfirmation({ financeID, close, refresh }) {
  function deleteFinance() {
    const token = localStorage.getItem("token");
    axios
      .delete(import.meta.env.VITE_API_URL + "/api/finances/" + financeID, {
        headers: { Authorization: "Bearer " + token },
      })
      .then((response) => {
        console.log(response.data);
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
        {/* Close Button */}
        <button
          onClick={close}
          className="absolute -right-4 -top-4 w-10 h-10 bg-red-600 rounded-full flex justify-center items-center text-white hover:bg-white hover:text-red-600 border border-red-600 transition"
        >
          <FaTimes size={18} />
        </button>

        {/* Content */}
        <p className="text-lg font-semibold text-gray-800 text-center leading-relaxed">
          Are you sure you want to delete the finance record with <br />
          <span className="text-red-600 font-bold">ID: {financeID}</span>?
        </p>

        {/* Buttons */}
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

// Main Page
export default function AdminFinancePage() {
  const [finances, setFinances] = useState([]);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [financeToBeDeleted, setFinanceToBeDeleted] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) {
      axios
        .get(import.meta.env.VITE_API_URL + "/api/finances")
        .then((response) => {
          console.log(response.data);
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Finances</h1>
        <Link
          to="/admin/add-finance"
          className="w-10 h-10 flex justify-center items-center bg-accent text-white text-3xl rounded-full drop-shadow-md hover:scale-110 transition-transform"
          title="Add Finance"
        >
          <CiCirclePlus />
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
                {finances.map((item, index) => (
                  <tr
                    key={item.financeID}
                    className={`transition-colors hover:bg-gray-100 ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="py-3 px-4 font-medium text-gray-700">
                      {item.financeID}
                    </td>
                    <td
                      className={`py-3 px-4 font-semibold ${
                        item.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {item.type}
                    </td>
                    <td className="py-3 px-4 text-gray-800">{item.source}</td>
                    <td className="py-3 px-4 font-bold text-gray-700">
                      Rs. {item.amount}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {item.expenseID ? item.expenseID : "-"}
                    </td>
                    {/* Actions */}
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => {
                            navigate("/admin/update-finance", { state: item });
                          }}
                          className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-600 hover:text-white transition"
                          title="Edit"
                          disabled={item.type === "expense"} // 🚫 disable editing expense-linked records
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
                          disabled={item.type === "expense"} // 🚫 disable deleting expense-linked records
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
