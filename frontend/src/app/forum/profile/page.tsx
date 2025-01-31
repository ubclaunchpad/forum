import ProfileFullView from "@/components/people/ProfileFullView";
import { ArrowLeftCircleIcon } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  return (
    <div className="flex flex-col w-full min-h-dvh items-center justify-center ">
      <div className="flex w-full p-4">
        <Link
          href={"/forum/courses"}
          className="flex items-center gap-2 flex-shrink-0"
        >
          <ArrowLeftCircleIcon className="w-6 h-6" />
          Back to Forum
        </Link>
      </div>
      <ProfileFullView />
    </div>
  );
}
