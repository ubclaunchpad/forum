"use client";
import { Profile } from "@/lib/types/profiles";
import { cn } from "@/lib/utils";
import { PeopleSidebar } from "./PeopleSidebar";
import ProfileView from "./ProfileView";
import { useState } from "react";

export const PeoplePage = ({
  profiles,
  initialProfile,
}: {
  profiles: Profile[];
  initialProfile?: string;
}) => {
  const [selected, setSelected] = useState(initialProfile);

  const profile = profiles.find((p) => p.id === selected);
  return (
    <div className="flex flex-1  overflow-hidden bg-neutral-50 ">
      <div
        className={cn(
          "relative flex flex-col",
          "hidden md:block md:min-w-[min(280px,100%)] w-full max-w-0 lg:max-w-[280px] border-r",
          initialProfile ? "hidden xl:block" : "",
        )}
      >
        {/* <div className="flex flex-row justify-center items-center w-full h-16 px-2">
          <Button
            disabled
            className="disabled w-full max-w-[150px] min-h-none h-fit py-2"
            // onClick={() => {}}
          >
            Invite
          </Button>
        </div> */}

        <div className="flex flex-row justify-center items-center w-full h-16 px-2"></div>
      </div>
      <PeopleSidebar
        profiles={profiles}
        selected={selected}
        setSelected={setSelected}
      />
      {profile && <ProfileView profile={profile} setSelected={setSelected} />}
    </div>
  );
};
