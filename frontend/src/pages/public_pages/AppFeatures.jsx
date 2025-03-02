import { motion } from "framer-motion";
import {
  FiEdit,
  FiImage,
  FiLink,
  FiLock,
  FiMic,
  FiPenTool,
  FiPlus,
  FiStar,
  FiUsers,
} from "react-icons/fi";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import {
  fadeIn,
  planetVariants,
  staggerContainer,
  textVariant,
} from "../../utils/motion";

const AppFeatures = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const navigate = useNavigate();

  const features = [
    {
      icon: <FiPlus />,
      title: "Unlimited Creation",
      text: "Add text, images, videos, PDFs, and doodle anywhere",
    },
    {
      icon: <FiStar />,
      title: "Smart Organization",
      text: "Favourite, sort, and search boards effortlessly",
    },
    {
      icon: <FiUsers />,
      title: "Real Collaboration",
      text: "Work with teams in real-time with version control",
    },
    {
      icon: <FiLock />,
      title: "Bank-grade Security",
      text: "Biometric login & military-grade encryption",
    },
  ];

  return (
    <motion.div
      ref={ref}
      variants={staggerContainer()}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className="bg-gradient-to-br from-neutral-50 to-blue-100 text-neutral-900 py-20 px-6"
    >
      {/* Hero Section */}
      <motion.div
        variants={textVariant(0.5)}
        className="max-w-7xl mx-auto text-center mb-20"
      >
        <motion.h1
          variants={fadeIn("up", "spring", 0.5, 1)}
          className="text-5xl font-bold mb-6"
        >
          Reimagine Creative Collaboration
        </motion.h1>
        <motion.p
          variants={fadeIn("up", "spring", 0.7, 1)}
          className="text-xl text-neutral-500 mb-12"
        >
          Your all-in-one digital canvas for ideas that stick
        </motion.p>
      </motion.div>

      {/* Interactive Feature Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-28">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={fadeIn("right", "spring", index * 0.2, 0.75)}
            whileHover={{ scale: 1.05 }}
            className="backdrop-blur-lg rounded-2xl p-8 hover:shadow-md border-2 bg-white border-neutral-200"
          >
            <div className="text-4xl mb-4 text-neutral-400">{feature.icon}</div>
            <h3 className="text-2xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-neutral-500">{feature.text}</p>
          </motion.div>
        ))}
      </div>

      {/* Content Creation Demo */}
      <motion.div
        variants={planetVariants("right")}
        className="max-w-7xl mx-auto mb-28"
      >
        <div className="relative bg-white rounded-3xl p-8 border border-white/20 backdrop-blur-xl">
          <motion.div
            animate={{ rotate: -2 }}
            transition={{ repeat: Infinity, repeatType: "mirror", duration: 5 }}
            className="absolute -top-6 -left-6 bg-cyan-500/90 text-white font-bold shadow-lg w-12 h-12 rounded-full flex items-center justify-center"
          >
            <FiPenTool className="text-2xl" />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <motion.div variants={textVariant(0.3)}>
                <h2 className="text-4xl font-bold mb-4 text-neutral-800">
                  Create Without Limits
                </h2>
                <p className="text-neutral-600 text-lg">
                  Drag, drop, and design your vision
                </p>
              </motion.div>

              <div className="space-y-6 text-neutral-500 flex flex-col ">
                {[
                  {
                    icon: <FiEdit />,
                    text: "Rich text editing with markdown support",
                  },
                  {
                    icon: <FiImage />,
                    text: "Image & video embedding from any source",
                  },
                  {
                    icon: <FiLink />,
                    text: "Smart link previews & bookmarking",
                  },
                  {
                    icon: <FiMic />,
                    text: "Voice memos with AI transcription",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    variants={fadeIn("right", "spring", index * 0.2, 0.75)}
                    className="flex items-center space-x-4"
                  >
                    <div className="text-neutaral-800 text-2xl">
                      {item.icon}
                    </div>
                    <p className="text-lg">{item.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl h-96 shadow-xl"
            >
              {/* Interactive Board Preview */}
              <div className="relative h-full">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute top-8 left-8 bg-white w-32 h-32 rounded-lg shadow-lg"
                />
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  className="absolute bottom-8 right-8 bg-white w-48 h-48 rounded-lg shadow-lg"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Collaboration Section */}
      <motion.div
        variants={fadeIn("up", "spring", 0.5, 1)}
        className="max-w-7xl mx-auto text-center mb-28"
      >
        <div className="inline-block relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />
          <div className="relative bg-white rounded-2xl p-12 border border-white/20 backdrop-blur-lg">
            <FiUsers className="text-6xl mx-auto mb-6 text-cyan-500" />
            <h3 className="text-3xl font-bold mb-4">Real-time Collaboration</h3>
            <p className="text-cyan-900/65 max-w-2xl mx-auto">
              Work simultaneously with your team, see cursor movements in
              real-time, and chat directly on the canvas.
            </p>
            <div className="flex justify-center space-x-4 mt-8">
              {[1, 2, 3, 4].map((item) => (
                <motion.div
                  key={item}
                  whileHover={{ y: -5 }}
                  className="w-12 h-12 bg-cyan-200 rounded-full"
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Pricing Section */}
      <motion.div
        variants={fadeIn("up", "spring", 0.5, 1)}
        className="max-w-7xl mx-auto text-center"
      >
        <h2 className="text-5xl font-bold mb-12">
          Flexible Plans for Everyone
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {["Starter", "Pro", "Enterprise"].map((plan, index) => (
            <motion.div
              key={plan}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl p-8 border border-neutral-100 backdrop-blur-lg hover:shadow-md hover:border-2"
            >
              <h3 className="text-2xl font-bold mb-4">{plan}</h3>
              <div className="text-4xl font-bold mb-6">
                {index === 0 ? "Free" : index === 1 ? "$9.99" : "Custom"}
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  `${index * 5 + 3} Boards`,
                  `${index * 10 + 5}GB Storage`,
                  `${index > 0 ? "Unlimited" : "Basic"} Collaboration`,
                  index > 0 ? "Premium Support" : "Community Support",
                ].map((item) => (
                  <li key={item} className="flex items-center space-x-2">
                    <FiPlus className="text-neutral-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate("/sign-up")}
                className="w-full py-3 rounded-lg text-cyan-200 bg-cyan-500 hover:bg-cyan-400 hover:text-white transition-colors"
              >
                Get Started
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AppFeatures;
