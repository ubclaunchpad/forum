import { cn } from "@/lib/utils";

type NavbarProps = {
  children: React.ReactNode;
  variant: "default" | "compact";
};

const navClass = "flex items-center justify-between bg-primary h-[42px]";

export default function Navbar({ children, variant }: NavbarProps) {
  return <nav className={cn(navClass, variant)}>{children}</nav>;
}
