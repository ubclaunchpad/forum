import type { Config } from "tailwindcss";

const colourPalette = {
  neutral: {
    50: "#FAFAFA",
    100: "#F5f5f5",
    200: "#E5E5E5",
    300: "#D4D4D4",
    400: "#A3A3A3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
    950: "#0A0A0A",
  },
  jade: {
    50: "#F4F9F8",
    100: "#D9EEEB",
    200: "#B3DCD6",
    300: "#85C3BD",
    400: "#5BA6A0",
    500: "#418B86",
    600: "#347370",
    700: "#2B5A58",
    800: "#264948",
    900: "#233E3D",
    950: "#102223",
  },
};

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-quicksand)", "var(--font-figtree)", "sans-serif"],
        title: ["var(--font-quicksand)"],
        body: ["var(--font-source-sans)"],
      },
      fontSize: {
        xs: "10px", // 10 not used
        sm: "12px", // 12 p(small)
        base: "14px", // 14 p(default) h5
        md: "16px", // 16  p(large)
        lg: "18px", // 18 h4
        xl: "22px", // 22 h3
        "2xl": "26px", // 26 h2
        "3xl": "30px", // 30 h1
        // add more sizes for landing page
      },
      colors: {
        background: colourPalette.neutral[50],
        foreground: colourPalette.neutral[900],
        card: {
          DEFAULT: "hsl(var(--neutral-1))",
          foreground: "hsl(var(--neutral-12))",
        },
        popover: {
          DEFAULT: "hsl(var(--neutral-1))",
          foreground: "hsl(var(--neutral-12))",
        },
        primary: {
          DEFAULT: colourPalette.jade[600],
          foreground: colourPalette.neutral[50],
          ...colourPalette.jade,
        },
        muted: {
          DEFAULT: colourPalette.neutral[200],
          foreground: colourPalette.neutral[700],
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        ...colourPalette,
        border: {
          DEFAULT: colourPalette.jade[600],
        },
        input: "hsl(var(--neutral-6))",
        ring: "hsl(var(--primary-9))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        btn: "var(--rounded-btn)",
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [
    require("tailwindcss-animate"),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("@tailwindcss/typography"),
  ],
};

export default config;
