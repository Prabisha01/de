import axios from "axios";
import { motion } from "framer-motion";
import React, { useState } from "react";
import { FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import AppLogo from "../components/shared/AppLogo";
import InputField from "../components/shared/InputField";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user"); // Default role is "user"
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/v1/users/register",
        { username, email, password, role }, // Include role in request
        { headers: { "Content-Type": "application/json" } }
      );

      localStorage.setItem("token", data.token);
      Swal.fire({
        icon: "success",
        title: "Registration Successful",
        text: "You will be redirected to login.",
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => navigate("/sign-in"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="flex flex-col justify-center md:flex-row overflow-hidden"
    >
      <div className="flex flex-col justify-center md:flex-row overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-[300px] h-[300px] bg-cyan-blue-800/20 rounded-full blur-3xl -top-32 -left-32 animate-blob"></div>
          <div className="absolute w-[300px] h-[300px] bg-blue-500/25 rounded-full blur-3xl top-1/2 -right-32 animate-blob animation-delay-2000"></div>
          <div className="absolute w-[300px] h-[300px] bg-cyan-600/20 rounded-full blur-3xl -bottom-32 left-1/4 animate-blob animation-delay-4000"></div>
        </div>
        <div className="flex items-center justify-center space-x-6">
          <AppLogo />
          <h1 className="text-3xl md:text-5xl font-bold text-black">
            Get Started Now
          </h1>
        </div>

        <motion.div
          variants={fadeInUp}
          className="flex z-10 bg-white/25 flex-col justify-center items-start p-8 md:px-20 backdrop:blur-md rounded-md"
        >
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md space-y-4 bg-white/65 p-2 rounded-md"
          >
            {/* Error Message */}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <InputField
              placeholder="Enter your username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <InputField
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <InputField
              placeholder="Enter your password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <InputField
              placeholder="Re-enter your password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {/* Admin Selection Dropdown */}
            <div className="w-full">
              <label htmlFor="role" className="block text-sm text-gray-600">
                Select Role:
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-b-4"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" id="terms" className="w-4 h-4" required />
              <label htmlFor="terms" className="text-sm text-gray-500">
                I agree to the terms & policy
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-neutral-800"
            >
              Signup
            </button>

            <div className="text-center mt-6 rounded-lg">
              <p className="text-gray-500 text-sm mb-4">Or</p>
              <div className="flex justify-center space-x-4">
                {/* Conditionally render based on screen size */}
                {window.innerWidth > 768 ? ( // Example breakpoint for small screens
                  <>
                    <button className="flex items-center bg-neutral-100 hover:shadow p-4 rounded-lg">
                      <FcGoogle />
                      <span className="ml-2 text-sm">Sign in with Google</span>
                    </button>
                    <button className="flex items-center bg-neutral-100 hover:shadow p-4 rounded-lg">
                      <FaApple />
                      <span className="ml-2 text-sm">Sign in with Apple</span>
                    </button>
                  </>
                ) : (
                  <div className="flex items-center justify-center">
                    {/* Only show logo here */}
                    <img
                      src="/path-to-your-logo.png"
                      alt="Logo"
                      className="h-12 w-auto"
                    />
                  </div>
                )}
              </div>
              <p className="mt-6 text-gray-500">
                Have an account?{" "}
                <span
                  onClick={() => navigate("/sign-in")}
                  className="text-black font-semibold px-2 cursor-pointer"
                >
                  Sign In
                </span>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RegisterPage;
