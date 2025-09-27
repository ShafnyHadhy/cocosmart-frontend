// Add this with your existing imports
import axios from "axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { FaRegEdit } from "react-icons/fa";
import { TfiTrash } from "react-icons/tfi";
import { Link, useNavigate } from "react-router-dom";
import { Loader } from "../../components/loader";
import { FaTimes } from "react-icons/fa";
import { RiFilterOffFill } from "react-icons/ri";

function ProductDeleteConfirmation({ productID, close, refresh }) {
  function deleteProduct() {
    const token = localStorage.getItem("token");
    axios
      .delete(import.meta.env.VITE_API_URL + "/api/products/" + productID, {
        headers: { Authorization: "Bearer " + token },
      })
      .then(() => {
        close();
        toast.success("Product Deleted Successfully!");
        refresh();
      })
      .catch(() => {
        toast.error("Failed to delete the product!");
      });
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center">
      <div className="w-[480px] bg-white rounded-2xl shadow-lg relative flex flex-col gap-6 p-8">
        <button
          onClick={close}
          className="absolute -right-4 -top-4 w-10 h-10 bg-red-600 rounded-full flex justify-center items-center text-white hover:bg-white hover:text-red-600 border border-red-600 transition"
        >
          <FaTimes size={18} />
        </button>
        <p className="text-lg font-semibold text-gray-800 text-center leading-relaxed">
          Are you sure you want to delete the product with <br />
          <span className="text-red-600 font-bold">Product ID: {productID}</span>?
        </p>
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

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState(""); // New state for stock status

  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) {
      axios.get(import.meta.env.VITE_API_URL + "/api/products").then((response) => {
        setProducts(response.data);
        setIsLoading(false);
      });
    }
  }, [isLoading]);

  // Extract unique categories
  const categories = [...new Set(products.map((p) => p.category))];

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.productID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter ? product.category === categoryFilter : true;

    let matchesStock = true;
    if (stockFilter === "inStock") matchesStock = product.stock > 0;
    else if (stockFilter === "lowStock") matchesStock = product.stock > 0 && product.stock < 10;
    else if (stockFilter === "outOfStock") matchesStock = product.stock === 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="h-full w-full p-6">
      {isdeleteConfirmVisible && (
        <ProductDeleteConfirmation
          refresh={() => setIsLoading(true)}
          productID={productToBeDeleted}
          close={() => setIsdeleteconfirmVisible(false)}
        />
      )}

      {/* Header + Add Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Add Product</label>
          <Link
          to="/admin/add-product"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-accent text-white text-3xl shadow-lg hover:scale-110 transition-transform"
        >
          <CiCirclePlus />
        </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-center mb-4 md:justify-end">
        <input
          type="text"
          placeholder="Search by ID or Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded-lg border-gray-300 text-sm w-64 focus:ring-1 focus:ring-accent focus:outline-none"
        />
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
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="p-2 border rounded-lg border-gray-300 text-sm focus:ring-1 focus:ring-accent focus:outline-none"
        >
          <option value="">All Stock Status</option>
          <option value="inStock">In Stock</option>
          <option value="lowStock">Low Stock (&lt;10)</option>
          <option value="outOfStock">Out of Stock</option>
        </select>
        
        <Link className="p-2 border rounded-lg border-gray-300 text-md hover:bg-gray-100 transition"  title="Clear Filter">
            <RiFilterOffFill size={18} onClick={() => {
              setCategoryFilter("");
              setStockFilter("");
              setSearchTerm("");
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
                  <th className="py-3 px-4 text-left rounded-tl-lg">Image</th>
                  <th className="py-3 px-4 text-left">Product ID</th>
                  <th className="py-3 px-4 text-left">Product Name</th>
                  <th className="py-3 px-4 text-left">Price</th>
                  <th className="py-3 px-4 text-left">Labl Price</th>
                  <th className="py-3 px-4 text-left">Stock</th>
                  <th className="py-3 px-4 text-left">Cost</th>
                  <th className="py-3 px-4 text-left">Trending</th>
                  <th className="py-3 px-4 text-center rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((item, index) => (
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
                    <td className="py-3 px-4 font-medium text-gray-700">{item.productID}</td>
                    <td className="py-3 px-4 font-semibold text-gray-800">{item.name}</td>
                    <td className="py-3 px-4 text-green-600 font-bold">
                      Rs. {item.price.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 line-through text-gray-400">
                      Rs. {item.labelledPrice.toLocaleString()}
                    </td>
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
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 bg-gray-100 rounded-md text-gray-700 font-medium">
                        Rs. {item.cost.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          item.isTrending ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.isTrending ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => navigate("/admin/update-product", { state: item })}
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
