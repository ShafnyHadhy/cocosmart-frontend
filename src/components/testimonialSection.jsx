import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";

export default function TestimonialSection() {
  const testimonials = [
    {
      name: "Ahamed Rizvi",
      role: "Plantation Owner",
      feedback:
        "CocoSmart completely transformed how I manage my coconut farm. From labor scheduling to inventory, everything is now effortless.",
      image: "/user1.jpg",
      rating: 5,
    },
    {
      name: "Isuri Perera",
      role: "Entrepreneur",
      feedback:
        "The marketplace feature made it so easy to connect with buyers. My sales improved significantly within just a month!",
      image: "/user2.jpg",
      rating: 5,
    },
    {
      name: "Gihan Fernando",
      role: "Farm Manager",
      feedback:
        "The AI chatbot gives me instant plantation advice - it feels like having an expert available 24/7. Highly recommend CocoSmart!",
      image: "/user3.jpg",
      rating: 4,
    },
  ];

  return (
    <section className="py-20 px-6 md:px-12 lg:px-24 bg-gradient-to-b from-white to-[#f5f3f1]">
      <div className="text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-extrabold text-gray-800"
        >
          What Our Clients Say
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto"
        >
          Trusted by farmers, entrepreneurs, and plantation managers across Sri Lanka.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.2 }}
            viewport={{ once: true }}
            className="p-6 rounded-xl shadow-lg bg-white/80 backdrop-blur-md hover:shadow-xl transition flex flex-col items-center text-center"
          >
            <img
              src={t.image}
              alt={t.name}
              className="w-20 h-20 rounded-full object-cover mb-4 border-4 border-accent"
            />
            <h3 className="text-lg font-semibold text-gray-800">{t.name}</h3>
            <p className="text-sm text-gray-500 mb-2">{t.role}</p>
            <div className="flex justify-center mb-3">
              {Array.from({ length: t.rating }).map((_, idx) => (
                <FaStar key={idx} className="text-yellow-400" />
              ))}
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{t.feedback}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
