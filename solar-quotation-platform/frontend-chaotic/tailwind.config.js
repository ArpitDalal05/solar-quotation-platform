/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        solar: {
          blue: "#0ea5e9",
          green: "#10b981",
        },
        customer: {
          amber: "#f59e0b",
          orange: "#ea580c",
        },
      },
    },
  },
  plugins: [],
};

