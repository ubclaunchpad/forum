import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-dvh w-full justify-center bg-primary-800 flex items-center overflow-hidden">
      <Card className="w-full max-w-lg min-h-[450px] px-12 py-3 flex flex-col bg-neutral-50 rounded-xl [&_label]:pl-1">
        <CardHeader className="pl-0">
          <h2 className="text-2xl pl-0 pb-2">Page Not Found</h2>
        </CardHeader>
        <CardContent className="p-2 flex flex-1 w-full flex-col items-center  gap-4 ">
          <div className="flex-1 flex flex-col items-center justify-center ">
            <Link
              className="p-2 hover:bg-primary-800 px-4 font-medium w-fit bg-black text-white rounded-full"
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
