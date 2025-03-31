import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full">
      <div className="flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    </div>
  );
}
