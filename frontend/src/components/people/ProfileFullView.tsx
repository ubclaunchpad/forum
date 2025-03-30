"use client";

import {
  Mail,
  MapPin,
  User,
  Globe,
  TextIcon,
  UserIcon,
  MailIcon,
  PencilIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { useContext, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { userContext } from "@/providers/userContext";
import { getApiUrl } from "@/utils/helpers";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { toast } from "sonner";
import Link from "next/link";

type ProfileFieldProps = {
  label: string;
  value: string;
  name: string;
  icon?: React.ReactNode;
  editMode?: boolean;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  type?: "input" | "textarea";
};

function ProfileField({
  label,
  value,
  name,
  icon,
  editMode = false,
  onChange,
  type = "input",
}: ProfileFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        {icon && <div className=" text-primary-600">{icon}</div>}
        {label}
      </Label>
      {type === "input" ? (
        <div className="relative">
          <Input
            disabled={!editMode}
            name={name}
            value={value}
            onChange={onChange}
            className="border rounded-xl select-text bg-neutral-0 border-neutral-200 disabled:bg-neutral-50 disabled:opacity-100"
          />
        </div>
      ) : (
        <Textarea
          disabled={!editMode}
          name={name}
          value={value}
          onChange={onChange}
          className="min-h-[100px] border select-text bg-neutral-0 border-neutral-200 disabled:bg-neutral-50 disabled:opacity-100 rounded-xl"
        />
      )}
    </div>
  );
}

export default function ProfileFullView() {
  const { profile, token, refetchProfile } = useContext(userContext);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState(profile);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    const { id, email, avatar_url, ...changes } = formData;
    try {
      const res = await fetch(`${getApiUrl()}/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(changes),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const data = await res.json();

      setFormData((prev) => ({ ...prev, ...data, id, email, avatar_url }));

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditMode(false);
      refetchProfile();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  if (!isEditMode) {
    return (
      <div className="flex flex-col items-center w-full flex-1">
        <ProfileViewPage
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
        />
      </div>
    );
  }

  return (
    <div className="flex justify-center select-none flex-1  shrink-0 w-full transition-all duration-300 border-neutral-200">
      <div className="space-y-8 px-4 flex flex-col items-center w-full flex-1 p-4 ">
        <div className="space-y-4 px-4 max-w-4xl w-full p-4">
          <div className="flex flex-col items-center space-y-2">
            <div className="flex flex-col items-center gap-4">
              <AvatarEditButton />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12">
            <ProfileField
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              editMode={isEditMode}
              icon={<User className="w-4 h-4" />}
            />
            <ProfileField
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              editMode={isEditMode}
              icon={<User className="w-4 h-4" />}
            />
            <ProfileField
              label="Email"
              name="email"
              value={formData.email || ""}
              onChange={handleInputChange}
              editMode={isEditMode}
              icon={<Mail className="w-4 h-4" />}
            />
            <ProfileField
              label="Timezone"
              name="timezone"
              value={formData.timezone || ""}
              onChange={handleInputChange}
              editMode={isEditMode}
              icon={<MapPin className="w-4 h-4" />}
            />
            <ProfileField
              label="Pronouns"
              name="pronouns"
              value={formData.pronouns || ""}
              onChange={handleInputChange}
              editMode={isEditMode}
              icon={<User className="w-4 h-4" />}
            />
            <ProfileField
              label="Username"
              name="username"
              value={formData.username ?? ""}
              onChange={handleInputChange}
              editMode={isEditMode}
              icon={<User className="w-4 h-4" />}
            />
          </div>
          <ProfileField
            label="Bio"
            name="bio"
            value={formData.bio || ""}
            onChange={handleInputChange}
            editMode={isEditMode}
            type="textarea"
            icon={<TextIcon className="w-4 h-4" />}
          />

          {formData.socials && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Social Links</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(formData.socials).map(([platform, url]) => (
                  <ProfileField
                    key={platform}
                    label={platform}
                    name={`socials.${platform}`}
                    value={url as string}
                    onChange={handleInputChange}
                    editMode={isEditMode}
                    icon={<Globe className="w-4 h-4" />}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="w-full max-w-4xl h-16 shrink-0 px-2 flex  justify-end items-center gap-2">
          {isEditMode && (
            <Button
              variant="outline"
              className="hover:bg-neutral-950 text-sm hover:text-neutral-50 text-neutral-950 border-neutral-950"
              onClick={() => {
                setFormData(profile);
                setIsEditMode(!isEditMode);
              }}
            >
              Cancel
            </Button>
          )}
          <Button
            variant="outline"
            className="hover:bg-neutral-950 text-sm hover:text-neutral-50 text-neutral-950 border-neutral-950"
            onClick={() => {
              if (isEditMode) {
                handleUpdate();
              }

              setIsEditMode(!isEditMode);
            }}
          >
            {isEditMode ? "Save" : "Edit Profile"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export const ProfileViewPage = ({
  setIsEditMode,
}: {
  setIsEditMode: (isEditMode: boolean) => void;
}) => {
  const { profile } = useContext(userContext);
  return (
    <div className="flex flex-col items-center gap-12 justify-center max-w-3xl w-full">
      <div className="flex gap-4 w-full  gap-12">
        <AvatarEditButton />
        <section className="flex flex-1 flex-col pt-4 gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">{profile.display_name}</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditMode(true)}
            >
              Edit Profile
            </Button>
          </div>
          <p className="text-muted-foreground font-medium">
            @{profile.username}
          </p>
          <div className="flex flex-row  *:max-w-[150px] *:min-w-[150px] gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex flex-row items-center font-medium text-primary-600 gap-2">
                <p>Pronouns</p>
                <p className="text-sm">
                  <UserIcon className="w-4 h-4" />
                </p>
              </div>
              <p className="text-sm">
                {profile.pronouns ? profile.pronouns : "Not set"}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-row items-center font-medium text-primary-600 gap-2">
                <p className="text-primary-600 font-medium">Email</p>
                <p className="text-sm">
                  <MailIcon className="w-4 h-4" />
                </p>
              </div>
              <Link
                href={`mailto:${profile.email}`}
                className="text-sm hover:underline"
              >
                {profile.email}
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-row items-center font-medium text-primary-600 gap-2">
                <p className="text-primary-600 font-medium">Timezone</p>
                <p className="text-sm">
                  <MapPin className="w-4 h-4" />
                </p>
              </div>
              <p className="text-sm">
                {profile.timezone ? profile.timezone : "Not set"}
              </p>
            </div>
          </div>
        </section>
      </div>
      <div className="flex w-full flex-col gap-8">
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Bio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{profile.bio}</p>
          </CardContent>
        </Card>

        {/* <Card className="shadow-xs">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Enrolled courses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex py-4 overflow-x-auto gap-4">
                    <CourseCard />
                    <CourseCard />
                    <CourseCard />
                    <CourseCard />
                    <CourseCard />
                    <CourseCard />
                    </div>
                  </CardContent>
                </Card> */}
      </div>
    </div>
  );
};

// function CourseCard() {
//   return (
//     <Card className="w-full shadow-md min-w-[200px] select-none user-">
//       <CardHeader>
//         <CardTitle className="text-md font-medium">Enrolled courses</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <p className="text-sm">Course name</p>
//       </CardContent>
//     </Card>
//   );
// }

function AvatarEditButton() {
  const [edittingPhoto, setEdittingPhoto] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const { profile, token, refetchProfile } = useContext(userContext);

  const handlePhotoUpload = async () => {
    if (!photo) return;

    const formData = new FormData();
    formData.append("file", photo);

    try {
      const res = await fetch(`${getApiUrl()}/users/${profile.id}/photo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload photo");

      await refetchProfile();

      toast.success("Profile photo updated successfully");
      setEdittingPhoto(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload profile photo");
    }
  };

  return (
    <div className="flex relative rounded-full border flex-col items-center gap-4">
      <Avatar className="h-40 w-40 border shadow-xs ">
        <AvatarImage src={profile.avatar_url} className="object-cover  " />
        <AvatarFallback>
          {profile.first_name[0]}
          {profile.last_name[0]}
        </AvatarFallback>
      </Avatar>

      <Dialog open={edittingPhoto} onOpenChange={setEdittingPhoto}>
        <DialogTrigger asChild>
          <button
            className="absolute bottom-0 border border-primary-100 bg-primary-50 rounded-full p-2 right-0"
            onClick={() => setEdittingPhoto(true)}
          >
            <PencilIcon className="w-4 h-4 text-primary-600" />
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Profile Photo</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-2 gap-y-4 pt-12">
            <div className="flex relative rounded-full border flex-col items-center  gap-4">
              <Avatar className="h-40 w-40 border shadow-xs ">
                <AvatarImage src={photo ? URL.createObjectURL(photo) : ""} />
                <AvatarFallback className="bg-neutral-100 text-neutral-500"></AvatarFallback>
              </Avatar>
            </div>

            <label
              htmlFor="photo-upload"
              className="cursor-pointer border-2 text-sm  rounded-full p-2 px-6 border-neutral-950 text-neutral-950 hover:bg-neutral-950  hover:text-neutral-50 font-medium"
            >
              {photo ? "Change Photo" : "Upload Photo"}
            </label>
            <p className="text-sm text-neutral-700 text-center max-w-sm py-4">
              We recommend a square image, at least 400x400px. Only JPG, PNG,
              GIF or WebP are supported.
            </p>

            <input
              id="photo-upload"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={(e) => {
                if (!e.target.files || !e.target.files[0]) return;
                setPhoto(e.target.files[0]);
              }}
              className="hidden"
            />

            <div className="flex flex-row w-full border-t border-neutral-200 justify-end gap-2 pt-4 min-h-20 items-center">
              {photo && (
                <>
                  <Button
                    variant="outline"
                    className="hover:bg-neutral-950 text-sm hover:text-neutral-50 text-neutral-950 border-neutral-950"
                    onClick={() => setEdittingPhoto(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    className="hover:bg-neutral-950 text-sm hover:text-neutral-50 text-neutral-950 border-neutral-950"
                    onClick={() => handlePhotoUpload()}
                  >
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
