"use client";
import { cn } from "@/lib/utils";
import { PersonCard } from "./PersonCard";
import { Profile } from "@/lib/types/profiles";
import {
  useRef,
  useEffect,
  useCallback,
  useContext,
  Dispatch,
  SetStateAction,
} from "react";
import { userContext } from "@/providers/userContext";

export function PeopleSidebar({
  profiles,
  setSelected,
  selected,
}: {
  profiles: Profile[];
  setSelected: Dispatch<SetStateAction<string | undefined>>;
  selected?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0);
  const { user, profile } = useContext(userContext);
  const otherProfiles = profiles.filter((p) => p.id !== user.id);

  useEffect(() => {
    const savedScroll = sessionStorage.getItem("peopleListScroll");
    if (savedScroll && scrollRef.current) {
      scrollRef.current.scrollTop = parseInt(savedScroll);
    }
  }, []);

  // Track current scroll position in ref
  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      scrollPositionRef.current = scrollRef.current.scrollTop;
    }
  }, []);

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      style={{ scrollBehavior: "auto" }}
      className={cn(
        "relative flex flex-1 flex-col overflow-auto",
        "min-w-[min(500px,100%)] w-full xl:max-w-[500px] border-r",
        selected ? "hidden xl:block" : "",
      )}
    >
      <div className="h-16" />
      <ul className="flex flex-col gap-2 p-2 w-full border-t">
        <PersonCard
          setSelected={setSelected}
          key={profile.id}
          profile={profile}
          isSelected={selected === profile.id}
        />
        <div className="w-full border-t"></div>
        {otherProfiles.map((user) => (
          <PersonCard
            key={user.id}
            profile={user}
            setSelected={setSelected}
            isSelected={selected === user.id}
          />
        ))}
      </ul>
    </div>
  );
}
