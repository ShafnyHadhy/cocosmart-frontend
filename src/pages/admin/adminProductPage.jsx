import axios from "axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { FaRegEdit } from "react-icons/fa";
import { TfiTrash } from "react-icons/tfi";
import { Link, useNavigate } from "react-router-dom";
import { Loader } from "../../components/loader";
import { FaTimes } from "react-icons/fa";

function ProductDeleteConfirmation(props) {
  const productID = props.productID;
  const close = props.close;
  const refresh = props.refresh;

  function deleteProduct() {
    const token = localStorage.getItem("token");
    axios
      .delete(import.meta.env.VITE_API_URL + "/api/products/" + productID, {
        headers: {
          Authorization: "Bearer " + token,
        },
      })
      .then((response) => {
        console.log(response.data);
        close();
        toast.success("Product Deleted Successfully!");
        refresh();
      })
      .catch((error) => {
        toast.error("Failed to delete the product!", error);
      });
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center">
      <div className="w-[480px] bg-white rounded-2xl shadow-lg relative flex flex-col gap-6 p-8">
        {/* Close Button */}
        <button
          onClick={close}
          className="absolute -right-4 -top-4 w-10 h-10 bg-red-600 rounded-full flex justify-center items-center text-white hover:bg-white hover:text-red-600 border border-red-600 transition"
        >
          <FaTimes size={18} />
        </button>

        {/* Content */}
        <p className="text-lg font-semibold text-gray-800 text-center leading-relaxed">
          Are you sure you want to delete the product with <br />
          <span className="text-red-600 font-bold">Product ID: {productID}</span>?
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
            onClick={deleteProduct}
            className="w-28 py-2 rounded-md bg-red-600 text-white font-medium hover:bg-black transition"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProductPage() {
  const [products, setProducts] = useState([]);
  const [isdeleteConfirmVisible, setIsdeleteconfirmVisible] = useState(false);
  const [productToBeDeleted, setProductToBeDeleted] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) {
      axios.get(import.meta.env.VITE_API_URL + "/api/products").then((response) => {
        console.log(response.data);
        setProducts(response.data);
        setIsLoading(false);
      });
    }
  }, [isLoading]);

  return (
    <div className="h-full w-full p-6">
      {/* Delete Confirmation Modal */}
      {isdeleteConfirmVisible && (
        <ProductDeleteConfirmation
          refresh={() => {
            setIsLoading(true);
          }}
          productID={productToBeDeleted}
          close={() => {
            setIsdeleteconfirmVisible(false);
          }}
        />
      )}

      {/* Header + Add Button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
        <Link
          to="/admin/add-product"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-accent text-white text-3xl shadow-lg hover:scale-110 transition-transform"
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
                  <th className="py-3 px-4 text-left rounded-tl-lg">Image</th>
                  <th className="py-3 px-4 text-left">Product ID</th>
                  <th className="py-3 px-4 text-left">Product Name</th>
                  <th className="py-3 px-4 text-left">Price</th>
                  <th className="py-3 px-4 text-left">Labelled Price</th>
                  <th className="py-3 px-4 text-left">Stock</th>
                  <th className="py-3 px-4 text-left">Cost</th>
                  <th className="py-3 px-4 text-left">Category</th>
                  <th className="py-3 px-4 text-center rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item, index) => (
                  <tr
                    key={item.productID}
                    className={`transition-colors hover:bg-gray-100 ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="py-3 px-4">
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded-lg shadow-sm"
                      />
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-700">
                      {item.productID}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-800">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 text-green-600 font-bold">
                      Rs. {item.price}
                    </td>
                    <td className="py-3 px-4 line-through text-gray-400">
                      Rs. {item.labelledPrice}
                    </td>

                    {/* Stock as badge */}
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          item.stock === 0
                            ? "bg-red-100 text-red-600"
                            : item.stock < 10
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {item.stock > 0 ? `${item.stock} pcs` : "Out of stock"}
                      </span>
                    </td>

                    {/* Cost */}
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 bg-gray-100 rounded-md text-gray-700 font-medium">
                        Rs. {item.cost}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-gray-600">{item.category}</td>

                    {/* Action Buttons */}
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => {
                            navigate("/admin/update-product", { state: item });
                          }}
                          className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-600 hover:text-white transition"
                          title="Edit"
                        >
                          <FaRegEdit />
                        </button>
                        <button
                          onClick={() => {
                            setProductToBeDeleted(item.productID);
                            setIsdeleteconfirmVisible(true);
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
