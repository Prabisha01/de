import React, { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-b from-white to-gray-100 text-black py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex cursor-pointer hover:scale-110 transition-transform duration-300"
          onClick={() => navigate("/")}
        >
          <img
            src="/src/assets/logo/logo.svg"
            alt="Logo"
            className="h-12 w-12 -mt-8"
          />
        </div>

        {/* Links for Desktop */}
        <ul className="hidden md:flex space-x-10 text-xl">
          <li
            className="cursor-pointer hover:text-gray-500 transition-colors duration-100"
            onClick={() => navigate("/features")}
          >
            Features
          </li>
          <li
            className="cursor-pointer hover:text-gray-500 transition-colors duration-100"
            onClick={() => navigate("/pricing")}
          >
            Pricing
          </li>
          <li
            className="cursor-pointer hover:text-gray-500 transition-colors duration-300"
            onClick={() => navigate("/contact")}
          >
            Contact
          </li>
        </ul>

        {/* Action Buttons for Desktop */}
        <div className="hidden md:flex space-x-4">
          <button
            onClick={() => navigate("/sign-in")}
            className="py-2 px-4 rounded border-2 text-logo shadow-xs hover:scale-105 transition-all duration-300"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/sign-up")}
            className="py-2 px-4 rounded bg-gray-900 text-white hover:scale-105 transition-all duration-300"
          >
            Sign up
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="bg-primary text-black md:hidden flex flex-col space-y-4 px-4 py-4">
          <ul className="space-y-4 text-lg">
            <li
              className="cursor-pointer hover:font-bold transition-colors duration-300"
              onClick={() => {
                navigate("/features");
                setMobileMenuOpen(false);
              }}
            >
              Features
            </li>
            <li
              className="cursor-pointer hover:text-gray-500 transition-colors duration-300"
              onClick={() => {
                navigate("/about");
                setMobileMenuOpen(false);
              }}
            >
              About
            </li>
            <li
              className="cursor-pointer hover:text-gray-500 transition-colors duration-300"
              onClick={() => {
                navigate("/pricing");
                setMobileMenuOpen(false);
              }}
            >
              Pricing
            </li>
            <li
              className="cursor-pointer hover:text-gray-500 transition-colors duration-300"
              onClick={() => {
                navigate("/contact");
                setMobileMenuOpen(false);
              }}
            >
              Contact
            </li>
          </ul>
          <div className="flex flex-col space-y-4">
            <button
              onClick={() => {
                navigate("/sign-in");
                setMobileMenuOpen(false);
              }}
              className="py-2 px-4 rounded border-2 text-logo shadow-xs transition-all duration-300"
            >
              Login
            </button>
            <button
              onClick={() => {
                navigate("/sign-up");
                setMobileMenuOpen(false);
              }}
              className="py-2 px-4 rounded bg-logo text-white hover:bg-neutral-500 hover:scale-105 transition-all duration-300"
            >
              Sign up
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
