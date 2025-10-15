import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";

export default function ContactUs() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Your message has been sent successfully!");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="bg-primary min-h-screen text-secondary">
      {/* Hero Section */}
      <section className="bg-accent text-white py-20 px-6 text-center relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
          <p className="max-w-2xl mx-auto text-lg opacity-90">
            Have questions, ideas, or partnership proposals? Let’s talk.
          </p>
        </motion.div>
      </section>

      {/* Contact Section */}
      <section className="max-w-6xl mx-auto py-16 px-6 grid md:grid-cols-2 gap-12">
        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-semibold text-accent">Get In Touch</h2>
          <p className="text-gray-700 leading-relaxed">
            We’re here to help you grow smarter. Contact our support team or connect with us on social platforms.
          </p>

          <div className="space-y-3 text-gray-700">
            <p><strong>📍 Address:</strong> 123 Green Field Road, Colombo, Sri Lanka</p>
            <p><strong>📞 Phone:</strong> +94 77 123 4567</p>
            <p><strong>📧 Email:</strong> support@cocosmart.com</p>
          </div>

          <div className="flex gap-4 pt-2">
            <FaFacebook className="text-accent text-2xl cursor-pointer hover:text-[#1f3f30]" />
            <FaInstagram className="text-accent text-2xl cursor-pointer hover:text-[#1f3f30]" />
            <FaLinkedin className="text-accent text-2xl cursor-pointer hover:text-[#1f3f30]" />
          </div>

          <iframe
            title="CocoSmart Map"
            src="https://maps.google.com/maps?q=Colombo,%20Sri%20Lanka&t=&z=12&ie=UTF8&iwloc=&output=embed"
            className="w-full h-56 rounded-2xl border border-gray-300 mt-4"
          ></iframe>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          onSubmit={handleSubmit}
          className="bg-sec-2 p-8 rounded-2xl shadow-md border border-gray-100 space-y-6"
        >
          <h2 className="text-xl font-semibold text-accent">Send us a Message</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full p-3 border rounded-lg border-gray-300 focus:ring-1 focus:ring-accent outline-none"
              placeholder="Your Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full p-3 border rounded-lg border-gray-300 focus:ring-1 focus:ring-accent outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              className="w-full p-3 border rounded-lg border-gray-300 focus:ring-1 focus:ring-accent outline-none h-32 resize-none"
              placeholder="Type your message..."
            ></textarea>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="reset"
              className="px-4 py-2 rounded-lg border border-accent text-accent hover:bg-accent hover:text-white transition"
              onClick={() => setFormData({ name: "", email: "", message: "" })}
            >
              Clear
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-accent text-white hover:bg-[#1f3f30] transition"
            >
              Send Message
            </button>
          </div>
        </motion.form>
      </section>
    </div>
  );
}
