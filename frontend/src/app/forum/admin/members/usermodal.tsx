"use client";

import { Profile } from "@/lib/types/profiles";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { UserX, UserCog, Mail } from "lucide-react";

interface UserModalProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
  onRemoveUser?: (userId: string) => void;
}

export default function UserModal({
  profile,
  isOpen,
  onClose,
  onRemoveUser,
}: UserModalProps) {
  const userInfo = [
    {
      label: "Display Name",
      value:
        profile.display_name || `${profile.first_name} ${profile.last_name}`,
    },
    { label: "Username", value: profile.username },
    { label: "Email", value: profile.email },
    {
      label: "Joined At",
      value: profile.joined_at
        ? new Date(profile.joined_at).toLocaleDateString()
        : "",
    },
    { label: "First Name", value: profile.first_name },
    { label: "Last Name", value: profile.last_name },
    { label: "Pronouns", value: profile.pronouns || "N/A" },
    { label: "Timezone", value: profile.timezone || "N/A" },
    { label: "Bio", value: profile.bio || "N/A" },
    { label: "Status", value: profile.status || "N/A" },
    {
      label: "Roles",
      value: profile.roles?.map((role) => role.name).join(", ") || "N/A",
    },
  ];

  const handleRemoveUser = () => {
    if (onRemoveUser) {
      onRemoveUser(profile.id);
      onClose();
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold">
          User Details
        </DialogTitle>
      </DialogHeader>

      <div className="mt-4 overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse table-auto">
            <tbody>
              {userInfo.map((info) => (
                <tr key={info.label} className="border-b last:border-b-0">
                  <td className="border-r px-4 py-2 font-medium bg-neutral-50 w-1/3">
                    {info.label}
                  </td>
                  <td className="px-4 py-2 break-words">{info.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DialogFooter className="mt-6 flex justify-end gap-2">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => (window.location.href = `mailto:${profile.email}`)}
        >
          <Mail className="w-4 h-4" />
          Send Email
        </Button>

        <Button variant="outline" className="flex items-center gap-2">
          <UserCog className="w-4 h-4" />
          Edit User
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="solid" className="flex items-center gap-2">
              <UserX className="w-4 h-4" />
              Remove User
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently remove the
                user
                {profile.display_name && ` "${profile.display_name}"`} from the
                system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemoveUser}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remove User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogFooter>
    </>
  );
}
