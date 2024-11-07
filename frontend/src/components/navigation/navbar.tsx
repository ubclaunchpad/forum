import { cn } from "@/lib/utils";

type NavbarProps = {
  children: React.ReactNode;
  variant: "default" | "compact";
};

const navClass = "flex items-center justify-between bg-[#2F43CB] h-[56px]";

export default function Navbar({ children, variant }: NavbarProps) {
  return <nav className={cn(navClass, variant)}>{children}</nav>;
}
