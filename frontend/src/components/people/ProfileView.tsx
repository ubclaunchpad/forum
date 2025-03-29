"use client";

import { Profile } from "@/lib/types/profiles";

import {
  ArrowRightFromLine,
  Mail,
  MapPin,
  User,
  Globe,
  TextIcon,
  MoreHorizontal,
  DeleteIcon,
  LinkIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Dispatch, SetStateAction, useContext } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { usePathname, useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useCourseStore } from "@/providers/courseStoreProvider";
import { getApiUrl } from "@/utils/helpers";
import { userContext } from "@/providers/userContext";
import { checkPermissionInDomain, PERMISSIONS } from "@/lib/utils";

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

  const course = useCourseStore((state) => state.course);

  function closePersonTab() {
    setSelected(undefined);
    router.push(pathname.replace(/\/[^/]+$/, ""), {
      scroll: false,
    });
  }

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
              onClick={closePersonTab}
            >
              <ArrowRightFromLine className="min-w-5 min-h-5" />
            </Button>
            <ProfileMoreOptions
              userId={profile.id}
              courseId={course.id}
              closePersonTab={closePersonTab}
            />
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

function ProfileMoreOptions({
  userId,
  courseId,
  closePersonTab,
}: {
  userId: string;
  courseId: string;
  closePersonTab: () => void;
}) {
  const { toast } = useToast();
  const { token, profile } = useContext(userContext);

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  async function removeFromCourse() {
    const res = await fetch(
      `${getApiUrl()}/courses/${courseId}/members/${userId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (res.ok) {
      toast({
        title: "User removed",
        description: "If course is open user might join back. ",
      });
    }

    closePersonTab();
  }

  return (
    <Popover>
      <PopoverContent
        side="left"
        align="start"
        // alignOffset={-10}
        // sideOffset={20}
        className=" bg-white border  w-fit p-0 border-neutral-200 rounded-lg shadow-sm"
      >
        <ul className="flex p-0 flex-col text-neutral-700 w-full ">
          <li>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/forum/courses/${courseId}/people/${userId}`,
                );
                toast({
                  title: "Copied link to profile",
                });
              }}
              className=" flex gap-6 font-medium items-center border-b text-sm p-4 py-1 w-full "
            >
              <LinkIcon className="h-4 w-4 " />
              <span>Copy link to profile</span>
            </button>
          </li>
          {checkPermissionInDomain(
            profile.permissions,
            PERMISSIONS.SUSPEND_USER,
            courseId,
          ) && (
            <li>
              <button
                type="button"
                onClick={removeFromCourse}
                className="text-sm flex gap-6 font-medium items-center p-4 py-1 w-full hover:text-red-500"
              >
                <DeleteIcon className="h-4 w-4 " />
                <span>Remove from Course</span>
              </button>
            </li>
          )}
        </ul>
      </PopoverContent>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={handleMoreClick}
          className="focus:outline-none"
        >
          <MoreHorizontal className="h-5 w-5 opacity-70" />
        </button>
      </PopoverTrigger>
    </Popover>
  );
}
