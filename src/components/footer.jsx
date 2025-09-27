import { FaFacebook, FaLinkedin, FaTwitter } from "react-icons/fa";
import { IoCall } from "react-icons/io5";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="flex justify-center bg-[#cacaca] text-accent">
      <div className="flex w-full flex-1 flex-col">
        <div className="flex flex-col gap-10 px-5 py-10">

          {/* Top Section: Company Info | About+Support */}
          <div className="flex flex-row justify-between mx-20">

            {/* Company Info */}
            <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
              <img src="/clogo.png" alt="CocoSmart Logo" className="w-16 h-16" />
              <h1 className="text-2xl font-bold">CocoSmart Pvt Ltd.</h1>
              <p className="text-sm mb-5">Smart Solutions for Coconut Plantations</p>
              <p className="text-sm ">123 Coconut Street, Kurunegala, Sri Lanka</p>
              <p className="text-sm ">Email: info@cocosmart.com</p>
              <p className="flex items-center gap-2 text-sm">
                <IoCall className="text-lg" />
                +94 77 123 4567
              </p>
            </div>

            {/* About + Support + Feedback */}
            <div className="flex flex-col items-center md:items-start gap-6">

              {/* About & Support */}
              <div className="flex flex-col md:flex-row gap-10">

                {/* About */}
                <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
                  <h3 className="text-sm font-bold text-stone-800">About</h3>
                  <a className="text-base" href="#">Our Story</a>
                  <a className="text-base" href="#">Sustainability</a>
                  <a className="text-base" href="#">Recipes</a>
                </div>

                {/* Support */}
                <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
                  <h3 className="text-sm font-bold text-stone-800">Support</h3>
                  <a className="text-base" href="#">Contact Us</a>
                  <a className="text-base" href="#">FAQ</a>
                  <a className="text-base" href="#">Privacy Policy</a>
                  <a className="text-base" href="#">Terms of Service</a>
                </div>

              </div>

              {/* Feedback Button below About & Support */}
              <div className="flex justify-center md:justify-start items-center gap-5 mt-4">
                <label className="text-md font-bold">We value your feedback!</label>
                <Link
                to="/feedback"
                className="bg-white/70 hover:bg-transparent text-secondary 
                          border border-accent hover:border-accent 
                          font-semibold py-3 px-6 rounded-md shadow transition-colors"
              >
                Give Feedback
              </Link>
              </div>

            </div>
          </div>

          {/* Social Icons & Copyright */}
          <div className="flex flex-col items-center gap-4 mt-5">
            <div className="flex justify-center gap-6 text-stone-800">
              <Link to="#" className="hover:text-white transition-colors text-xl">
                <FaLinkedin />
              </Link>
              <Link to="#" className="hover:text-white transition-colors text-xl">
                <FaFacebook />
              </Link>
              <Link to="#" className="hover:text-white transition-colors text-xl">
                <FaTwitter />
              </Link>
            </div>
            <p className="text-center text-base">
              © 2025 CocoSmart. All rights reserved.
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
