"use client";

import { createContext, ReactNode } from "react";
import { generatePalette } from "@/lib/utils";

const fonts = {
  default: "var(--font-quicksand)",
  "space-grotesk": "var(--font-space-grotesk)",
  inter: "var(--font-inter)",
  "roboto-mono": "var(--font-roboto-mono)",
  "playfair-display": "var(--font-playfair-display)",
  quicksand: "var(--font-quicksand)",
  "source-sans": "var(--font-source-sans)",
  nunito: "var(--font-nunito)",
  lato: "var(--font-lato)",
  "fira-code": "var(--font-fira-code)",
  roboto: "var(--font-roboto)",
} as const;

type ThemeContextType = {
  updateTheme: (config: ThemeConfig | undefined) => void;
};

export const themeContext = createContext({} as ThemeContextType);

type ThemeConfig = {
  theme_colour?: string;
  font?: string;
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  function updateTheme(config: ThemeConfig | undefined) {
    if (!config) return;
    const themeColour = config.theme_colour;
    const font = config.font;
    setTheme(themeColour, font);
  }

  const val = {
    updateTheme,
  };

  return <themeContext.Provider value={val}>{children}</themeContext.Provider>;
}

export function setTheme(colour?: string, font?: string) {
  const root = document.documentElement;

  if (font && font in fonts) {
    root.style.setProperty(
      "--course-font-title",
      fonts[font as keyof typeof fonts],
    );
    root.style.setProperty(
      "--course-font-body",
      fonts[font as keyof typeof fonts],
    );
  }

  if (colour) {
    const primaryShades = generatePalette(colour);
    Object.entries(primaryShades).forEach(([shade, hsl]) => {
      root.style.setProperty(`--course-primary-${shade}`, hsl);
    });
  }
}
