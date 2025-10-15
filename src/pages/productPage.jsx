import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

// Swiper v11 imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import ProductCard from "../components/productCard";
import { Loader } from "../components/loader";
import { BiSearch } from "react-icons/bi";

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [userInteracted, setUserInteracted] = useState(false);

  // Load all products
  useEffect(() => {
    if (isLoading) {
      axios
        .get(import.meta.env.VITE_API_URL + "/api/products")
        .then((response) => {
          setProducts(response.data);
          setFilteredProducts(response.data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching products...", error);
          setIsLoading(false);
          toast.error("Failed to load products...");
        });
    }
  }, [isLoading]);

  // Load trending products
  useEffect(() => {
    axios
      .get(import.meta.env.VITE_API_URL + "/api/products/trending")
      .then((response) => {
        setTrendingProducts(response.data);
      })
      .catch((error) => {
        console.error("Error fetching trending products...", error);
        toast.error("Failed to load trending products...");
      });
  }, []);

  // Filter products whenever search term or category changes
  useEffect(() => {
    let filtered = products;

    if (selectedCategory === "Trending") {
      filtered = trendingProducts;
    } else if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().startsWith(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);

    // Scroll to products only after user interaction
    // if (userInteracted) {
    //   const productSection = document.getElementById("product-grid");
    //   if (productSection) {
    //     productSection.scrollIntoView({ behavior: "smooth" });
    //   }
    // }
  }, [searchTerm, selectedCategory, products, trendingProducts, userInteracted]);

  // Categories including Trending
  const categories = ["All", "Trending", "Oil", "Powder", "Liquid", "Raw"];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-primary">
      {/* Banner */}
      <section className="bg-accent text-white">
        <div className="container mx-auto p-4 text-center">
          <p className="text-sm font-medium">
            ✨ 25% OFF YOUR FIRST ORDER WITH CODE:{" "}
            <span className="font-bold">COCO15</span> ✨
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Categories & Search */}
        <div className="flex flex-wrap gap-2 mb-8 items-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setUserInteracted(true);
              }}
              className={`px-4 py-2 rounded-md shadow text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-accent text-white"
                  : "bg-white hover:bg-white/50"
              }`}
            >
              {cat}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-4 rounded-md bg-white px-3 py-2 shadow">
            <span className="material-symbols-outlined text-secondary">
              <BiSearch />
            </span>
            <input
              className="w-32 bg-transparent text-sm focus:outline-none"
              placeholder="Search products..."
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setUserInteracted(true);
              }}
            />
          </div>
        </div>

        {/* Trending Products Carousel */}
        {selectedCategory === "Trending" && trendingProducts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Trending Products</h2>
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={24}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              loop
            >
              {trendingProducts.map((item) => (
                <SwiperSlide key={item.productID}>
                  <ProductCard product={item} />
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        )}

        {/* All Products */}
        <h2 className="text-3xl font-bold mb-6">Our Products</h2>
        {isLoading ? (
          <Loader />
        ) : filteredProducts.length > 0 ? (
          <div
            id="product-grid"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
          >
            {filteredProducts.map((item) => (
              <ProductCard key={item.productID} product={item} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No products found.</p>
        )}
      </main>
    </div>
  );
}
