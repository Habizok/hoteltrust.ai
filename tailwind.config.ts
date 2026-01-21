import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1A73E8",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#D4AF37",
          foreground: "#101828",
        },
        background: "#FAFAFA",
        foreground: "#101828",
        border: "#E4E7EC",
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
