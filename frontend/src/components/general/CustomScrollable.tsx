import { cn } from "@/lib/utils";

interface CustomScrollableProps {
    children: React.ReactNode;
    className?: string;
    containerClassName?: string;
  }

  export function CustomScrollable({
    children,
    className,
    containerClassName
  }: CustomScrollableProps) {
    const scrollbarStyles = cn(
      "h-full w-full overflow-auto",
      "[&::-webkit-scrollbar]:w-2",
      "[&::-webkit-scrollbar]:h-2",
      "[&::-webkit-scrollbar-track]:bg-neutral-100",
      "[&::-webkit-scrollbar-track]:rounded-lg",
      "[&::-webkit-scrollbar-thumb]:bg-neutral-300",
      "[&::-webkit-scrollbar-thumb]:rounded-lg",
      "[&::-webkit-scrollbar-thumb:hover]:bg-neutral-400",
      "scrollbar-thin",
      "scrollbar-track-neutral-100",
      "scrollbar-thumb-neutral-300",
      "hover:scrollbar-thumb-neutral-400",
      className
    );
  
    return (
      <div className={cn("relative flex-1 min-h-0", containerClassName)}>
        <div className={scrollbarStyles}>
          {children}
        </div>
      </div>
    );
  }