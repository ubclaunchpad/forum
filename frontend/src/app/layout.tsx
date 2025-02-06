import type { Metadata } from "next";
import {
  Quicksand,
  Source_Sans_3,
  Space_Grotesk,
  Inter,
  Playfair_Display,
  Roboto_Mono,
  Nunito,
  Lato,
  Fira_Code,
  Roboto,
} from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: "500",
  variable: "--font-playfair-display",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Forum",
  description: "Forum; Platform for sharing knowledge",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* <script src="https://unpkg.com/react-scan/dist/auto.global.js" async /> */}
      </head>
      <body
        className={`${sourceSans.variable} ${quicksand.variable} ${spaceGrotesk.variable} 
          ${inter.variable} ${playfairDisplay.variable} ${robotoMono.variable} 
          ${nunito.variable} ${lato.variable} ${firaCode.variable} ${roboto.variable} 
          font-sans`}
      >
        <Toaster />
        {children}
      </body>
    </html>
  );
}
