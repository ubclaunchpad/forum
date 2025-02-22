"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-dvh w-full justify-center bg-neutral-100 flex items-center overflow-hidden px-4 sm:px-0">
      <Card className="w-full max-w-lg min-h-[325px] text-center py-3 flex flex-col bg-neutral-50 rounded-xl">
        <CardHeader className="pl-0">
          <h2 className="text-2xl pl-0 pb-1">Page Not Found</h2>
        </CardHeader>
        <CardContent className="p-1 flex flex-1 w-full flex-col items-center gap-4">
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <h2 className="text-primary-800 text-3xl font-semibold">404</h2>
            <h3 className="text-center">
              Sorry, the page you are looking for doesn't exist. If you think
              something is broken, please let us know.
            </h3>
            <Link
              className="h-10 px-6 sm:h-11 sm:px-8 bg-primary-600 pt-2 hover:bg-primary-700 text-white rounded-lg"
              href="/"
            >
              Return Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
