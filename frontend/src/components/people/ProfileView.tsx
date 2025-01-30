"use client";

import { Profile } from "@/lib/types/profiles";

import {
  ArrowRightFromLine,
  Mail,
  MapPin,
  User,
  Globe,
  TextIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Dispatch, SetStateAction } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { usePathname, useRouter } from "next/navigation";

type ReadonlyProfileFieldProps = {
  label: string;
  value?: string;
  icon?: React.ReactNode;
};

function ReadOnlyProfileField({
  label,
  value,
  icon,
}: ReadonlyProfileFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        {icon && <div className=" text-neutral-500">{icon}</div>}
        {label}
      </Label>
      <div className="py-2 px-3 bg-neutral-50 select-text rounded-md text-neutral-700 min-h-[40px] flex items-center">
        {value || <span className="text-neutral-400">{value ?? "N/A"}</span>}
      </div>
    </div>
  );
}

export default function ProfileView({
  profile,
  setSelected,
}: {
  profile: Profile;
  setSelected: Dispatch<SetStateAction<string | undefined>>;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div
      className={`flex justify-center select-none flex-1 lg:border-l flex-shrink-0 w-full transition-all duration-300 ${
        true ? "border-neutral-200" : "border-neutral-200"
      }`}
    >
      <div className="flex-1 relative flex flex-col overflow-auto p-4 pt-0 items-center mx-auto">
        <div className="w-full h-16 flex-shrink-0 px-2 flex items-center gap-2">
          <div className="flex items-center justify-between w-full">
            <Button
              className="p-2"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelected(undefined);
                router.push(pathname.replace(/\/[^/]+$/, ""), {
                  scroll: false,
                });
              }}
            >
              <ArrowRightFromLine className="min-w-5 min-h-5" />
            </Button>
          </div>
        </div>

        <div className="space-y-8 px-4 flex justify-center w-full flex-1 p-4 bg-white rounded-xl border">
          <div className="space-y-8 px-4 max-w-4xl w-full p-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-60 w-60 border border-neutral-200">
                <AvatarImage src={profile.icon_url} className="object-cover" />
                <AvatarFallback>
                  {profile.first_name[0]}
                  {profile.last_name[0]}
                </AvatarFallback>
              </Avatar>

              <div className="text-center">
                <h2 className="text-2xl font-bold">{profile.display_name}</h2>
                {profile.username && (
                  <p className="text-muted-foreground">@{profile.username}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ReadOnlyProfileField
                label="First Name"
                value={profile.first_name}
                icon={<User className="w-4 h-4" />}
              />
              <ReadOnlyProfileField
                label="Last Name"
                value={profile.last_name}
                icon={<User className="w-4 h-4" />}
              />
              <ReadOnlyProfileField
                label="Email"
                value={profile.email}
                icon={<Mail className="w-4 h-4" />}
              />
              <ReadOnlyProfileField
                label="Timezone"
                value={profile.timezone}
                icon={<MapPin className="w-4 h-4" />}
              />
              <ReadOnlyProfileField
                label="Pronouns"
                value={profile.pronouns}
                icon={<User className="w-4 h-4" />}
              />
              <ReadOnlyProfileField
                label="Username"
                value={profile.username}
                icon={<User className="w-4 h-4" />}
              />
            </div>
            <ReadOnlyProfileField
              label="Bio"
              value={profile.bio}
              icon={<TextIcon className="w-4 h-4" />}
            />
            {profile.socials && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Social Links</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(profile.socials).map(([platform, url]) => (
                    <ReadOnlyProfileField
                      key={platform}
                      label={platform}
                      value={url as string}
                      icon={<Globe className="w-4 h-4" />}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
