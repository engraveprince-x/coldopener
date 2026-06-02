import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#FCFCFA",
          dark: "#F5F4F0",
        },
        ink: {
          DEFAULT: "#111111",
          muted: "#8A8A85",
        },
        hairline: "#E8E6E1",
        warm: "#D4C9B8",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-mono)", "'SF Mono'", "'Fira Code'", "monospace"],
      },
      letterSpacing: {
        tightest: "-3.5px",
        tighter: "-2.5px",
        wide: "5px",
      },
      lineHeight: {
        tightest: ".92",
        tighter: ".97",
      },
    },
  },
  plugins: [],
};
export default config;
