import { Link, useNavigate } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi"; 
import { useEffect, useState } from "react";

export default function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // check token on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    navigate("/"); // redirect home after logout
  };

  return (
    <header className="flex items-center justify-between border-b border-stone-300 px-10 py-4 bg-[#f5f3f1]">
      
      {/* Logo */}
      <div className="flex flex-row items-center gap-2 text-accent">
        <img src="/clogo.png" alt="logo" className="h-15 rounded-md object-contain" />
        <h2 className="text-xl font-bold font-serif tracking-[-0.015em]">CocoSmart</h2>
      </div>

      {/* Navigation */}
      <nav className="flex gap-9 text-accent/90 text-sm font-bold space-x-1">
        <Link to="/">HOME</Link>
        <Link to="/product">SHOP</Link>
        <Link to="/about">ABOUT</Link>
        <Link to="/contact">CONTACT</Link>
      </nav>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        <Link
          to="/cart"
          className="flex items-center gap-2 rounded-full px-3 h-10 text-accent font-medium text-sm shadow-md hover:bg-stone-300 active:scale-95 transition-all duration-200 border border-accent"
        >
          <FiShoppingCart size={16} />
        </Link>

        {isLoggedIn ? (
          <>
            {/* Profile - visible only if logged in */}
            <Link
              to="/profile"
              className="px-5 h-9 flex items-center rounded-full bg-accent text-white font-medium text-[14px] shadow-md hover:bg-stone-300 hover:text-accent active:scale-95 transition-all duration-200"
            >
               Profile   
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="px-5 h-9 flex items-center rounded-full border border-accent text-accent font-medium text-sm shadow-sm hover:bg-accent hover:text-primary active:scale-95 transition-all duration-200"
            >
              Log Out
            </button>
          </>
        ) : (
          // Login - visible only if NOT logged in
          <Link
            to="/login"
            className="px-5 h-9 flex items-center rounded-full bg-accent text-white font-medium text-[14px] shadow-md hover:bg-stone-300 hover:text-accent active:scale-95 transition-all duration-200"
          >
            Log In
          </Link>
        )}
      </div>
    </header>
  );
}
