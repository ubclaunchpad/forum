"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronRight,
  Search,
  CheckCircle2,
  XCircle,
  PlayCircle,
  ArrowRight,
  Plus,
  Users,
  GraduationCap,
  Lock,
  BarChart2,
  Database,
  ExternalLink,
  Menu, // Added for mobile menu toggle
} from "lucide-react";
import HeroMouseEffect from "./landing/hero-mouse-hover"; // Assuming this component exists

import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
// Assuming these icon components exist at the specified paths
import { ArrowDownIcon } from "@/components/landing/ArrowDownIcon";
import { SearchIcon } from "@/components/landing/SearchIcon";

// Placeholder components for Header and Footer if they need specific structure for this page
const LandingHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 left-0 right-0 z-20 px-4 sm:px-6 lg:px-16 py-4 bg-white shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-[#2D7D85] rounded-full flex items-center justify-center text-white font-bold">
            F
          </div>
          <span className="text-xl font-bold text-gray-800">ForumAI</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <a
            href="#"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            About
          </a>
          <a
            href="#"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Privacy & Security
          </a>
          <a
            href="#"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Contact
          </a>
          <a
            href="https://github.com/ubclaunchpad/forum"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            View on GitHub <ExternalLink className="ml-1 h-4 w-4" />
          </a>
          <Button
            variant="outline"
            className="text-sm border-gray-300 hover:bg-gray-100"
          >
            Log in
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
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              About
            </a>
            <a
              href="#"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Privacy & Security
            </a>
            <a
              href="#"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Contact
            </a>
            <a
              href="https://github.com/ubclaunchpad/forum"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              View on GitHub <ExternalLink className="ml-1 h-4 w-4" />
            </a>
            <Button variant="outline" className="w-full justify-center">
              Log in
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

const LandingFooter = () => (
  <footer className="bg-[#F9F9F7] py-12 px-4 sm:px-6 lg:px-16">
    <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
      {/* Logo & Copyright */}
      <div className="col-span-2 md:col-span-1">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-[#2D7D85] rounded-full flex items-center justify-center text-white font-bold">
            F
          </div>
          <span className="text-xl font-bold text-gray-800">ForumAI</span>
        </div>
        <p className="text-xs text-gray-500">
          Copyright © 2024 ForumAI. <br />
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
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
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
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
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
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              Contact
            </a>
          </li>
        </ul>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Legal</h3>
        <ul className="space-y-2">
          <li>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              Privacy policy
            </a>
          </li>
          <li>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              Terms of service
            </a>
          </li>
        </ul>
      </div>
    </div>
  </footer>
);

// Define SearchBar component (assuming it's not imported from a separate file for now)
interface SearchBarProps {
  onSearch?: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const query = (form.elements.namedItem("search") as HTMLInputElement).value;
    onSearch?.(query);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[1075px]">
      <div className="flex w-full items-center gap-3 bg-white pr-4 pl-8 py-2 rounded-[45.744px] border-[1.525px] border-[#BDCFCC]">
        <input
          type="search"
          name="search"
          placeholder="Search for a question"
          className="flex-1 text-base leading-6 text-[#262725] bg-transparent border-none outline-none placeholder:text-[#262725]"
        />
        <button
          type="submit"
          className="flex items-center justify-center"
          aria-label="Search"
        >
          <SearchIcon className="w-[36.595px] h-[36.595px] flex-shrink-0 text-[#347370]" />
        </button>
      </div>
    </form>
  );
};

// Define new FaqItem component
interface FaqItemProps {
  question: string;
  answer?: string;
  value: string; // Added value prop for AccordionItem
}

const FaqItem: React.FC<FaqItemProps> = ({ question, answer, value }) => {
  return (
    <AccordionItem value={value} className="border-none">
      <AccordionTrigger className="flex items-center justify-between gap-4 py-3 text-left hover:no-underline">
        <span className="text-md leading-10 tracking-[-0.6px] text-black flex-1">
          {question}
        </span>
        <ArrowDownIcon className="w-[40px] h-[40px] flex-shrink-0 text-[#347370] transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </AccordionTrigger>
      {answer && (
        <AccordionContent className="text-md text-gray-700 pb-4">
          {answer}
        </AccordionContent>
      )}
    </AccordionItem>
  );
};

// Define FAQ data
const FAQ_ITEMS = [
  {
    id: "what-is",
    question: "What is ForumAI?",
    answer:
      "ForumAI is an innovative platform that combines artificial intelligence with academic discussions to enhance learning and collaboration.",
  },
  {
    id: "how-works",
    question: "How does the AI work?",
    answer:
      "Our AI system analyzes discussions, provides relevant resources, and helps facilitate meaningful academic conversations while maintaining educational integrity.",
  },
  {
    id: "who-can-use",
    question: "Who can use ForumAI?",
    answer:
      "ForumAI is designed for students, educators, and academic institutions looking to enhance their learning and teaching experience through AI-assisted discussions.",
  },
  {
    id: "academic-integrity",
    question: "How does ForumAI ensure academic integrity?",
    answer:
      "We implement strict guidelines and AI monitoring to prevent misuse while promoting original thinking and proper academic citation practices.",
  },
  {
    id: "organization",
    question: "How are discussions and resources organized?",
    answer:
      "Content is organized by topics, subjects, and relevance, making it easy to find and participate in meaningful academic discussions.",
  },
  {
    id: "security",
    question: "Is ForumAI secure?",
    answer:
      "Yes, we implement industry-standard security measures to protect user data and maintain privacy in all academic discussions.",
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("instructors");

  // Search handler function
  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
    // Implement search functionality here
  };

  return (
    <div className="w-full bg-[#F9F9F7] text-gray-800">
      <LandingHeader />

      {/* Hero Section */}
      <section className="relative flex flex-col lg:flex-row items-center justify-between min-h-screen pt-24 pb-12 lg:pt-32 px-4 sm:px-6 overflow-hidden">
        <HeroMouseEffect /> {/* Include the mouse effect */}
        <div className="max-w-7xl mx-auto flex flex-row">
          {/* Left Content */}
          <div className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left max-w-xl lg:max-w-2xl space-y-6 mb-12 lg:mb-0">
            <div className="inline-block rounded-full px-4 py-1 text-sm bg-gray-100 border border-gray-300 text-gray-700 shadow-sm">
              AI-Native, Open Source Educational Platform
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
              Structured Discussions, Smarter Insights — A Forum Built for
              Learning
            </h1>
            <Button className="bg-[#2D7D85] hover:bg-[#25686e] text-white px-8 py-3 rounded-lg text-base font-medium shadow">
              Get started
            </Button>
          </div>
          {/* Right Content (Image Placeholder & Text) */}
          <div className="relative z-10 flex flex-col items-center space-y-4">
            {/* Placeholder for the image stack */}
            <div className="w-64 h-40 sm:w-80 sm:h-52 md:w-96 md:h-60 bg-gray-200 rounded-lg shadow-lg flex items-center justify-center text-gray-500">
              <Image
                src="/hero_cards.png"
                alt="ForumAI Demo"
                width={300}
                height={200}
              />
            </div>
            <div className="bg-gray-100/80 backdrop-blur-sm border border-gray-200 rounded-full px-6 py-3 text-sm text-gray-700 shadow-sm max-w-xs text-center">
              What should I explain more in the next class?
            </div>
          </div>
        </div>
      </section>

      {/* Streamline Section */}
      <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-16 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Tabs */}
          <div className="flex justify-center mb-12">
            <div className="flex space-x-2 bg-gray-100 p-1 rounded-full">
              <button
                onClick={() => setActiveTab("instructors")}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === "instructors"
                    ? "bg-white text-gray-900 shadow"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                For instructors
              </button>
              <button
                onClick={() => setActiveTab("institutions")}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === "institutions"
                    ? "bg-white text-gray-900 shadow"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                For institutions
              </button>
              <button
                onClick={() => setActiveTab("students")}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === "students"
                    ? "bg-white text-gray-900 shadow"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                For students
              </button>
            </div>
          </div>

          {/* Content based on tab */}
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Text Content (Example for Instructors) */}
            <div className="lg:w-1/3 text-center lg:text-left">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">
                Streamline, Organize, and Take Control
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Stay in control of course materials while AI-driven search and
                smart organization reduces duplicate posts, streamlines
                discussions, and surfaces key insights.
              </p>
            </div>
            {/* Image Placeholder */}
            <div className="lg:w-2/3 w-full">
              <div className="aspect-video bg-gray-200 rounded-lg shadow-lg flex items-center justify-center text-gray-500">
                [Dashboard Image Placeholder]
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Built for Institutions Section */}
      <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            Built for Institutions, Secured for Learning
          </h2>
          <Button
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-100 mb-12 group"
          >
            Learn more about privacy & security at ForumAI{" "}
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
            {[
              {
                icon: Users,
                title: "Role-based access controls",
                description:
                  "Sophisticated access controls allow you to control the experience for student, staff and instructors.",
                imgPlaceholder: "bg-blue-100",
              },
              {
                icon: GraduationCap,
                title: "Built for academic integrity",
                description:
                  "AI tailored to your specific course content and teaching style.",
                imgPlaceholder: "bg-green-100",
              },
              {
                icon: BarChart2,
                title: "Analytics & Insights",
                description:
                  "See how your students are learning and gain valuable insights to enhance engagement and performance.",
                imgPlaceholder: "bg-pink-100",
              },
              {
                icon: Lock,
                title: "Your course content, your data",
                description:
                  "Your data only lives within your course and ForumAI does not use it.",
                imgPlaceholder: "bg-teal-100",
              },
            ].map((feature, index) => (
              <div key={index}>
                <div
                  className={`w-full h-40 rounded-lg mb-4 flex items-center justify-center ${feature.imgPlaceholder}`}
                >
                  <feature.icon className="w-16 h-16 text-gray-600 opacity-50" />
                  {/* Placeholder for actual illustration */}
                </div>
                <h3 className="font-semibold text-lg mb-1 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-16 bg-white">
        <div className="max-w-6xl mx-auto text-left">
          <h2 className="text-3xl font-bold mb-12 text-gray-900">
            ForumAI Helps You Strike the Right Balance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left items-start">
            {/* Existing Q&A */}
            <div className="border-2 border-gray-400 rounded-lg p-6 bg-white mt-12">
              <h3 className="font-semibold text-lg mb-4 text-gray-800">
                Existing Q&A Platforms
              </h3>
              <ul className="space-y-3">
                {[
                  "Content is scattered and unorganized",
                  "Help responses are often delayed and lack promptness",
                  "Poorly collaborative; lacks features fostering working hours",
                  "Lacks structure handling grades, resulting in huge scope; Lacks performance or sentiment",
                ].map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start text-sm text-gray-600"
                  >
                    <XCircle className="w-4 h-4 mr-2 mt-0.5 text-red-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* ForumAI */}
            <div className="border-2 border-[#2D7D85] rounded-lg p-6 bg-white shadow-2xl ring-1 ring-[#2D7D85]/10">
              <h3 className="font-semibold text-xl mb-4 text-[#2D7D85] flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#2D7D85] mr-2"></div>
                ForumAI
              </h3>
              <ul className="space-y-3">
                {[
                  "AI-powered answers for fast, accurate, and context-rich actions",
                  "Seamlessly integrates peer and instructor-driven insights with AI assistance and summarization, academically sound support",
                  "Supports both individual and collaborative Q&A, dynamically leveraging class resources and existing insights to address repeat questions",
                  "Custom course insights for tracking class performance and sentiment",
                ].map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start text-[15px] text-gray-700"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-[#2D7D85] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Existing AI Tools */}
            <div className="border-2 border-gray-400 rounded-lg p-6 bg-white mt-12">
              <h3 className="font-semibold text-lg mb-4 text-gray-800">
                Existing AI Tools
              </h3>
              <ul className="space-y-3">
                {[
                  "Sole reliance on AI capabilities; lacks context",
                  "General purpose; not tuned to general course info and materials",
                  "Used by students, lacks features for managing collaboration",
                  "Not tightly integrated; few capabilities controlling",
                ].map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start text-sm text-gray-600"
                  >
                    <XCircle className="w-4 h-4 mr-2 mt-0.5 text-red-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Smarter Way Section */}
      <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-24">
          {/* Image Placeholder */}
          <div className="md:w-1/2 w-full flex justify-center">
            <div className="w-64 h-64 sm:w-80 sm:h-80 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
              [Illustration Placeholder]
            </div>
          </div>
          {/* Text Content */}
          <div className="md:w-3/4 text-center md:text-left">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              A smarter way to connect, learn, and share ideas in the classroom.
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              ForumAI is built to organize course materials and discussions
              within the teaching environment to create a well-structured,
              focused environment that supports deeper learning.
            </p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
              <Button className="bg-[#2D7D85] hover:bg-[#25686e] text-white px-6 py-2.5 rounded-lg text-base font-medium shadow">
                Get started
              </Button>
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-100 px-6 py-2.5 rounded-lg text-base font-medium group"
              >
                <PlayCircle className="mr-2 h-5 w-5 text-gray-500 group-hover:text-gray-700" />
                View demo video
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Updated FAQ Section */}
      <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-10 lg:gap-16 mb-12">
            <div className="md:w-1/3 text-center md:text-left">
              <h2 className="text-3xl md:text-[40px] font-bold md:leading-[48px] mb-3 text-black">
                Frequently Asked Questions
              </h2>
              <p className="text-lg md:text-xl text-gray-600 pt-4">
                Everything you need to know about our platform. Can't find what
                you're looking for? Search for a query below!
              </p>
            </div>

            <div className="md:w-2/3">
              <Accordion
                type="single"
                collapsible
                className="flex flex-col gap-2"
              >
                {FAQ_ITEMS.map((item) => (
                  <FaqItem
                    key={item.id}
                    value={item.id}
                    question={item.question}
                    answer={item.answer}
                  />
                ))}
              </Accordion>
            </div>
          </div>

          <div className="flex justify-center">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
