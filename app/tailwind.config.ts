import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Dark "stadium night" palette.
        pitch: {
          950: "#0a0e0f",
          900: "#0f1518",
          850: "#131b1f",
          800: "#18232a",
          700: "#1f2f38",
          600: "#2a4150",
        },
        turf: {
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
        },
        gold: {
          400: "#fbbf24",
          500: "#f59e0b",
        },
        home: "#38bdf8",
        away: "#fb7185",
        draw: "#a78bfa",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: {
        card: "var(--radius)",
        control: "var(--radius-sm)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(16,185,129,0.15), 0 8px 40px -12px rgba(16,185,129,0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
