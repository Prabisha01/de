import { motion } from "framer-motion";
import { FiCheckCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { fadeIn, staggerContainer, textVariant } from "../../utils/motion";

const pricingPlans = [
  {
    name: "Starter",
    price: "Free",
    features: [
      "3 Boards",
      "5GB Storage",
      "Basic Collaboration",
      "Community Support",
    ],
  },
  {
    name: "Pro",
    price: "$4.99/mo",
    features: [
      "+5 Boards ",
      "10GB Storage",
      "Unlimited Collaboration",
      "Priority Support",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom Pricing",
    features: [
      "Unlimited Boards",
      "100GB Storage",
      "Enterprise Collaboration",
      "Dedicated Support",
    ],
  },
];

const PricingPage = () => {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate("/sign-up");
  };
  return (
    <motion.div
      variants={staggerContainer()}
      initial="hidden"
      animate="show"
      className="bg-gradient-to-br from-neutral-50 to-blue-100 text-neutral-800 py-20 px-6 h-screen"
    >
      <motion.div
        variants={textVariant(0.5)}
        className="max-w-7xl mx-auto text-center mb-16"
      >
        <motion.h1
          variants={fadeIn("up", "spring", 0.5, 1)}
          className="text-5xl font-bold mb-6"
        >
          Choose Your Plan
        </motion.h1>
        <motion.p
          variants={fadeIn("up", "spring", 0.7, 1)}
          className="text-xl text-neutral-500"
        >
          Flexible pricing options for creators and teams of all sizes
        </motion.p>
      </motion.div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {pricingPlans.map((plan, index) => (
          <motion.div
            key={index}
            variants={fadeIn("up", "spring", index * 0.2, 0.75)}
            whileHover={{ scale: 1.05 }}
            className="bg-white backdrop-blur-lg rounded-2xl p-8 border hover:border-2 text-center"
          >
            <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
            <div className="text-4xl font-bold mb-6">{plan.price}</div>
            <ul className="space-y-4 mb-8 text-neutral-500">
              {plan.features.map((feature, i) => (
                <li
                  key={i}
                  className="flex items-center justify-center space-x-2 "
                >
                  <FiCheckCircle className="text-green-400" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={handleButtonClick}
              className="w-full py-3 rounded-lg text-cyan-900 hover:text-white bg-cyan-500 hover:bg-cyan-400 transition-colors"
            >
              Get Started
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default PricingPage;
