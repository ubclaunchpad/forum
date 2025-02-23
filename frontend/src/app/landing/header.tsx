"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Github, Menu, X, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-14 items-center">
        <Link
          href="/"
          className="flex items-center space-x-2 mr-8 ml-4 xs:ml-0"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <Image
            alt="logo"
            src="/icon.png"
            width="96"
            height="96"
            className="h-6 w-6 text-primary-800"
          />
          <span className="font-bold text-primary-800 dark:text-gray-100">
            Forum AI
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4 sm:justify-between">
          <nav className="hidden sm:flex items-center space-x-6 text-sm">
            <Link
              href="#how-it-works"
              onClick={(e) => {
                e.preventDefault();
                const targetElement = document.getElementById("how-it-works");
                if (targetElement) {
                  targetElement.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="text-primary-800 dark:text-gray-100 transition hover:text-primary-600 dark:hover:text-gray-300"
            >
              How It Works
            </Link>
            <Link
              href="#features"
              className="text-primary-800 dark:text-gray-100 transition hover:text-primary-600 dark:hover:text-gray-300"
              onClick={(e) => {
                e.preventDefault();
                const targetElement = document.getElementById("features");
                if (targetElement) {
                  targetElement.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              Features
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link
              href="https://github.com/ubclaunchpad/forum"
              target="_blank"
              rel="noreferrer"
            >
              <Button
                variant="outline"
                size="icon"
                className="hidden sm:flex hover:border-gray-600 bg-white hover:bg-gray-100"
              >
                <Github className="h-4 w-4 text-primary-800" />
                <span className="sr-only">GitHub</span>
              </Button>
            </Link>
            <Button
              asChild
              className="hidden sm:flex px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
            >
              <Link href="/auth/signin">Get Started</Link>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="hidden sm:flex hover:border-gray-600 bg-white hover:bg-gray-100"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-primary-800" />
              ) : (
                <Moon className="h-5 w-5 text-primary-800" />
              )}
              <span className="sr-only">Toggle Dark Mode</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 text-primary-800" />
              ) : (
                <Menu className="h-5 w-5 text-primary-800" />
              )}
            </Button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="sm:hidden">
          <nav className="flex flex-col space-y-4 p-4 bg-white dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700">
            <Link
              href="#how-it-works"
              onClick={(e) => {
                e.preventDefault();
                const targetElement = document.getElementById("how-it-works");
                if (targetElement) {
                  targetElement.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="text-primary-800 dark:text-gray-100 transition hover:text-primary-600 dark:hover:text-gray-300"
            >
              How It Works
            </Link>
            <Link
              href="#features"
              className="text-primary-800 dark:text-gray-100 transition hover:text-primary-600 dark:hover:text-gray-300"
              onClick={(e) => {
                e.preventDefault();
                const targetElement = document.getElementById("features");
                if (targetElement) {
                  targetElement.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              Features
            </Link>
            <Link
              href="/auth/signin"
              className="text-primary-800 dark:text-gray-100 transition hover:text-primary-600 dark:hover:text-gray-300"
            >
              Get Started
            </Link>
            <Link
              href="https://github.com/ubclaunchpad/forum"
              target="_blank"
              rel="noreferrer"
              className="text-primary-800 dark:text-gray-100 transition hover:text-primary-600 dark:hover:text-gray-300"
            >
              GitHub
            </Link>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="text-primary-800 dark:text-gray-100 transition hover:text-primary-600 dark:hover:text-gray-300"
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
