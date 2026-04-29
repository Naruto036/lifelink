import { Link, useLocation } from "react-router-dom";
import { Heart } from "lucide-react";

export default function Navbar() {
  const location = useLocation();

  const navItem = (path, name) => (
    <Link
      to={path}
      className={`px-4 py-2 rounded-lg font-semibold transition ${
        location.pathname === path
          ? "bg-red-600 text-white"
          : "text-gray-700 hover:bg-red-100"
      }`}
    >
      {name}
    </Link>
  );

  return (
    <div className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
        
        {/* Logo */}
        <div className="flex items-center gap-2 text-red-600 font-bold text-xl">
          <Heart /> LifeLink
        </div>

        {/* Menu */}
        <div className="flex gap-3">
          {navItem("/", "Home")}
          {navItem("/search", "Find Donor")}
          {navItem("/register", "Become Donor")}
          {navItem("/dashboard", "Dashboard")}
        </div>
      </div>
    </div>
  );
}