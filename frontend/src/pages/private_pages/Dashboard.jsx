import axios from "axios";
import { motion } from "framer-motion";
import React, { createContext, useContext, useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { MdLogout, MdNotes } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import KanbanBoard from "../../components/specific/KanbanBoardUI";
import { AuthContext } from "../../context/AuthContext"; // Import AuthContext

// Create a context for notebook actions
const NotebookContext = createContext();

const Dashboard = () => {
  const [name, setName] = useState("");
  const { logout, user } = useContext(AuthContext);
  // Get user info & logout function
  const navigate = useNavigate();
  // Dashboard.jsx
  const [isFreePlan, setIsFreePlan] = useState(true);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchUserPlan = async () => {
      try {
        setLoadingSubscription(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/v1/users/subscription",
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }
        );

        setIsFreePlan(response.data.data.plan === "free");
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("Subscription error:", error);
          setIsFreePlan(true); // Fallback to free plan
        }
      } finally {
        setLoadingSubscription(false);
      }
    };

    fetchUserPlan();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Retrieve the token from localStorage
        const token = localStorage.getItem("token");

        if (!token) {
          console.log("No token found!");
          return; // You can handle redirect to login page here
        }

        // Send the token in the Authorization header
        const response = await axios.get(
          "http://localhost:5000/api/v1/users/getMe",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setName(response.data.data.username); // Set the username from the response
      } catch (error) {
        console.error(
          "Error fetching user data:",
          error.response.data.message || error.message
        );
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="flex bg-gray-50 h-screen">
      {/* Sidebar */}
      <aside className="bg-black text-white w-16 md:w-20 flex flex-col items-center py-6">
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="h-12 w-12 flex items-center justify-center">
            <img
              src="/src/assets/logo/logo.svg"
              alt="Logo"
              className="h-12 w-12"
            />
          </div>
        </motion.div>
        <motion.nav
          className="flex flex-col space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <FaUserCircle
            className="text-xl md:text-2xl cursor-pointer"
            onClick={() => navigate("/profile")}
          />
          <MdNotes className="text-xl md:text-2xl cursor-pointer" />
          <div className="flex-grow"></div>

          {/* Logout Button */}
          <motion.button
            className="text-xl md:text-2xl cursor-pointer hover:text-red-500 transition-all"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            <MdLogout />
          </motion.button>
        </motion.nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col">
        {/* Header */}
        <motion.header
          className="flex justify-between items-center px-6 py-4 bg-gradient-to-b from-white to-gray-50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-4xl ">
            <div className="flex space-x-3 pt-4 text-gray-500">
              <span>Hey</span>
              <span className="font-bold text-black">{name}! </span>
              <span>What's New Today?</span>
            </div>
          </div>
        `</motion.header>

        {/* Content */}
        <div className="flex flex-col md:flex-row flex-grow justify-between">
          {/* Left Panel */}
          <div className="flex flex-col p-4 space-y-4 w-full md:w-2/2">
            <KanbanBoard />
          </div>

          {/* Right Panel */}
          <motion.div
            className="bg-neutral-900 text-white flex flex-col justify-center items-center p-6 md:w-1/4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {loadingSubscription ? (
              <div className="text-gray-300">
                Loading subscription status...
              </div>
            ) : isFreePlan ? (
              // Show Upgrade to Premium Panel
              <>
                <h2 className="text-xl m-4 text-center font-semibold text-neutral-200">
                  Unlock Premium Features!
                </h2>
                <p className="text-center text-gray-300 mb-2">
                  Upgrade to premium and get unlimited boards, exclusive
                  features, and more.
                </p>
                <div className="bg-transparent w-full p-4 h-64 rounded flex items-center justify-center">
                  <img
                    src="/src/assets/images/upgrade.svg"
                    alt="Upgrade to Premium"
                  />
                </div>
                <motion.button
                  className="mt-4 px-6 py-2 bg-amber-400 text-white font-semibold rounded-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/pricing")} // Navigate to pricing page
                >
                  Upgrade Now
                </motion.button>
              </>
            ) : (
              // Show Normal Community Panel
              <>
                <h2 className="text-xl m-4 text-center">
                  Notes Sharing <br />
                  Join the Community!
                </h2>
                <div className="bg-transparent w-full p-4 h-64 rounded">
                  <img
                    src="/src/assets/images/signup-picture.png"
                    alt="Community"
                  />
                </div>
                <motion.button
                  className="mt-4 px-6 py-2 bg-white text-black rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Learn More
                </motion.button>
              </>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
