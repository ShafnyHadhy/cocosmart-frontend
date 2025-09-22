import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

export default function HomeBody() {
  return (
    <div className="w-full h-full bg-[#f5f3f1] px-[100px] pt-[50px]">

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="flex min-h-[480px] flex-col items-center justify-center rounded-xl gap-6 bg-cover bg-center bg-no-repeat p-6"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.5)), url('/cocbg.jpg')",
        }}
      >
        <h1 className="text-4xl md:text-5xl font-black text-white text-center drop-shadow-lg">
          Embrace the Essence of Coconut
        </h1>
        <h2 className="text-base md:text-lg text-white text-center max-w-2xl opacity-90">
          Discover the natural goodness of our coconut-based products, crafted
          with care and sustainability in mind.
        </h2>
        <div className="flex gap-4">
          <Link
            to="product"
            className="mt-4 rounded-full bg-primary px-6 py-2 font-bold text-[#122118] hover:scale-105 transition"
          >
            Shop Now
          </Link>
          <Link
            to="about"
            className="mt-4 rounded-full border border-white px-6 py-2 font-bold text-white hover:bg-white hover:text-[#122118] transition"
          >
            Learn More
          </Link>
        </div>
      </motion.section>

      {/* About System Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="flex flex-col items-center gap-4 px-6 py-16 text-center"
      >
        <h2 className="text-3xl font-bold text-stone-800">Our System</h2>
        <p className="max-w-2xl text-base text-stone-600">
          At Coco Smart, we're passionate about bringing you the finest coconut
          products. Our system focuses on sustainable sourcing, ethical
          practices, and quality craftsmanship to ensure every product is a
          testament to nature's bounty.
        </p>
      </motion.section>

      {/* Featured Categories */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="py-12"
      >
        <h2 className="text-center text-3xl font-bold text-stone-800 mb-8">
          Featured Categories
        </h2>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-8">
          {[
            { name: "Coconut Water", img: "/img1.1.png" },
            { name: "Coconut Oil", img: "/img1.2.png" },
            { name: "Coconut Snacks", img: "/img1.3.png" },
            { name: "Coconut Milk", img: "/img1.4.png" },
          ].map((cat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="flex flex-col gap-3 items-center"
            >
              <div
                className="w-full aspect-square rounded-xl bg-cover bg-center shadow-lg"
                style={{
                  backgroundImage: `url(${cat.img})`,
                }}
              ></div>
              <p className="text-lg font-medium text-stone-800">{cat.name}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Sustainability Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="flex flex-col items-center gap-4 px-6 py-16 text-center bg-white rounded-xl shadow-md"
      >
        <h2 className="text-3xl font-bold text-stone-800">Sustainability</h2>
        <p className="max-w-2xl text-base text-stone-600">
          We're committed to preserving the planet. Our sustainable practices
          include eco-friendly packaging, responsible sourcing, and supporting
          local communities. Join us in making a difference, one coconut at a
          time.
        </p>
      </motion.section>

      {/* Testimonials Section 
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="py-16"
      >
        <h2 className="text-center text-3xl font-bold text-stone-800 mb-10">
          What Our Customers Say
        </h2>

        <Swiper
          spaceBetween={30}
          slidesPerView={1}
          autoplay={{ delay: 4000 }}
          loop={true}
        >
          {[
            {
              name: "Amal Perera",
              text: "The coconut oil I purchased was fresh and authentic. Truly the best I've ever used!",
            },
            {
              name: "Isuri Fernando",
              text: "Sustainability matters to me, and I love that CocoSmart cares for the environment.",
            },
            {
              name: "Gihan Silva",
              text: "Fast delivery, great packaging, and amazing taste. Will definitely order again!",
            },
          ].map((t, i) => (
            <SwiperSlide key={i}>
              <div className="max-w-2xl mx-auto text-center bg-white p-8 rounded-xl shadow-md">
                <p className="text-lg text-stone-700 italic mb-4">“{t.text}”</p>
                <h4 className="text-accent font-semibold">{t.name}</h4>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.section> */}
    </div>
  );
}
