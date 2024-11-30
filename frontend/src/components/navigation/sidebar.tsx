import { useState } from "react";
import { PanelRight } from "lucide-react";

type SidebarProps = {
  children: React.ReactNode;
  position?: "left" | "right"; // default is right
};

export default function Sidebar({
  children,
  position = "right",
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const isRight = position === "right";

  return (
    <div className="flex h-screen">
      <div
        className={`fixed top-0 ${
          isRight ? "right-0" : "left-0"
        } h-full bg-neutral-5 text-white transition-transform duration-300 ${
          isRight
            ? isOpen
              ? "translate-x-0"
              : "translate-x-full"
            : isOpen
              ? "translate-x-0"
              : "-translate-x-full"
        } w-72`}
      >
        {children}
      </div>

      <button
        onClick={toggleSidebar}
        className={`fixed top-0 transition-transform duration-300 ${
          isRight
            ? isOpen
              ? "translate-x-[-288px] right-0"
              : "translate-x-0 right-0"
            : isOpen
              ? "translate-x-[288px] left-0"
              : "translate-x-0 left-0"
        } m-4 p-2 bg-primary-7 text-white rounded-lg`}
      >
        <PanelRight />
      </button>
    </div>
  );
}
