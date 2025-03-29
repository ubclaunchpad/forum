"use client";
import { cn, getDisplayname } from "@/lib/utils";
import { Profile } from "@/lib/types/profiles";
import { useRouter, usePathname } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export const PersonCard = ({
  profile,
  isSelected,
  setSelected,
}: {
  setSelected: Dispatch<SetStateAction<string | undefined>>;
  profile: Profile;
  isSelected: boolean;
}) => {
  const pathname = usePathname();

  const router = useRouter();
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    setSelected(profile.id);
    const newPath = pathname.includes("/people/")
      ? pathname.replace(/\/people\/[^/]+$/, `/people/${profile.id}`)
      : `${pathname}/${profile.id}`;

    // Save current scroll position before navigation
    const container = e.currentTarget.closest('[class*="overflow-auto"]');
    if (container instanceof HTMLElement) {
      sessionStorage.setItem(
        "peopleListScroll",
        container.scrollTop.toString(),
      );
    }
    router.push(newPath, { scroll: false });
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      className={cn(
        "text-left relative border transition-all duration-500   rounded-lg flex flex-col w-full",
        isSelected
          ? "bg-primary-50 border-primary-200 shadow-xs shadow-primary-200"
          : "border-neutral-200 bg-white",
      )}
    >
      <div className="flex items-center  p-2 px-4 w-full gap-4 pb-2">
        <div
          className={cn(
            "w-12 h-12  relative overflow-hidden flex items-center justify-center shrink-0 text-neutral-300 bg-neutral-50  rounded-full",
            isSelected
              ? "border-primary-200  text-primary-200"
              : "border-neutral-200",
          )}
        >
          <Avatar className="w-12 h-12 bg-neutral-50 border">
            <AvatarImage src={profile.icon_url} className="object-cover" />
            <AvatarFallback className="bg-neutral-50">
              {profile.first_name[0]}
              {profile.last_name[0]}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex  gap-2 flex-col">
          <p className="text-sm font-semibold">{getDisplayname(profile)}</p>
          <p className="text-sm font-medium">{profile.email}</p>

          <p className=" font-medium text-xs shrink-0 ">
            {profile.pronouns && profile.pronouns}
          </p>
          <p className=" font-medium text-xs shrink-0 ">
            {profile.status && profile.status}
          </p>
        </div>
      </div>
    </div>
  );
};
