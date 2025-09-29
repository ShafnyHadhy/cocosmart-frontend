import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { FaTree, FaRobot, FaUsersCog, FaBoxes, FaTruck, FaStore } from "react-icons/fa";

export default function FeaturesCarousel() {
  const features = [
    {
      icon: <FaTree className="text-4xl text-green-700" />,
      title: "Plantation Management",
      description:
        "Manage your coconut plantations from planting to harvesting with smart monitoring and analytics.",
    },
    {
      icon: <FaRobot className="text-4xl text-green-700" />,
      title: "AI Chatbot",
      description:
        "Get instant guidance about best practices in coconut cultivation, care, and productivity improvements.",
    },
    {
      icon: <FaUsersCog className="text-4xl text-green-700" />,
      title: "Labour Scheduling",
      description:
        "Effortlessly assign and track tasks for your workforce, ensuring efficiency and accountability.",
    },
    {
      icon: <FaBoxes className="text-4xl text-green-700" />,
      title: "Inventory Management",
      description:
        "Keep track of stock levels, receive low-stock alerts, and optimize your resources in real-time.",
    },
    {
      icon: <FaTruck className="text-4xl text-green-700" />,
      title: "Transport Coordination",
      description:
        "Plan, manage, and track transport for your produce to ensure timely delivery and reduced costs.",
    },
    {
      icon: <FaStore className="text-4xl text-green-700" />,
      title: "Marketplace Integration",
      description:
        "Sell your products directly through our online marketplace with secure order and payment management.",
    },
  ];

  return (
    <section className="bg-primary py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Powerful Features for Smarter Plantation Management
        </h2>

        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          spaceBetween={30}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {features.map((feature, index) => (
            <SwiperSlide key={index}>
              <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-xl transition">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
