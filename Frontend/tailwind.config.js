/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#FF6600",
          hover: "#E65C00",
          foreground: "#FFFFFF",
          light: "#FFF0E6",
        },
        secondary: {
          DEFAULT: "#F2F1F8",
          foreground: "#44425A",
          hover: "#E5E3F0",
        },
        dark: {
          DEFAULT: "#44425A",
          surface: "#302E42",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F2F1F8",
          foreground: "#6C6A74",
        },
        accent: {
          DEFAULT: "#FFF0E6",
          foreground: "#FF6600",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#2B293D",
        },
        minedu: "#0052A3",
        stats: "#2173D1",
        whatsapp: "#2E6329",
      },
      borderRadius: {
        lg: "var(--radius, 12px)",
        md: "calc(var(--radius, 12px) - 2px)",
        sm: "calc(var(--radius, 12px) - 4px)",
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
