import { CiStar } from "react-icons/ci";
import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <div className="group relative flex flex-col rounded-xl bg-white/60 shadow-md transition-all duration-300 hover:shadow-lg overflow-hidden">
      {/* Image */}
      <div className="relative">
        <img
          alt={product.name}
          className="w-full h-48 sm:h-56 md:h-64 object-cover"
          src={product.images[0]}
        />
        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold shadow">
          <CiStar className="text-yellow-500 text-sm" /> 4.8
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col p-4 flex-grow">
        {/* Product Name */}
        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-accent line-clamp-1">
          {product.name}
        </h3>

        {/* Category */}
        <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
          {product.category}
        </p>

        {/* Pricing */}
        {product.labelledPrice > product.price ? (
          <div className="flex flex-col items-baseline gap-2">
            <p className="text-lg font-bold text-green-600">
              LKR {product.price.toFixed(2)}
            </p>
            <p className="text-sm text-gray-400 font-semibold line-through">
              LKR {product.labelledPrice.toFixed(2)}
            </p>
            <span className="ml-auto text-xs font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded-full">
              {Math.round(
                ((product.labelledPrice - product.price) /
                  product.labelledPrice) *
                  100
              )}
              % OFF
            </span>
          </div>
        ) : (
          <p className="text-lg font-bold text-green-600">
            LKR {product.price.toFixed(2)}
          </p>
        )}
      </div>

      {/* Button */}
      <div className="p-4 pt-0 w-full">
        <Link
          to={"/overview/" + product.productID}
          className="w-full block rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-90 transition-colors text-center"
        >
          View Product
        </Link>
      </div>
    </div>
  );
}
