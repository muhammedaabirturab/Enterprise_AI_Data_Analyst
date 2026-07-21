/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Sora", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        // Primary — indigo / electric blue
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4F46E5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        // Accent — cyan, used for gradients and AI/data highlights
        accent: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06B6D4",
          600: "#0891b2",
          700: "#0e7490",
        },
        // Semantic states
        success: {
          50: "#ecfdf5",
          100: "#d1fae5",
          400: "#34d399",
          500: "#10B981",
          600: "#059669",
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          400: "#fbbf24",
          500: "#F59E0B",
          600: "#d97706",
        },
        danger: {
          50: "#fff1f2",
          100: "#ffe4e6",
          400: "#fb7185",
          500: "#F43F5E",
          600: "#e11d48",
        },
        // Neutral surfaces
        surface: {
          light: "#F7F8FA",
          dark: "#07080D",
          darkcard: "#101119",
          darkraised: "#15161F",
        },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)",
        "brand-gradient-soft": "linear-gradient(135deg, rgba(79,70,229,0.12) 0%, rgba(6,182,212,0.12) 100%)",
        "mesh-light": "radial-gradient(at 20% 0%, rgba(79,70,229,0.08) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(6,182,212,0.08) 0px, transparent 50%)",
        "mesh-dark": "radial-gradient(at 20% 0%, rgba(79,70,229,0.18) 0px, transparent 50%), radial-gradient(at 80% 10%, rgba(6,182,212,0.14) 0px, transparent 50%)",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(15,23,42,0.04), 0 1px 3px 0 rgba(15,23,42,0.06)",
        "card-dark": "0 1px 2px 0 rgba(0,0,0,0.3), 0 1px 3px 0 rgba(0,0,0,0.4)",
        hover: "0 4px 16px -4px rgba(15,23,42,0.10), 0 2px 6px -2px rgba(15,23,42,0.08)",
        elevated: "0 12px 32px -12px rgba(79,70,229,0.28)",
        glow: "0 0 0 1px rgba(79,70,229,0.15), 0 8px 24px -8px rgba(79,70,229,0.35)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s cubic-bezier(0.16,1,0.3,1)",
        shimmer: "shimmer 1.8s ease-in-out infinite",
        "pulse-soft": "pulseSoft 2.4s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp: { "0%": { opacity: 0, transform: "translateY(12px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        pulseSoft: { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.6 } },
        float: { "0%,100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-8px)" } },
      },
    },
  },
  plugins: [],
};
