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
        background: "#FFFFFF",
        "optidge-green": "#A0D940",
        "optidge-green-soft": "#D9F5B3",
        "optidge-green-pale": "#E9FBC0",
        "optidge-orange": "#F7B35B",
        "optidge-text": "#333333",
        "optidge-text-muted": "#4A4A4A",
        accent: "#A0D940",
        "accent-orange": "#F7B35B",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-space-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
