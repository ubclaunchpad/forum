import type { Metadata } from "next";
import { Quicksand, Source_Sans_3 } from "next/font/google";
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
      <body
        className={`${SourceSans.variable} ${quicksand.variable}  font-sans`}
      >
        <Toaster />

        {children}
      </body>
    </html>
  );
}
