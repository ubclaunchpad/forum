import type { Metadata } from "next";
import { Figtree, Quicksand } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
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
      <body className={`${figtree.variable} ${quicksand.variable}  font-sans`}>{children}</body>
    </html>
  );
}
