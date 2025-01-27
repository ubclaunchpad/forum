import type { Metadata } from "next";
import {
  Quicksand,
  Source_Sans_3,
  Space_Grotesk,
  Inter,
  Playfair_Display,
  Roboto_Mono,
} from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const SourceSans = Source_Sans_3({
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
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: "500",
  variable: "--font-playfair-display",
});
const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
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
        <script src="https://unpkg.com/react-scan/dist/auto.global.js" async />
      </head>
      <body
        className={`${SourceSans.variable} ${quicksand.variable} ${spaceGrotesk.variable} ${inter.variable} ${playfairDisplay.variable} ${robotoMono.variable}  font-sans`}
      >
        <Toaster />

        {children}
      </body>
    </html>
  );
}
