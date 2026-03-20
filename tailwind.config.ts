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
        // Fluent 2 Brand (Microsoft Blue)
        brand: {
          10:  "#EFF6FC",
          20:  "#DEECF9",
          30:  "#C7E0F4",
          40:  "#71AFE5",
          50:  "#2899F5",
          60:  "#0078D4",
          70:  "#106EBE",
          80:  "#005A9E",
          90:  "#004578",
          100: "#003366",
        },
        // Fluent 2 Neutral
        neutral: {
          0:   "#FFFFFF",
          10:  "#FAFAFA",
          20:  "#F5F5F5",
          30:  "#F0F0F0",
          40:  "#E0E0E0",
          50:  "#D1D1D1",
          60:  "#C7C7C7",
          70:  "#ADADAD",
          80:  "#8A8A8A",
          90:  "#616161",
          100: "#424242",
          110: "#242424",
          120: "#141414",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        serif: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        sm:  "2px",
        DEFAULT: "4px",
        md:  "6px",
        lg:  "8px",
        xl:  "12px",
      },
      boxShadow: {
        "f2":   "0 1px 2px rgba(0,0,0,.14), 0 0 2px rgba(0,0,0,.12)",
        "f4":   "0 2px 4px rgba(0,0,0,.14), 0 0 2px rgba(0,0,0,.12)",
        "f8":   "0 4px 8px rgba(0,0,0,.14), 0 0 2px rgba(0,0,0,.12)",
        "f16":  "0 8px 16px rgba(0,0,0,.14), 0 0 2px rgba(0,0,0,.12)",
      },
    },
  },
  plugins: [],
};

export default config;
