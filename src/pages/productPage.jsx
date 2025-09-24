import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

// ✅ Swiper v11 imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

// ✅ Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import ProductCard from "../components/productCard";
import { Loader } from "../components/loader";

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all products
  useEffect(() => {
    if (isLoading) {
      axios
        .get(import.meta.env.VITE_API_URL + "/api/products")
        .then((response) => {
          setProducts(response.data);
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
          <button className="px-4 py-2 rounded-md shadow text-sm font-medium bg-accent text-white">
            All
          </button>
          <button className="px-4 py-2 rounded-md shadow text-sm font-medium bg-white hover:bg-white/50 transition-colors">
            Coconut Water
          </button>
          <button className="px-4 py-2 rounded-md shadow text-sm font-medium bg-white hover:bg-white/50 transition-colors">
            Coconut Oil
          </button>
          <button className="px-4 py-2 rounded-md shadow text-sm font-medium bg-white hover:bg-white/50 transition-colors">
            Coconut Snacks
          </button>
          <button className="px-4 py-2 rounded-md shadow text-sm font-medium bg-white hover:bg-white/50 transition-colors">
            Coconut Milk
          </button>

          <div className="hidden ml-auto sm:flex items-center gap-4 rounded-md bg-white px-3 py-2 shadow">
            <span className="material-symbols-outlined text-secondary">
              search
            </span>
            <input
              className="w-32 bg-transparent text-sm focus:outline-none"
              placeholder="Search products..."
              type="text"
            />
          </div>
        </div>

        {/* Trending Products */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Trending Products</h2>
          {trendingProducts.length > 0 ? (
            <Swiper
              modules={[Navigation, Pagination, Autoplay]} // ✅ correct usage
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
          ) : (
            <p>No trending products right now.</p>
          )}
        </section>

        {/* All Products */}
        <h2 className="text-3xl font-bold mb-6">Our Products</h2>
        {isLoading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((item) => (
              <ProductCard key={item.productID} product={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
