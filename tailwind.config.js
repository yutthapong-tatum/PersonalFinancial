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
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Custom Color Theme requested by User:
        profit: {
          light: "#D1E7DD",
          text: "#0F5132",
          bg: "#E8F5E9",
          badge: "#10B981"
        },
        loss: {
          light: "#F8D7DA",
          text: "#842029",
          bg: "#FFEBEE",
          badge: "#EF4444"
        },
        hold: {
          light: "#E2E3E5",
          text: "#383D41",
          bg: "#F3F4F6",
          badge: "#6B7280"
        }
      },
    },
  },
  plugins: [],
};
