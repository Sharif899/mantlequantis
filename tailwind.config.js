/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mantle: {
          purple: "#7F77DD",
          "purple-light": "#EEEDFE",
          "purple-dark": "#3C3489",
          teal: "#1D9E75",
          "teal-light": "#E1F5EE",
          coral: "#D85A30",
          bg: "#0D0D14",
          card: "#13131F",
          border: "#1E1E30",
          muted: "#6B6B8A",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};
