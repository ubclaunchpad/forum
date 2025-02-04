"use client"

import { useState } from "react"
import Link from "next/link"
import { Github, Cpu, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary-800 bg-black/50 backdrop-blur supports-[backdrop-filter]:bg-primary-950/60">
      <div className="container mx-auto flex h-14 items-center">
        <Link 
          href="/"
          className="flex items-center space-x-2 mr-8"
          onClick={(e) => {
            e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <Cpu className="h-6 w-6 text-primary-400" />
          <span className="font-bold text-primary-100">Forum AI</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4 sm:justify-between">
          <nav className="hidden sm:flex items-center space-x-6 text-sm">
            <Link 
              href="#features"
              className="text-primary-300 transition hover:text-primary-100"
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
              href="#how-it-works"
              onClick={(e) => {
                e.preventDefault();
                const targetElement = document.getElementById("how-it-works");
                if (targetElement) {
                  targetElement.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="text-primary-300 transition hover:text-primary-100"
            >
              How It Works
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="https://github.com/ubclaunchpad/forum" target="_blank" rel="noreferrer">
              <Button
                variant="outline"
                size="icon"
                className="hidden sm:flex border-primary-700 hover:border-primary-500 bg-primary-950 hover:bg-primary-800"
              >
                <Github className="h-4 w-4 text-primary-300" />
                <span className="sr-only">GitHub</span>
              </Button>
            </Link>
            <Button asChild className="hidden sm:flex px-4 bg-primary-600 hover:bg-primary-700 text-primary-50">
              <Link href="/auth/signin">Get Started</Link>
            </Button>
            <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="sm:hidden">
          <nav className="flex flex-col space-y-4 p-4 bg-primary-950 border-t border-primary-800">
            <Link href="#features" className="text-primary-300 transition hover:text-primary-100">
              Features
            </Link>
            <Link
              href="#how-it-works"
              onClick={(e) => {
                e.preventDefault();
                const targetElement = document.getElementById("how-it-works");
                if (targetElement) {
                  targetElement.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="text-primary-300 transition hover:text-primary-100"
            >
              How It Works
            </Link>
            <Link href="/login" className="text-primary-300 transition hover:text-primary-100">
              Get Started
            </Link>
            <Link
              href="https://github.com/forum-ai/repo"
              target="_blank"
              rel="noreferrer"
              className="text-primary-300 transition hover:text-primary-100"
            >
              GitHub
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}

