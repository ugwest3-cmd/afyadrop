import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: "#00282C",
          900: "#00282C",
          800: "#053A40",
          700: "#0A4B53",
          100: "#DCEBEA",
        },
        sage: {
          DEFAULT: "#D3ECB2",
          300: "#D3ECB2",
          400: "#C2E29A",
          500: "#A9D377",
        },
        cream: "#FFF9EC",
        ivory: "#F6F0E2",
        ink: "#0F172A",
        muted: "#64748B",
        gold: "#F59E0B",
        coral: "#EF6461",
        sky: "#38BDF8",
      },
      fontFamily: {
        heading: ["Cabin", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["'IBM Plex Sans'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "24px",
      },
      maxWidth: {
        content: "1200px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,40,44,0.05), 0 8px 24px rgba(0,40,44,0.06)",
      },
      keyframes: {
        "soft-pulse": { "0%, 100%": { transform: "scale(1)" }, "50%": { transform: "scale(1.03)" } },
      },
      animation: { "soft-pulse": "soft-pulse 3s ease-in-out infinite" },
    },
  },
  plugins: [],
};

export default config;
