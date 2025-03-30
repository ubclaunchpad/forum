"use client";

import { useEffect, useState } from "react";

export default function HeroMouseEffect() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      {/* Dynamic radial gradient following the mouse */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(65,139,134,0.15), transparent 80%)`,
        }}
      />
      {/* Additional subtle static gradient accents based on our color scheme */}
      <div className="pointer-events-none absolute inset-0 z-[-1]">
        <div className="absolute inset-0 bg-linear-to-b from-primary-200 via-primary-200/90 to-primary-200 dark:from-gray-800 dark:via-gray-800/90 dark:to-gray-800" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] bg-primary-100/10 dark:bg-gray-700/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-primary-100/10 dark:bg-gray-700/10 blur-[100px]" />
      </div>
    </>
  );
}
