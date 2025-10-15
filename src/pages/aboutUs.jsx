import { FaLeaf, FaUsers, FaChartLine, FaWarehouse, FaTruck, FaCommentDots } from "react-icons/fa";

export default function AboutUs() {
  return (
    <div className="bg-primary text-secondary">
      {/* Hero Section */}
      <section className="bg-accent text-white py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">About CocoSmart</h1>
        <p className="text-lg max-w-2xl mx-auto text-sec-2/90">
          Empowering the coconut industry through smart digital solutions — from plantation to marketplace.
        </p>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-3xl font-semibold mb-4 text-accent">Our Mission</h2>
          <p className="text-base leading-relaxed">
            To revolutionize coconut plantation management by integrating technology into every process —
            improving efficiency, transparency, and profitability for plantation owners, laborers, and buyers alike.
          </p>
        </div>
        <div>
          <h2 className="text-3xl font-semibold mb-4 text-accent">Our Vision</h2>
          <p className="text-base leading-relaxed">
            To become Sri Lanka’s most trusted and intelligent digital platform for coconut cultivation,
            trade, and sustainable agriculture management.
          </p>
        </div>
      </section>

      {/* Subsystems Section */}
      <section className="bg-sec-2 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-10 text-accent">Our Core Subsystems</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: <FaLeaf />, title: "Plantation Management", desc: "Monitor growth, track yields, and manage resources smartly." },
              { icon: <FaWarehouse />, title: "Inventory Management", desc: "Efficiently manage fertilizer, tools, and product storage." },
              { icon: <FaTruck />, title: "Marketplace & Finance", desc: "Sell coconuts directly and manage revenue with transparency." },
              { icon: <FaUsers />, title: "Labor & Workforce", desc: "Coordinate daily tasks, track attendance, and ensure fair payments." },
              { icon: <FaCommentDots />, title: "Feedback & Support", desc: "Bridge communication between farmers, buyers, and administrators." },
              { icon: <FaChartLine />, title: "AI & Analytics", desc: "Gain insights from real-time data and predictive trends." },
            ].map((s, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition">
                <div className="text-accent text-4xl mb-4 flex justify-center">{s.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-secondary/80">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section className="max-w-6xl mx-auto py-16 px-6">
        <h2 className="text-3xl font-semibold mb-8 text-accent text-center">Our Core Values</h2>
        <div className="grid md:grid-cols-3 gap-10 text-center">
          <div>
            <h3 className="text-xl font-semibold mb-2 text-accent">Innovation</h3>
            <p className="text-sm">We embrace digital transformation to enhance coconut cultivation efficiency.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-accent">Sustainability</h3>
            <p className="text-sm">Our platform supports eco-friendly and ethical plantation practices.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-accent">Community</h3>
            <p className="text-sm">We empower farmers, traders, and workers through connectivity and transparency.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
