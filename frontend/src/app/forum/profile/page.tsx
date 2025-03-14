"use client";

import ProfileFullView from "@/components/people/ProfileFullView";
import { ArrowLeftCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
export default function ProfilePage() {
  const router = useRouter();
  return (
    <div className="flex flex-col w-full min-h-dvh items-center justify-center ">
      <div className="flex w-full p-4">
        <button
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push("/forum");
            }
          }}
          className="flex items-center gap-2 text-primary-600 flex-shrink-0"
        >
          <ArrowLeftCircleIcon className="w-6 h-6" />
        </button>
      </div>
      <ProfileFullView />
    </div>
  );
}
