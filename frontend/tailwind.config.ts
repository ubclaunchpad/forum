import type { Config } from "tailwindcss";
export const colourPalette = {
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
        title: ["var(--font-title)"],
        body: ["var(--font-body)"],
        quicksand: ['var(--font-quicksand)', 'sans-serif'],
        "space-grotesk": ["var(--font-space-grotesk)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
        "playfair-display": ["var(--font-playfair-display)", "serif"],
        "roboto-mono": ["var(--font-roboto-mono)", "monospace"],
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      // Refined modular scale for better typography hierarchy
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }], // 12px
        sm: ["0.875rem", { lineHeight: "1.25rem" }], // 14px
        base: ["1rem", { lineHeight: "1.5rem" }], // 16px
        md: ["1.125rem", { lineHeight: "1.75rem" }], // 18px
        lg: ["1.25rem", { lineHeight: "1.75rem" }], // 20px
        xl: ["1.5rem", { lineHeight: "2rem" }], // 24px
        "2xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
        "3xl": ["2.25rem", { lineHeight: "2.5rem" }], // 36px
        "4xl": ["3rem", { lineHeight: "1" }], // 48px
      },
      colors: {
        background: "var(--neutral-50)",
        foreground: "var(--neutral-900)",
        card: {
          DEFAULT: "var(--neutral-50)",
          foreground: "var(--neutral-900)",
        },
        popover: {
          DEFAULT: "var(--neutral-50)",
          foreground: "var(--neutral-900)",
        },
        primary: {
          DEFAULT: "var(--primary-600)",
          foreground: "var(--neutral-50)",
          50: "var(--primary-50)",
          100: "var(--primary-100)",
          200: "var(--primary-200)",
          300: "var(--primary-300)",
          400: "var(--primary-400)",
          500: "var(--primary-500)",
          600: "var(--primary-600)",
          700: "var(--primary-700)",
          800: "var(--primary-800)",
          900: "var(--primary-900)",
          950: "var(--primary-950)",
        },
        neutral: {
          50: "var(--neutral-50)",
          100: "var(--neutral-100)",
          200: "var(--neutral-200)",
          300: "var(--neutral-300)",
          400: "var(--neutral-400)",
          500: "var(--neutral-500)",
          600: "var(--neutral-600)",
          700: "var(--neutral-700)",
          800: "var(--neutral-800)",
          900: "var(--neutral-900)",
          950: "var(--neutral-950)",
        },
        muted: {
          DEFAULT: "var(--neutral-200)",
          foreground: "var(--neutral-700)",
        },
        border: {
          DEFAULT: "var(--primary-600)",
        },
        input: "var(--neutral-100)",
        ring: "var(--primary-500)",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
      },

      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            // Colors
            "--tw-prose-body": theme("colors.neutral[800]"),
            "--tw-prose-headings": theme("colors.neutral[900]"),
            "--tw-prose-links": theme("colors.jade[600]"),
            "--tw-prose-bold": theme("colors.neutral[900]"),
            "--tw-prose-counters": theme("colors.jade[500]"),
            "--tw-prose-bullets": theme("colors.jade[300]"),
            "--tw-prose-hr": theme("colors.neutral[200]"),
            "--tw-prose-quotes": theme("colors.neutral[900]"),
            "--tw-prose-quote-borders": theme("colors.jade[300]"),
            "--tw-prose-captions": theme("colors.neutral[700]"),
            "--tw-prose-code": theme("colors.neutral[900]"),
            "--tw-prose-pre-code": theme("colors.neutral[200]"),
            "--tw-prose-pre-bg": theme("colors.primary[800]"),
            "--tw-prose-th-borders": theme("colors.neutral[300]"),
            "--tw-prose-td-borders": theme("colors.neutral[200]"),

            // Base styles - removing all width/margin opinions
            color: theme("colors.neutral[800]"),
            width: "100%",
            maxWidth: "none",
            marginLeft: "0",
            marginRight: "0",
            fontSize: "1.125rem",
            lineHeight: "1.75",
            letterSpacing: "-0.01em",
            fontFamily: theme("fontFamily.body"),

            // Remove max-width constraints
            "> *": {
              maxWidth: "none",
              marginLeft: "0",
              marginRight: "0",
              width: "100%",
            },

            // Text rendering
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
            textRendering: "optimizeLegibility",

            // Headings
            "h1, h2, h3, h4, h5": {
              fontFamily: theme("fontFamily.title"),
              fontWeight: "600",
              letterSpacing: "-0.02em",
              lineHeight: "1.2",
              width: "100%",
            },

            h1: {
              fontSize: theme("fontSize.3xl[0]"),
              marginTop: "2rem",
              marginBottom: "1.5rem",
            },

            h2: {
              fontSize: theme("fontSize.2xl[0]"),
              marginTop: "2rem",
              marginBottom: "1.25rem",
            },

            h3: {
              fontSize: theme("fontSize.xl[0]"),
              marginTop: "1.75rem",
              marginBottom: "1rem",
            },

            h4: {
              fontSize: theme("fontSize.lg[0]"),
              marginTop: "1.5rem",
              marginBottom: "0.75rem",
            },

            // Paragraph spacing
            p: {
              marginTop: "1em",
              marginBottom: "1em",
              lineHeight: "1.75",
              width: "100%",
            },

            // Links
            a: {
              color: theme("colors.jade[600]"),
              textDecoration: "none",
              fontWeight: "500",
              transition: "color 150ms ease-in-out",
              "&:hover": {
                color: theme("colors.jade[700]"),
                textDecoration: "underline",
                textDecorationThickness: "1.5px",
                textUnderlineOffset: "2px",
              },
            },

            // Strong elements
            strong: {
              fontWeight: "600",
              color: theme("colors.neutral[900]"),
            },

            // Lists
            "ul, ol": {
              paddingLeft: "1.5em",
              marginTop: "1em",
              marginBottom: "1em",
              width: "100%",
              listStylePosition: "outside", // Changed from 'inside' to 'outside'
            },

            // Add separate li styling
            li: {
              marginTop: "0.5em",
              marginBottom: "0.5em",
              lineHeight: "1.625",
              paddingLeft: "0.5em", // Add padding for better spacing after marker
              "& > p": {
                // Target paragraphs inside list items
                margin: 0, // Remove default paragraph margins inside lists
                display: "inline", // Keep text inline with marker
              },
              "& > p + p": {
                // Handle multiple paragraphs in a list item
                display: "block", // Multiple paragraphs should stack
                marginTop: "1em", // Add spacing between paragraphs
              },
            },

            // Optional: Style markers specifically
            "li::marker": {
              color: theme("colors.neutral[900]"),
              fontWeight: "400",
            },

            // Blockquotes
            blockquote: {
              fontWeight: "400",
              fontStyle: "normal",
              borderLeftWidth: "3px",
              borderLeftColor: theme("colors.jade[400]"),
              paddingLeft: "1.5em",
              marginTop: "1.5em",
              marginBottom: "1.5em",
              color: theme("colors.neutral[700]"),
              width: "100%",
            },

            // Code blocks
            "pre, code": {
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              width: "100%",
            },

            pre: {
              backgroundColor: theme("colors.neutral[50]"),
              padding: "1.25rem",
              borderRadius: "0.5rem",
              border: `1px solid ${theme("colors.neutral[100]")}`,
              overflow: "auto",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.10)",
              fontSize: "0.875em",
              lineHeight: "1.7142857",
              marginTop: "1.8em",
              marginBottom: "1.8em",
              width: "100%",
              color: theme("colors.neutral[700]"),
            },

            code: {
              fontSize: "0.875em",
              fontWeight: "600",
              padding: "0.25rem 0.4rem",
              backgroundColor: theme("colors.neutral[100]"),
              borderRadius: "0.25rem",
            },

            // Tables
            table: {
              width: "100%",
              fontSize: "0.875em",
              lineHeight: "1.7142857",
            },

            thead: {
              borderBottomColor: theme("colors.neutral[200]"),
              borderBottomWidth: "2px",
              width: "100%",
              th: {
                fontWeight: "600",
                verticalAlign: "bottom",
                paddingBottom: "0.75rem",
                paddingLeft: "0.75rem",
                paddingRight: "0.75rem",
              },
            },

            "tbody tr": {
              borderBottomColor: theme("colors.neutral[200]"),
              borderBottomWidth: "1px",
              td: {
                paddingLeft: "0.75rem",
                paddingRight: "0.75rem",
                paddingTop: "0.5rem",
                paddingBottom: "0.5rem",
              },
            },

            // Hr styling
            hr: {
              width: "100%",
              marginTop: "2em",
              marginBottom: "2em",
              borderTopWidth: "1px",
              borderColor: theme("colors.neutral[200]"),
            },
          },
        },
      }),
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        btn: "var(--rounded-btn)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
