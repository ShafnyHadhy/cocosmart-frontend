// import { Link } from "react-router-dom";

// export default function Header() {
//   return (
//     <header className="w-full bg-sec-2 h-[100px] text-accent px-[30px]">
//       <div className="w-full h-full flex items-center justify-between">
//         <div className="flex items-center mt-10">
//           <img
//             src="CocoSmartLogo.png"
//             className="h-[150px] w-auto object-contain"
//           />
//         </div>

//         <nav className="flex gap-[30px] text-lg font-bold">
//           <Link to="/">Home</Link>
//           <Link to="/product">Product</Link>
//           <Link to="/about">About</Link>
//           <Link to="/contact">Contact Us</Link>
//         </nav>

//         <div className="flex gap-[10px] mr-8">
//           <Link
//             to="/feedback"
//             className="bg-green-600 text-white font-semibold px-5 py-2 rounded-[15px] shadow-lg hover:scale-105 transition-transform"
//           >
//             Feedback
//           </Link>
//           <Link
//             to="/user-profile"
//             className="bg-blue-500 text-white font-semibold px-5 py-2 rounded-[15px] shadow-lg hover:scale-105 transition-transform"
//           >
//             Profile
//           </Link>
//           <button className="bg-primary text-accent font-semibold px-5 py-2 rounded-[15px] shadow-lg hover:scale-105 transition-transform">
//             Sign Up
//           </button>
//           <button className="bg-accent text-white font-semibold px-5 py-2 rounded-[15px] shadow-lg hover:scale-105 transition-transform">
//             Sign In
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// }

import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="w-full bg-sec-2 h-[100px] text-accent px-[30px]">
      <div className="w-full h-full flex items-center justify-between">
        <div className="flex items-center mt-10">
          <img
            src="CocoSmartLogo.png"
            className="h-[150px] w-auto object-contain"
          />
        </div>

        <nav className="flex gap-[30px] text-lg font-bold">
          <Link to="/">Home</Link>
          <Link to="/product">Product</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/profile">Profile</Link>
        </nav>

        <div className="flex gap-[10px] mr-8">
          <Link
            to="/feedback"
            className="bg-green-600 text-white font-semibold px-5 py-2 rounded-[15px] shadow-lg hover:scale-105 transition-transform"
          >
            Feedback
          </Link>

          <Link
            to="/profile"
            className="bg-blue-500 text-white font-semibold px-5 py-2 rounded-[15px] shadow-lg hover:scale-105 transition-transform"
          >
            Profile
          </Link>

          <button className="bg-primary text-accent font-semibold px-5 py-2 rounded-[15px] shadow-lg hover:scale-105 transition-transform">
            Sign Up
          </button>
          <button className="bg-accent text-white font-semibold px-5 py-2 rounded-[15px] shadow-lg hover:scale-105 transition-transform">
            Sign In
          </button>
        </div>
      </div>
    </header>
  );
}
