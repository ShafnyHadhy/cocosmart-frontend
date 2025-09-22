import { useState } from "react";
import { useNavigate } from "react-router-dom";
import mediaUpload from "../../utils/mediaUpload";
import toast from "react-hot-toast";
import axios from "axios";

export default function AdminAddNewProduct() {
  const [productID, setProductId] = useState("");
  const [name, setName] = useState("");
  const [altNames, setAltnames] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [price, setPrice] = useState("");
  const [labelledPrice, setLabelledPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [cost, setCost] = useState("");
  const [isTrending, setIsTrending] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Validation function
  function validate() {
    const newErrors = {};
    if (!productID) newErrors.productID = "Product ID is required";
    if (!name) newErrors.name = "Product name is required";
    if (!description) newErrors.description = "Description is required";
    if (images.length === 0) newErrors.images = "At least one image is required";
    if (!price || price <= 0) newErrors.price = "Enter a valid price";
    if (!labelledPrice || labelledPrice <= 0)
      newErrors.labelledPrice = "Enter a valid labelled price";
    if (!category) newErrors.category = "Please select a category";
    if (!stock || stock < 0) newErrors.stock = "Enter stock quantity";
    if (!cost || cost <= 0) newErrors.cost = "Enter unit cost";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function addproduct() {
    const token = localStorage.getItem("token");

    if (token == null) {
      navigate("/login");
      return;
    }

    if (!validate()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    const promises = [];
    for (let i = 0; i < images.length; i++) {
      promises[i] = mediaUpload(images[i]);
    }

    try {
      const urls = await Promise.all(promises);
      const alternativeNamesArray = altNames.split(",");

      const product = {
        productID,
        name,
        altNames: alternativeNamesArray,
        description,
        images: urls,
        price,
        labelledPrice,
        category,
        stock,
        cost,
        isTrending,
      };

      console.log(product);

      axios.post(import.meta.env.VITE_API_URL + "/api/products", product, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      toast.success("Product added successfully");
      navigate("/admin/products");
    } catch {
      toast.error("An Error occurred...");
    }
  }

  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl p-10 border border-gray-200">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-800">
            Add New Product
          </h2>
          <p className="text-gray-500 mt-2">
            Fill in the details carefully to add a new product to your store.
          </p>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product ID
              </label>
              <input
                value={productID}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="Unique Product ID"
                className="w-full p-3 border rounded-xl border-gray-300 focus:ring-2 focus:ring-accent focus:outline-none"
              />
              {errors.productID && (
                <p className="text-red-500 text-xs mt-1">{errors.productID}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Product Name"
                className="w-full p-3 border rounded-xl border-gray-300 focus:ring-2 focus:ring-accent focus:outline-none"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Alternative Names
              </label>
              <input
                value={altNames}
                onChange={(e) => setAltnames(e.target.value)}
                placeholder="Comma-separated values"
                className="w-full p-3 border rounded-xl border-gray-300 focus:ring-2 focus:ring-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed product description"
                rows={5}
                className="w-full p-3 border rounded-xl border-gray-300 focus:ring-2 focus:ring-accent focus:outline-none resize-none"
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Images
              </label>
              <input
                type="file"
                onChange={(e) => setImages(e.target.files)}
                multiple
                className="w-full border rounded-xl border-gray-300 p-3 text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-accent file:text-white hover:file:bg-secondary transition-all"
              />
              {errors.images && (
                <p className="text-red-500 text-xs mt-1">{errors.images}</p>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Price"
                  className="w-full p-3 border rounded-xl border-gray-300 focus:ring-2 focus:ring-accent focus:outline-none"
                />
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Labelled Price
                </label>
                <input
                  type="number"
                  value={labelledPrice}
                  onChange={(e) => setLabelledPrice(e.target.value)}
                  placeholder="Labelled Price"
                  className="w-full p-3 border rounded-xl border-gray-300 focus:ring-2 focus:ring-accent focus:outline-none"
                />
                {errors.labelledPrice && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.labelledPrice}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 border rounded-xl border-gray-300 focus:ring-2 focus:ring-accent focus:outline-none bg-white"
              >
                <option value="">Select Category</option>
                <option value="Oil">Oil</option>
                <option value="Powder">Powder</option>
                <option value="Raw">Raw</option>
              </select>
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stock Quantity
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Stock Quantity"
                className="w-full p-3 border rounded-xl border-gray-300 focus:ring-2 focus:ring-accent focus:outline-none"
              />
              {errors.stock && (
                <p className="text-red-500 text-xs mt-1">{errors.stock}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Unit Cost
              </label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="Unit Cost"
                className="w-full p-3 border rounded-xl border-gray-300 focus:ring-2 focus:ring-accent focus:outline-none"
              />
              {errors.cost && (
                <p className="text-red-500 text-xs mt-1">{errors.cost}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Is Trending
              </label>
              <select
                value={isTrending}
                onChange={(e) => setIsTrending(e.target.value === "yes")}
                className="w-full p-3 border rounded-xl border-gray-300 focus:ring-2 focus:ring-accent focus:outline-none bg-white"
              >
                <option value="">Select Option</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-12">
          <button
            className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold border-1 border-accent rounded-xl shadow hover:bg-gray-200 transition-all"
            onClick={() => navigate("/admin/products")}
          >
            Cancel
          </button>
          <button
            className="px-8 py-3 bg-accent text-white font-semibold rounded-xl shadow hover:bg-secondary transition-all"
            onClick={addproduct}
          >
            Add Product
          </button>
        </div>
      </div>
    </div>
  );
}
