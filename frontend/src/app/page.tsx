"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Users, Clock, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navigation/navbar";

export default function ForumLandingPage() {
  const router = useRouter();

  const signInRedirect = () => {
    console.log("redirect");
    router.push("/auth/signin");
  };

  return (
    <div className="min-h-screen bg-[#ECECEC] text-gray-100">
      <Navbar variant="default">
        <p></p>
      </Navbar>
      {/* <header className="container mx-auto px-4 py-6"> */}
      {/* <nav className="flex items-center justify-between">
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
        </nav> */}
      {/* </header> */}
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
