"use client";

import { Mail, MapPin, User, Globe, TextIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { useContext, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { userContext } from "@/contexts/userContext";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/utils/helpers";
import { Role } from "@/lib/types/profiles";

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
        {icon && <div className=" text-neutral-500">{icon}</div>}
        {label}
      </Label>
      {type === "input" ? (
        <div className="relative">
          <Input
            disabled={!editMode}
            name={name}
            value={value}
            onChange={onChange}
            className="border select-text border-neutral-200 disabled:bg-neutral-50 disabled:opacity-100"
          />
        </div>
      ) : (
        <Textarea
          disabled={!editMode}
          name={name}
          value={value}
          onChange={onChange}
          className="min-h-[100px] border select-text border-neutral-200 disabled:bg-neutral-50 disabled:opacity-100"
        />
      )}
    </div>
  );
}

export default function ProfileFullView() {
  const { profile, token } = useContext(userContext);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(profile);
  const { toast } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${getApiUrl()}/users/me/photo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload photo");

      const data = await res.json();
      setFormData((prev) => ({
        ...prev,
        icon_url: data.properties.icon_url,
      }));

      toast({
        title: "Success",
        description: "Profile photo updated successfully",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to upload profile photo",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async () => {
    const { id, email, icon_url, ...changes } = formData;
    try {
      const res = await fetch(`${getApiUrl()}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(changes),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const data = await res.json();

      setFormData((prev) => ({ ...prev, ...data, id, email, icon_url }));

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex justify-center select-none flex-1  flex-shrink-0 w-full transition-all duration-300 border-neutral-200">
      <div className="space-y-8 px-4 flex flex-col items-center w-full flex-1 p-4 ">
        <div className="space-y-4 px-4 max-w-4xl w-full p-4">
          <div className="flex flex-col items-center space-y-2">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-60 w-60 border shadow-sm ">
                <AvatarImage
                  src={formData.icon_url}
                  className="object-cover  "
                />
                <AvatarFallback>
                  {formData.first_name[0]}
                  {formData.last_name[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col items-center gap-2">
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer border-2 text-sm  rounded-full p-2 px-6 border-neutral-950 text-neutral-950 hover:bg-neutral-950  hover:text-neutral-50 font-medium"
                >
                  Change Profile Photo
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <p className="text-sm text-neutral-500 text-center">
                  Recommended: Square image, at least 400x400px
                  <br />
                  JPG, PNG, GIF or WebP
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold">{profile.display_name}</h2>
              {profile.username && (
                <p className="text-muted-foreground">@{profile.username}</p>
              )}
            </div>
          </div>

          {formData.roles && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">Roles</Label>
              <div className="flex flex-wrap gap-2">
                {(formData.roles as Role[]).map((role, index) => (
                  <div
                    key={index}
                    className="px-3 py-1 text-sm bg-neutral-100 rounded-full"
                  >
                    {role.name}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileField
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              editMode={editMode}
              icon={<User className="w-4 h-4" />}
            />
            <ProfileField
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              editMode={editMode}
              icon={<User className="w-4 h-4" />}
            />
            <ProfileField
              label="Email"
              name="email"
              value={formData.email || ""}
              onChange={handleInputChange}
              editMode={editMode}
              icon={<Mail className="w-4 h-4" />}
            />
            <ProfileField
              label="Timezone"
              name="timezone"
              value={formData.timezone || ""}
              onChange={handleInputChange}
              editMode={editMode}
              icon={<MapPin className="w-4 h-4" />}
            />
            <ProfileField
              label="Pronouns"
              name="pronouns"
              value={formData.pronouns || ""}
              onChange={handleInputChange}
              editMode={editMode}
              icon={<User className="w-4 h-4" />}
            />
            <ProfileField
              label="Username"
              name="username"
              value={formData.username ?? ""}
              onChange={handleInputChange}
              editMode={editMode}
              icon={<User className="w-4 h-4" />}
            />
          </div>
          <ProfileField
            label="Bio"
            name="bio"
            value={formData.bio || ""}
            onChange={handleInputChange}
            editMode={editMode}
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
                    editMode={editMode}
                    icon={<Globe className="w-4 h-4" />}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="w-full max-w-4xl h-16 flex-shrink-0 px-2 flex  justify-end items-center gap-2">
          {editMode && (
            <Button
              variant="outline"
              className="hover:bg-neutral-950 text-sm hover:text-neutral-50 text-neutral-950 border-neutral-950"
              onClick={() => {
                setFormData(profile);
                setEditMode(!editMode);
              }}
            >
              Cancel
            </Button>
          )}
          <Button
            variant="outline"
            className="hover:bg-neutral-950 text-sm hover:text-neutral-50 text-neutral-950 border-neutral-950"
            onClick={() => {
              if (editMode) {
                handleUpdate();
              }

              setEditMode(!editMode);
            }}
          >
            {editMode ? "Save" : "Edit Profile"}
          </Button>
        </div>
      </div>
    </div>
  );
}
