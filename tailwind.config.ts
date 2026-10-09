import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        meadow: { 50: "#F6FAF1", 100: "#EAF3E0", 200: "#D7E8C5", 300: "#BCD7A1" },
        forest: { 500: "#2A9158", 600: "#1F7A45", 700: "#186238", 800: "#134D2D", 900: "#12301F" },
        sun: { 200: "#FAEBA6", 300: "#F8E080", 400: "#F6D96B", 500: "#EDC53A" },
        ink: { DEFAULT: "#12301F", soft: "#3A5444", mute: "#566B5E" },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(18,48,31,.06), 0 10px 28px -10px rgba(18,48,31,.16)",
        lift: "0 2px 4px rgba(18,48,31,.08), 0 22px 44px -14px rgba(18,48,31,.28)",
        btn: "0 8px 20px -8px rgba(31,122,69,.65)",
      },
    },
  },
  plugins: [],
};

export default config;
