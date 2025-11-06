import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Menu, X } from "lucide-react"; // ✅ hamburger & close icons

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  return (
    <nav className="bg-white shadow-md py-3 px-6 flex justify-between items-center sticky top-0 z-50">
      {/* Left side - Logo */}
      <Link
        to="/dashboard"
        className="text-xl font-bold text-indigo-600 hover:text-indigo-700"
      >
        TimeTracker
      </Link>

      {/* Hamburger button (mobile) */}
      <button
        className="sm:hidden text-gray-700 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={26} /> : <Menu size={26} />}
      </button>

      {/* Center navigation (desktop) */}
      <div className="hidden sm:flex gap-6 font-medium text-gray-700">
        <Link
          to="/dashboard"
          className="hover:text-indigo-600 transition duration-200"
        >
          Dashboard
        </Link>
        <Link
          to="/jobs"
          className="hover:text-indigo-600 transition duration-200"
        >
          Jobs
        </Link>
        <Link
          to="/time-tracker"
          className="hover:text-indigo-600 transition duration-200"
        >
          Time Tracker
        </Link>
      </div>

      {/* Right side - user + logout */}
      <div className="hidden sm:flex items-center gap-4">
        {user && (
          <span className="text-sm text-gray-600">{user.email}</span>
        )}
        <button
          onClick={handleLogout}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition"
        >
          Logout
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {isOpen && (
        <div className="absolute top-14 left-0 w-full bg-white shadow-lg sm:hidden flex flex-col items-center py-4 space-y-3">
          <Link
            to="/dashboard"
            onClick={() => setIsOpen(false)}
            className="text-gray-700 hover:text-indigo-600"
          >
            Dashboard
          </Link>
          <Link
            to="/jobs"
            onClick={() => setIsOpen(false)}
            className="text-gray-700 hover:text-indigo-600"
          >
            Jobs
          </Link>
          <Link
            to="/time-tracker"
            onClick={() => setIsOpen(false)}
            className="text-gray-700 hover:text-indigo-600"
          >
            Time Tracker
          </Link>
          {user && (
            <span className="text-gray-500 text-sm">{user.email}</span>
          )}
          <button
            onClick={() => {
              handleLogout();
              setIsOpen(false);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
