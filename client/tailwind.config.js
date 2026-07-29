/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#B76E79",   // Rose Gold
          light: "#D99AA4",
          dark: "#8D4F5B",
        },

        secondary: {
          DEFAULT: "#F8D7DA",   // Soft Blush Pink
          light: "#FCEDEE",
          dark: "#F3BDC5",
        },

        accent: {
          DEFAULT: "#D4AF37",   // Luxury Gold
          light: "#E6C766",
          dark: "#B68D1A",
        },

        background: {
          DEFAULT: "#FFF9F7",   // Warm Ivory
          dark: "#F7F2EF",
        },

        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#FCFCFC",
        },

        text: {
          DEFAULT: "#1F2937",   // Charcoal
          light: "#6B7280",
          white: "#FFFFFF",
        },

        border: {
          DEFAULT: "#E8DDD8",
        },

        roseGold: {
          DEFAULT: "#B76E79",
          light: "#D99AA4",
          dark: "#8D4F5B",
        },

        softPink: {
          DEFAULT: "#F8D7DA",
          light: "#FCEDEE",
          dark: "#F3BDC5",
        },

        gold: {
          DEFAULT: "#D4AF37",
          light: "#E6C766",
          dark: "#B68D1A",
        },

        dark: {
          DEFAULT: "#18181B",
          light: "#2A2A32",
        },

        success: "#16A34A",
        warning: "#F59E0B",
        error: "#DC2626",
      },

      boxShadow: {
        luxury: "0 15px 35px rgba(183,110,121,0.15)",
        card: "0 8px 24px rgba(0,0,0,0.08)",
        glow: "0 0 20px rgba(212,175,55,0.25)",
      },

      borderRadius: {
        luxury: "20px",
      },

      backgroundImage: {
        luxury: "linear-gradient(135deg,#B76E79 0%,#D4AF37 100%)",
        hero: "linear-gradient(135deg,#FFF9F7 0%,#F8D7DA 100%)",
        rosegold: "linear-gradient(135deg,#B76E79 0%,#D99AA4 50%,#8D4F5B 100%)",
        softpink: "linear-gradient(135deg,#FFF9F7 0%,#FCEDEE 50%,#F8D7DA 100%)",
      },

      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        playfair: ['"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [],
};
