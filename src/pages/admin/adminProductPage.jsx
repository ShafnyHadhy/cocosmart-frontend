import axios from "axios";
import { useEffect, useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { FaRegEdit } from "react-icons/fa";
import { TfiTrash } from "react-icons/tfi";
import { Link } from "react-router-dom";

export default function AdminProductPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get(import.meta.env.VITE_API_URL + "/api/products")
      .then((response) => {
        console.log(response.data);
        setProducts(response.data);
      });
  }, []);

  return (
    <div className="h-full w-full p-6 bg-sec-2">
      {/* Floating Add Button */}
      <Link
        to="/admin/add-product"
        className="fixed right-[40px] bottom-[40px] text-6xl text-accent drop-shadow-lg hover:scale-110 transition-transform"
      >
        <CiCirclePlus />
      </Link>

      {/* Table Container */}
      <div className="overflow-x-auto shadow-lg rounded-2xl bg-white">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-accent text-white text-end">
            <tr>
              <th className="py-3 px-4 text-left rounded-tl-2xl">Image</th>
              <th className="py-3 px-4 text-left">Product ID</th>
              <th className="py-3 px-4 text-left">Product Name</th>
              <th className="py-3 px-4 text-left">Price</th>
              <th className="py-3 px-4 text-left">Labelled Price</th>
              <th className="py-3 px-4 text-left">Category</th>
              <th className="py-3 px-4 text-center rounded-tr-2xl">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item, index) => (
              <tr
                key={item.productID}
                className={`border-b last:border-none hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                }`}
              >
                <td className="py-3 px-4">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-xl shadow-sm"
                  />
                </td>
                <td className="py-3 px-4">{item.productID}</td>
                <td className="py-3 px-4 font-medium">{item.name}</td>
                <td className="py-3 px-4 text-green-600 font-semibold">
                  Rs. {item.price}
                </td>
                <td className="py-3 px-4 line-through text-gray-400">
                  Rs. {item.labelledPrice}
                </td>
                <td className="py-3 px-4">{item.category}</td>
                <td className="py-3 px-4">
                  <div className="flex flex-row gap-4 justify-center items-center text-lg">
                    <TfiTrash className="cursor-pointer hover:text-red-600 transition-colors" />
                    <FaRegEdit className="cursor-pointer hover:text-green-600 transition-colors" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
