/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FAF8FC",
        "bg-alt": "#F1ECFB",
        ink: "#211A34",
        "ink-soft": "#6B6480",

        primary: "#8B7FE8",
        "primary-light": "#B8AEF2",
        "primary-deep": "#5B4FCF",
        "primary-darker": "#3E2FA0",

        accent: "#F2A98F",
        line: "#E4DEF5",

        success: "#4FAE7C",
        "success-soft": "#E4F5EC",
        warning: "#E0A63E",
        "warning-soft": "#FBF1DD",
        danger: "#E2695F",
        "danger-soft": "#FBE9E7",
      },
      fontFamily: {
        display: ["DM Sans", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #8B7FE8 0%, #5B4FCF 100%)",
        "gradient-deep": "linear-gradient(135deg, #5B4FCF 0%, #3E2FA0 100%)",
        "gradient-mesh":
          "radial-gradient(at 20% 20%, rgba(139,127,232,0.25) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(242,169,143,0.18) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(91,79,207,0.20) 0px, transparent 50%)",
        "gradient-text": "linear-gradient(135deg, #5B4FCF 0%, #8B7FE8 60%, #F2A98F 100%)",
        "gradient-card": "linear-gradient(160deg, rgba(255,255,255,0.9) 0%, rgba(241,236,251,0.6) 100%)",
        /* Soft pastel-purple wash used behind the dashboard preview mockup,
           replacing its previous flat-white background. Light enough that
           dark ink text and frosted-glass cards on top stay fully legible. */
        "gradient-dashboard":
          "linear-gradient(160deg, #EEE8FC 0%, #E3D9FA 45%, #F5F0FD 100%)",
      },
      boxShadow: {
        soft: "0 4px 24px -4px rgba(91,79,207,0.12)",
        card: "0 8px 30px -8px rgba(33,26,52,0.10)",
        glow: "0 0 40px -8px rgba(139,127,232,0.55)",
        "glow-lg": "0 0 80px -16px rgba(139,127,232,0.5)",
        lift: "0 20px 40px -16px rgba(91,79,207,0.25)",
        /* Layered glass shadow: soft outer drop + a thin inner top
           highlight, for the dashboard's frosted cards. */
        glass: "0 8px 32px -8px rgba(91,79,207,0.18), inset 0 1px 0 0 rgba(255,255,255,0.6)",
        /* Gentle glow used on hover for interactive glass surfaces. */
        "glow-soft": "0 0 30px -6px rgba(139,127,232,0.45)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.55" },
          "50%": { transform: "scale(1.08)", opacity: "0.85" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.6" },
          "80%, 100%": { transform: "scale(1.3)", opacity: "0" },
        },
        /* Gentle continuous bob, for small icon/emoji accents. */
        "icon-float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      animation: {
        breathe: "breathe 4s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "pulse-ring": "pulse-ring 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "icon-float": "icon-float 3.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};