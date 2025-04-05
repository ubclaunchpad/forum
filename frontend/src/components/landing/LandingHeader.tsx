import { Button } from "../ui/landing-button";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Menu } from "lucide-react";
import { useState } from "react";

const LandingHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 left-0 right-0 z-20 px-4 sm:px-6 lg:px-16 py-4 bg-white shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Image src="/icon.svg" alt="ForumAI Logo" width={32} height={32} />
          <span
            className="text-xl font-bold text-gray-800 leading-tight"
            style={{
              color: "#347370",
              fontFeatureSettings: "'liga' off, 'clig' off",
              fontFamily: "Quicksand, sans-serif",
            }}
          >
            ForumAI
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <a
            href="#"
            className="text-sm font-semibold"
            style={{ fontFamily: "Quicksand, sans-serif", color: "#347370" }}
          >
            About
          </a>
          <a
            href="/privacy"
            className="text-sm font-semibold"
            style={{ fontFamily: "Quicksand, sans-serif", color: "#347370" }}
          >
            Privacy & Security
          </a>
          <a
            href="mailto:forumai.platform@gmail.com"
            className="text-sm font-semibold"
            style={{ fontFamily: "Quicksand, sans-serif", color: "#347370" }}
          >
            Contact
          </a>
          <a
            href="https://github.com/ubclaunchpad/forum"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm font-semibold"
            style={{ fontFamily: "Quicksand, sans-serif", color: "#347370" }}
          >
            View on GitHub <ExternalLink className="ml-1 h-4 w-4" />
          </a>
          <Button
            variant="outline"
            className="text-sm border-gray-300 hover:bg-gray-100"
          >
            <Link href="/auth/signin">Log in</Link>
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg p-4 z-30">
          <nav className="flex flex-col space-y-4">
            <a
              href="#"
              className="text-sm font-semibold"
              style={{ fontFamily: "Quicksand, sans-serif", color: "#347370" }}
            >
              About
            </a>
            <a
              href="/privacy"
              className="text-sm font-semibold"
              style={{ fontFamily: "Quicksand, sans-serif", color: "#347370" }}
            >
              Privacy & Security
            </a>
            <a
              href="mailto:forumai.platform@gmail.com"
              className="text-sm font-semibold"
              style={{ fontFamily: "Quicksand, sans-serif", color: "#347370" }}
            >
              Contact
            </a>
            <a
              href="https://github.com/ubclaunchpad/forum"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm font-semibold"
              style={{ fontFamily: "Quicksand, sans-serif", color: "#347370" }}
            >
              View on GitHub <ExternalLink className="ml-1 h-4 w-4" />
            </a>
            <Link href="/auth/signin" passHref>
              <Button
                variant="outline"
                className="w-full justify-center hover:cursor-pointer"
              >
                Log in
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default LandingHeader;
