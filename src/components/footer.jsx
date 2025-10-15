import { FaFacebook, FaLinkedin, FaTwitter } from "react-icons/fa";
import { IoCall } from "react-icons/io5";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-accent text-sec-2">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-10">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <img src="/clogo.png" alt="CocoSmart Logo" className="w-12 h-12" />
              <h1 className="text-2xl font-bold text-white">CocoSmart Pvt Ltd.</h1>
            </div>
            <p className="text-tertiary text-sm">Smart Solutions for Coconut Plantations</p>
            <div className="text-sec-2/90 text-sm space-y-1 mt-3">
              <p>123 Coconut Street, Kurunegala, Sri Lanka</p>
              <p>Email: info@cocosmart.com</p>
              <p className="flex items-center gap-2">
                <IoCall className="text-md" /> +94 77 123 4567
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-16">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-white">About</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-tertiary transition-colors">Our Story</Link></li>
                <li><a href="#" className="hover:text-tertiary transition-colors">Sustainability</a></li>
                <li><a href="#" className="hover:text-tertiary transition-colors">Recipes</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 text-white">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/contact" className="hover:text-tertiary transition-colors">Contact Us</Link></li>
                <li><a href="#" className="hover:text-tertiary transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-tertiary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-tertiary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-base font-semibold mb-2">We value your feedback!</p>
            <Link
              to="/feedback"
              className="bg-white text-accent font-semibold py-2 px-5 rounded-md 
              border border-transparent hover:bg-transparent hover:text-white 
              hover:border-white transition-colors duration-300 text-center"
            >
              Give Feedback
            </Link>
          </div>
        </div>

        <div className="border-t border-white/30"></div>

        <div className="flex flex-col md:flex-row justify-between items-center text-sm gap-4">
          <div className="flex gap-5 text-white text-xl">
            <Link to="#" className="hover:text-tertiary transition-colors"><FaLinkedin /></Link>
            <Link to="#" className="hover:text-tertiary transition-colors"><FaFacebook /></Link>
            <Link to="#" className="hover:text-tertiary transition-colors"><FaTwitter /></Link>
          </div>
          <p className="text-sec-2/90">© 2025 CocoSmart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
