/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10212b",
        mist: "#eef5f7",
        signal: "#1c8c7d",
        road: "#f4b942",
      },
    },
  },
  plugins: [],
};
