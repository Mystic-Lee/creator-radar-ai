/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ── CreatorRadar Brand ──────────────────────────────
        brand: {
          DEFAULT: "#2F80ED",
          50:  "#EBF4FD",
          100: "#C9E2FA",
          200: "#96C5F5",
          300: "#64A8F0",
          400: "#4794EF",
          500: "#2F80ED",
          600: "#1A6FD4",
          700: "#1359AE",
          800: "#0D4289",
          900: "#082D64",
        },

        // ── Backgrounds ─────────────────────────────────────
        // Light mode
        "app-bg":      "#F5F7FA",   // main content background
        "sidebar-bg":  "#1E1E2F",   // sidebar / dark nav
        "card-bg":     "#FFFFFF",   // cards in light mode

        // Dark mode
        "dark-bg":     "#121212",   // main background
        "dark-card":   "#1E1E2F",   // cards in dark mode
        "dark-sidebar":"#0F172A",   // sidebar in dark mode

        // ── Score / Priority Tiers ──────────────────────────
        tier1: {
          DEFAULT: "#27AE60",
          bg:  "#E8F8EF",
          text:"#1A7A43",
        },
        tier2: {
          DEFAULT: "#2D9CDB",
          bg:  "#E6F4FB",
          text:"#1A6FA0",
        },
        tier3: {
          DEFAULT: "#F2C94C",
          bg:  "#FEF9E7",
          text:"#A07A10",
        },
        tier4: {
          DEFAULT: "#EB5757",
          bg:  "#FDECEC",
          text:"#A02020",
        },

        // ── Text ────────────────────────────────────────────
        "text-primary":   "#1C1C1C",
        "text-secondary": "#6B7280",
        "text-dark":      "#E5E7EB",
        "text-dark-sec":  "#9CA3AF",
      },

      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        "2xs": "0.65rem",
      },
      boxShadow: {
        card:   "0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)",
        "card-md": "0 4px 12px 0 rgba(0,0,0,0.08), 0 1px 3px -1px rgba(0,0,0,0.04)",
      },
      borderRadius: {
        "xl":  "12px",
        "2xl": "16px",
      },
      animation: {
        "fade-in":  "fadeIn 0.15s ease-out",
        "slide-in": "slideIn 0.18s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%":   { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
