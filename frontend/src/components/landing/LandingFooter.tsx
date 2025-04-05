import Image from "next/image";
import Link from "next/link";

const LandingFooter = () => (
  <footer className="bg-[#F9F9F7] py-12 px-4 sm:px-6 lg:px-16">
    <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
      {/* Logo & Copyright */}
      <div className="col-span-2 md:col-span-1">
        <div className="flex items-center space-x-2 mb-4">
          <Image src="/icon.svg" alt="ForumAI Logo" width={32} height={32} />
          <span className="text-xl font-bold text-gray-800">ForumAI</span>
        </div>
        <p className="text-xs text-gray-500">
          Copyright © 2025 ForumAI. <br />
          All rights reserved.
        </p>
      </div>

      {/* Link Columns */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Product</h3>
        <ul className="space-y-2">
          <li>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              Features
            </a>
          </li>
          <li>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              Request a demo
            </a>
          </li>
          <li>
            <a
              href="https://forumai.statuspage.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Status page
            </a>
          </li>
        </ul>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Resources</h3>
        <ul className="space-y-2">
          <li>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              Documentation
            </a>
          </li>
          <li>
            <a
              href="https://github.com/ubclaunchpad/forum"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              GitHub
            </a>
          </li>
        </ul>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Learn</h3>
        <ul className="space-y-2">
          <li>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              About us
            </a>
          </li>
          <li>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              FAQ
            </a>
          </li>
          <li>
            <a
              href="mailto:forumai.platform@gmail.com"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Contact
            </a>
          </li>
        </ul>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Legal</h3>
        <ul className="space-y-2">
          <li>
            <a
              href="/privacy"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Privacy policy
            </a>
          </li>
          <li>
            <a
              href="/terms"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Terms of service
            </a>
          </li>
        </ul>
      </div>
    </div>
  </footer>
);

export default LandingFooter;
