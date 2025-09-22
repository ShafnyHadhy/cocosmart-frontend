import React from "react";
import { Link } from "react-router-dom";

export default function ProductPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-primary text-[var(--secondary-color)]">
      
      {/* Main */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Our Products */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Our Products</h2>
          <div className="flex flex-wrap gap-2 mb-8">
            <button className="px-4 py-2 rounded-md shadow text-sm font-medium bg-accent text-white">All</button>
            <button className="px-4 py-2 rounded-md shadow text-sm font-medium bg-white hover:bg-white/50 transition-colors">Coconut Water</button>
            <button className="px-4 py-2 rounded-md shadow text-sm font-medium bg-white hover:bg-white/50 transition-colors">Coconut Oil</button>
            <button className="px-4 py-2 rounded-md shadow text-sm font-medium bg-white hover:bg-white/50 transition-colors">Coconut Snacks</button>
            <button className="px-4 py-2 rounded-md shadow text-sm font-medium bg-white hover:bg-white/50 transition-colors">Coconut Milk</button>

            <div className="hidden ml-105 sm:flex items-center gap-4 rounded-md bg-white px-3 shadow">
            <span className="material-symbols-outlined text-secondary">search</span>
            <input
              className="w-32 bg-transparent text-sm focus:outline-none"
              placeholder="Search products..."
              type="text"
            />
          </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {/* Product Cards */}
           
            <div className="group relative flex flex-col rounded-md bg-white/50 shadow-sm transition-all duration-300 hover:shadow-lg">
              <div className="relative">
                <img
                  alt="CocoSmart Organic Coconut Water"
                  className="h-auto w-full rounded-t-md object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuACZMuvhGMfmeSJkiev6a0HwJmfsEJswSqXQlx9cHqDxEgzyrk41MOn-_dE00UlWU4Jay4108et96veLSpAfAHoLXRh_oNtVU-rugkXDCtA5zAtC-dZSp8p_vhZ-7Ab3IzSrDQXPIIQ1owE6h-7R4pqplr_-5EVysunZ3KZ5cpiHRr6Q2WVqOFGl245JWLqaQZbRapARuwrMiU8KtdkAswsyZeMJSZ22evDKWqBFnLLQ3-Hn47qNAopPbt10TG-5N9Lqblblvqe8_w"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-xs font-semibold">
                  <span className="material-symbols-outlined text-sm text-yellow-500">star</span> 4.8
                </div>
              </div>
              <div className="flex flex-col p-4 flex-grow">
                <h3 className="font-bold">CocoSmart Organic Coconut Water</h3>
                <p className="text-sm text-[var(--secondary-color)]/70 mb-2">Refreshing and hydrating</p>
                <p className="text-lg font-bold text-[var(--accent-color)] mt-auto">$2.99</p>
              </div>
              <div className="p-4 pt-0 w-full">
                <Link
                 
                  className="w-full block rounded-md bg-accent px-4 py-2 text-sm font-bold text-white hover:bg-opacity-90 transition-colors text-center"
                >
                  View Product
                </Link>
              </div>
                          </div>
            {/* Repeat other products similarly */}
          </div>
        </section>

        {/* Trending Products */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Trending Products</h2>
          <div className="relative">
            <div className="flex gap-8 overflow-x-auto pb-4 [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {/* Example Trending Product */}
              <div className="w-64 flex-shrink-0">
                <div className="group relative flex flex-col rounded-md bg-white/50 shadow-sm transition-all duration-300 hover:shadow-lg">
                  <img
                    alt="Trending Product 1"
                    className="h-auto w-full rounded-t-md object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuByeBVzPUywpyBuCh7SmwHoMyCByjyOOhHSdfYZ0ZXMVLooGzn9k58P0zLTqHZDo98l2IV_0fHb_ctEyqggmiVKZFZBug_htAWyU0Pqb7n2_5cPwyFZltUgzrsEsoIe4_5Rew34t0H3I3inSiyq2MYcFOcgzH6bbt3AeJ3K_n1TLbd8GUTCnObo8SkGAgwh6jiGVxjmNbbM76qyzzbKJu5DdmIZdMN9N8wG-GeQ0dJxtFWca20MQgPdcAJUE0wdqN55OWsFRPGJOWY"
                  />
                  <div className="p-4">
                    <h3 className="font-bold">CocoSmart Toasted Coconut Clusters</h3>
                    <p className="text-sm text-[var(--secondary-color)]/70">$6.99</p>
                  </div>
                </div>
              </div>
              {/* Repeat other trending products */}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="rounded-md bg-accent p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-2">Get 10% off your first order!</h2>
          <p className="mb-6 max-w-lg mx-auto">Sign up for our newsletter to get exclusive deals, recipes, and more.</p>
          <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              className="flex-grow rounded-md border border-white/50 px-4 py-2 text-white "
              placeholder="Enter your email"
              type="email"
            />
            <button
              className="rounded-md bg-white px-6 py-2 font-bold text-accent hover:bg-opacity-90 transition-colors"
              type="submit"
            >
              Subscribe
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
