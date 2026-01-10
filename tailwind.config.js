/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#1A73E8",
        primaryHover: "#1558C0",
        secondary: "#4F46E5",

        background: "#F9FAFB",
        card: "#FFFFFF",
        border: "#E5E7EB",

        textPrimary: "#0F172A",
        textSecondary: "#475569",
        muted: "#94A3B8",

        success: "#16A34A",
        warning: "#F59E0B",
        error: "#DC2626",

        dark: {
          primary: "#4C8DFF",
          secondary: "#818CF8",
          background: "#0B1220",
          card: "#111827",
          border: "#1F2937",
          textPrimary: "#E5E7EB",
          textSecondary: "#9CA3AF",
          muted: "#6B7280",
        },
      },
    },
  },
  plugins: [],
};
