import { motion } from "framer-motion";
import React from "react";
import {
  FiCloud,
  FiEdit,
  FiFolder,
  FiShield,
  FiSmartphone,
  FiZap,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FiZap />,
      title: "Fast",
      text: "Instant note saving with cloud sync",
    },
    {
      icon: <FiShield />,
      title: "Security",
      text: "End-to-end encryption for all your notes",
    },
    {
      icon: <FiFolder />,
      title: "Smart Organization",
      text: "Automatic tagging and folder system",
    },
    {
      icon: <FiEdit />,
      title: "Rich Editing",
      text: "Markdown support & media embedding",
    },
    {
      icon: <FiSmartphone />,
      title: "Multi-device",
      text: "Seamless cross-platform experience",
    },
    {
      icon: <FiCloud />,
      title: "Sync",
      text: "Automatic backup to secure cloud",
    },
  ];

  return (
    <div className="overflow-x-hidden bg-gradient-to-b from-gray-100 to-blue-50 min-h-screen relative">
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-[90vh] text-center px-6 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-600 to-blue-400 bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Capture Your Ideas with
            <br />
            <span className="text-neutral-900">Vignette</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Your thoughts, organized beautifully. A modern note-taking
            experience that adapts to your workflow.
          </motion.p>

          <motion.div
            className="flex gap-4 justify-center flex-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <button
              onClick={() => navigate("/sign-up")}
              className="py-4 px-8 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-200"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => navigate("/features")}
              className="py-4 px-8 border-2 border-neutral-800 text-neutral-700 rounded-lg font-medium transition-all transform hover:scale-105 hover:bg-blue-50"
            >
              Explore Features
            </button>
          </motion.div>
        </motion.div>

        {/* Animated Background Elements */}
        <motion.div
          className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-cyan-100 blur-3xl opacity-50"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-800"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            Why Choose Vignette?
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="text-blue-900 text-4xl mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-2 text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-neutral-900 text-white">
        <motion.div
          className="max-w-4xl mx-auto text-center px-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Note-taking?
          </h2>
          <p className="text-xl text-neutral-300 mb-12 max-w-2xl mx-auto">
            Join us to organize your ideas with
            <span className="font-bold px-2">Vignette</span>
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/sign-up")}
            className="py-4 px-12 bg-white text-blue-800 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            Get Started Free
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;
