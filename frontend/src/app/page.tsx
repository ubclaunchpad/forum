"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Users, Clock, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ForumLandingPage() {
  const router = useRouter();

  const signInRedirect = () => {
    console.log("redirect");
    router.push("/signin");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-purple-400">
            Forum
          </Link>
          <div className="space-x-4">
            <Link
              href="#features"
              className="hover:text-purple-400 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#testimonials"
              className="hover:text-purple-400 transition-colors"
            >
              Testimonials
            </Link>
            <Button
              variant="outline"
              className="bg-purple-700 text-white hover:bg-purple-600"
              onClick={signInRedirect}
            >
              Sign In
            </Button>
          </div>
        </nav>
      </header>

      <main>
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
            Connect with TAs, Elevate Your Learning
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Forum is the ultimate platform for UBC students to interact with
            Teaching Assistants, get quick answers, and enhance their academic
            experience.
          </p>
          <Button className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-6 text-lg">
            Get Started
          </Button>
        </section>

        <section id="features" className="bg-gray-800 py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">
              Why Choose Forum?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<MessageCircle className="w-12 h-12 text-purple-400" />}
                title="Real-time Chat"
                description="Get instant responses from TAs through our live chat feature."
              />
              <FeatureCard
                icon={<Users className="w-12 h-12 text-purple-400" />}
                title="Group Discussions"
                description="Join course-specific groups to collaborate with peers and TAs."
              />
              <FeatureCard
                icon={<Clock className="w-12 h-12 text-purple-400" />}
                title="24/7 Access"
                description="Access Forum anytime, anywhere for round-the-clock support."
              />
              <FeatureCard
                icon={<BookOpen className="w-12 h-12 text-purple-400" />}
                title="Resource Sharing"
                description="Easily share and access course materials and study resources."
              />
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">
              What Students Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <TestimonialCard
                quote="Forum has been a game-changer for my studies. I can get help from TAs whenever I need it!"
                author="Sarah L., Computer Science"
              />
              <TestimonialCard
                quote="The group discussions on Forum have helped me understand complex topics much better."
                author="Michael T., Biology"
              />
              <TestimonialCard
                quote="As a TA, Forum makes it easy for me to assist students and track their progress."
                author="Emily R., Teaching Assistant"
              />
            </div>
          </div>
        </section>

        <section className="bg-gray-800 py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Transform Your Learning Experience?
            </h2>
            <p className="text-xl mb-8">
              Join Forum today and connect with TAs and fellow students!
            </p>
            <div className="flex justify-center space-x-4">
              <Input
                type="email"
                placeholder="Enter your email"
                className="max-w-xs bg-gray-700 text-white border-gray-600"
              />
              <Button className="bg-purple-600 hover:bg-purple-500 text-white">
                Sign Up
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2024 Forum. All rights reserved.</p>
          <div className="mt-4 space-x-4">
            <Link href="#" className="hover:text-purple-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-purple-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-purple-400 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-gray-700 p-6 rounded-lg text-center">
      <div className="mb-4 flex justify-center">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}

function TestimonialCard({ quote, author }: { quote: string; author: string }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <p className="mb-4 italic">&ldquo;{quote}&rdquo;</p>
      <p className="text-purple-400 font-semibold">- {author}</p>
    </div>
  );
}
