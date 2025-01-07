import Link from "next/link";

export default function ForumLandingPage() {
  return (
    <div className="min-h-screen bg-primary-700 flex items-center justify-center">
      <Link href="/forum/courses" className="text-white text-2xl font-semibold">
        Go to Your Forum
      </Link>
    </div>
  );
}
