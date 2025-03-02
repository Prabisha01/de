/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#F6F6F6",
        secondary: "#ECECEC",
        logo: "#0E0700"
      },
      fontFamily: {
        sans: ["Poppins", "Arial", "sans-serif"], // Add Poppins as the default sans font
      },
    },
  },
  plugins: [require("daisyui")],
};


