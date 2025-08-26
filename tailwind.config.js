/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
      },
      colors: {
        crimsonRed: "#be202e",
        deepBlue: "#083970",
        textBlue: "#1d4699",
        textRed: "#af222f",
      },
    },
  },
  plugins: [],
};
