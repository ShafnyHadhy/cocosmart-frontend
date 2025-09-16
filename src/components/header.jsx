import { Link } from "react-router-dom";
import { FiSearch, FiShoppingCart } from "react-icons/fi"; 

export default function Header() {
  return (
    <header className="flex items-center justify-between border-b border-stone-200 px-10 py-3 bg-[#f5f3f1]">
      
      <div className="flex items-center gap-3 text-accent">
        <div className="h-8 w-9 bg-accent rounded-full flex items-center justify-center text-white font-bold">
          C
        </div>
        <h2 className="text-lg font-bold tracking-[-0.015em]">CocoSmart</h2>
      </div>

      <nav className="flex gap-9 text-accent text-sm font-medium">
        <Link to="/">HOME</Link>
        <Link to="/product">PRODUCTS</Link>
        <Link to="/about">ABOUT</Link>
        <Link to="/contact">CONTACT</Link>
      </nav>

      <div className="flex items-center gap-3">
        <button className="flex h-10 w-10 items-center justify-center rounded-full text-accent hover:bg-stone-300 transition-colors duration-200">
          <FiSearch size={19} />
        </button>

        <button className="flex items-center gap-2 rounded-full px-3 h-9 text-accent font-medium text-sm shadow-md hover:bg-stone-300 active:scale-95 transition-all duration-200">
          <FiShoppingCart size={17} />
          
        </button>

        {
          /*
          <Link
            to="/signup"
            className="px-4 h-9 flex items-center rounded-full border border-accent text-accent font-medium text-sm shadow-sm hover:bg-accent hover:text-primary active:scale-95 transition-all duration-200"
          >
            Sign Up
          </Link>
          */
        }
        
        <Link
          to="/login"
          className="px-4 h-9 flex items-center rounded-full bg-accent text-white font-medium text-sm shadow-md hover:bg-stone-300 hover:text-accent active:scale-95 transition-all duration-200"
        >
          LOG IN
        </Link>
      </div>
    </header>
  );
}
