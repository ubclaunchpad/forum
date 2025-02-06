"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileText, MessageSquare, Github, Lock, Code, Cpu, ChevronDown } from "lucide-react"
import { Header } from "./landing/header"
import { Footer } from "./landing/footer"
import HeroMouseEffect from "./landing/hero-mouse-hover"

export default function Home() {
  return (
    <div className="w-full bg-primary-200">
      <Header />
      <section
        className="relative flex flex-col items-center justify-center space-y-6 min-h-screen py-24 px-4 text-center md:py-32 lg:py-48 bg-gradient-to-b from-primary-200 to-gray-100"
      >
        <HeroMouseEffect />
        <div className="relative z-10 space-y-4">
          <div className="inline-block rounded-full px-3 py-1 text-xs sm:text-sm border border-gray-700 bg-gray-800 text-white">
            AI-Native, Open Source Educational Platform
          </div>
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-primary-950">
            Forum AI
          </h1>
          <p className="mx-auto max-w-[700px] text-md text-primary-900 sm:text-lg md:text-xl">
            Revolutionize document interaction and student engagement with advanced AI-powered Retrieval Augmented Generation.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row relative z-10">
          <Button
            size="lg"
            className="h-10 px-6 sm:h-11 sm:px-8 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
            onClick={() => window.open("https://forumai.me/auth/signin", "_blank", "noopener,noreferrer")}
          >
            Get Started
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-10 px-6 sm:h-11 sm:px-8 border-primary-600 text-gray-200 bg-gray-800 hover:bg-gray-700 hover:cursor-pointer rounded-lg"
            onClick={() => window.open("https://github.com/ubclaunchpad/forum", "_blank", "noopener,noreferrer")}
          >
            View on GitHub
          </Button>
        </div>
        <div className="mt-12 animate-bounce relative z-10">
          <ChevronDown className="h-6 w-6 text-gray-300" />
        </div>
      </section>

      <div className="flex flex-col bg-gray-100">
        {/* How It Works Section */}
        <section id="how-it-works" className="border-b border-gray-300 bg-gray-100 px-4 md:px-0">
          <div className="container mx-auto space-y-6 py-12 md:py-24">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl text-primary-800">
                How Forum AI Works
              </h2>
              <p className="max-w-[85%] text-sm text-primary-800 sm:text-base">
                Experience the seamless integration of AI in your document interactions
              </p>
            </div>
            <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] lg:grid-cols-3">
              {[
                {
                  title: "Upload & Post Creation",
                  description:
                    "Users upload documents and create discussion posts, all centrally stored for AI access.",
                },
                {
                  title: "Query Processing",
                  description:
                    "AI engine scans, aggregates, and synthesizes information from relevant content.",
                },
                {
                  title: "Response Delivery",
                  description:
                    "Comprehensive answers are generated and displayed securely and privately.",
                },
              ].map((step, index) => (
                <Card
                  key={index}
                  className="group relative overflow-hidden border border-gray-300 bg-gray-100 p-6 transition-all hover:border-primary-800 hover:bg-primary-100 hover:shadow-md"
                >
                  <div className="space-y-2">
                    <h3 className="font-bold text-primary-800">{`Step ${index + 1}: ${step.title}`}</h3>
                    <p className="text-sm text-primary-600">{step.description}</p>
                  </div>
                </Card>
              ))}
            </div>
            {/* RAG Process Visualization */}
            <div className="mx-auto mt-12 max-w-[64rem] rounded-lg border border-gray-300 bg-gray-100 p-6">
              <h3 className="text-center text-lg font-bold mb-4 text-primary-800">RAG Process Visualization</h3>
              <div className="h-64 bg-gray-200 rounded-md flex items-center justify-center">
                <p className="text-primary-800">Interactive RAG Process Graphic</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto space-y-6 py-12 md:py-24 px-4 md:px-0">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl text-primary-800">
              Key Features
            </h2>
            <p className="max-w-[85%] text-sm text-primary-600 sm:text-base">
              Discover the power of AI-native document and community interaction
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            {[
              {
                icon: FileText,
                title: "Document & Post Upload",
                description: "Seamlessly upload documents and create posts for AI analysis",
              },
              {
                icon: Cpu,
                title: "Advanced RAG",
                description: "Leverage cutting-edge Retrieval Augmented Generation for accurate responses",
              },
              {
                icon: Github,
                title: "Open-Source & Customizable",
                description: "Modify and adapt the platform to fit your specific needs",
              },
              {
                icon: Lock,
                title: "Privacy & Security",
                description: "Ensure your data remains private and secure",
              },
              {
                icon: Code,
                title: "AI-Native Architecture",
                description: "Built from the ground up with AI at its core",
              },
              {
                icon: MessageSquare,
                title: "Community Engagement",
                description: "Foster discussions and knowledge sharing within your community",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden border border-gray-300 bg-gray-100 p-6 transition-all hover:border-primary-800 hover:bg-primary-100 hover:shadow-md"
              >
                <div className="flex flex-col items-center space-y-4">
                  <feature.icon className="h-12 w-12 text-primary-600" />
                  <div className="space-y-2 text-center">
                    <h3 className="font-bold text-primary-800">{feature.title}</h3>
                    <p className="text-sm text-primary-600">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Open Source Section */}
        <section className="border-t border-gray-300 bg-gray-100 px-4 md:px-0">
          <div className="container mx-auto space-y-6 py-12 md:py-24">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl text-primary-800">
                Open Source
              </h2>
              <p className="max-w-[85%] text-sm text-primary-600 sm:text-base">
                Join our community and contribute to the future of AI-powered forums
              </p>
            </div>
            <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
              {[
                {
                  icon: Github,
                  title: "GitHub Repository",
                  description: "Access and contribute to our open source codebase",
                },
                {
                  icon: Code,
                  title: "Customization",
                  description: "Tailor the platform to your specific needs",
                },
                {
                  icon: MessageSquare,
                  title: "Community Support",
                  description: "Engage with developers and users in our forums",
                },
              ].map((feature, index) => (
                <Card
                  key={index}
                  className="group relative overflow-hidden border border-gray-300 bg-gray-100 p-6 transition-all hover:border-primary-800 hover:bg-primary-100 hover:shadow-md"
                >
                  <div className="flex flex-col items-center space-y-4">
                    <feature.icon className="h-12 w-12 text-primary-600" />
                    <div className="space-y-2 text-center">
                      <h3 className="font-bold text-primary-800">{feature.title}</h3>
                      <p className="text-sm text-primary-600">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-gray-300">
          <div className="container mx-auto space-y-6 py-12 md:py-24 px-4 md:px-0">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl text-primary-800">
                Ready to Revolutionize Your Forums?
              </h2>
              <p className="max-w-[85%] text-sm text-primary-600 sm:text-base">
                Join the growing community of developers, students and educators using Forum AI
              </p>
              <Button
                size="lg"
                className="h-10 px-8 sm:h-11 bg-primary-800 hover:bg-primary-700 text-white rounded-lg"
                onClick={() =>
                  window.open("https://forumai.me/auth/signin", "_blank", "noopener,noreferrer")
                }
              >
                Get Started with Forum AI
              </Button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}
