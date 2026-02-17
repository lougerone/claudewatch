import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        border: "var(--border)",
        card: "var(--card)",
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        teal: {
          500: "#0d9488",
          600: "#0f766e",
          700: "#115e59",
        },
        terracotta: {
          400: "#e07a5f",
          500: "#d4643e",
          600: "#b8502e",
        },
      },
      fontFamily: {
        sans: ["var(--font-lexend)", "Lexend", "system-ui", "sans-serif"],
        mono: ["GeistMono", "JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
