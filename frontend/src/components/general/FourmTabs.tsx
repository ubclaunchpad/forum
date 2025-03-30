import { cn } from "@/lib/utils";

export function MainSidebar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col flex-1 ",
        "hidden md:flex md:min-w-[min(280px,100%)] w-full max-w-0 lg:max-w-[280px] border-r",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function MainListPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-white relative flex flex-1 flex-col",
        "min-w-[min(500px,100%)] w-full xl:max-w-[500px]",
        className,
      )}
    >
      {children}
    </div>
  );
}
