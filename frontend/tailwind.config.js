/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        apple: {
          canvas: "#ffffff",
          parchment: "#f5f5f7",
          pearl: "#fafafc",
          ink: "#1d1d1f",
          inkMuted: "#86868b",
          inkLight: "#6e6e73",
          hairline: "#e0e0e0",
          divider: "#f0f0f0",
          tileDark: "#161618",
        },
        action: {
          blue: "#0071e3",
          blueHover: "#0077ed",
          blueLight: "#2997ff",
          bluePale: "#e0f2fe",
        },
        tertiary: {
          blue: "#0284c7",
          blueSky: "#38bdf8",
          blueLight: "#f0f9ff",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Inter"',
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        appleXs: "5px",
        appleSm: "8px",
        appleMd: "11px",
        appleLg: "18px",
        appleXl: "24px",
        applePill: "9999px",
      },
      boxShadow: {
        appleCard: "0 2px 10px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06)",
        appleCardHover: "0 12px 30px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};
