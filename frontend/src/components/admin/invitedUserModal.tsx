"use client";

export type InvitedUser = {
  referrer_id: string;
  referred_email: string;
  invited_at: string;
  joined_at: string;
};

import {
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
import { UserX } from "lucide-react";

interface UserModalProps {
  invitedUser: InvitedUser;
  isOpen: boolean;
  onClose: () => void;
  onRevokeInvite?: (email: string) => void;
}

export default function InvitedUserModal({
  invitedUser,
  // isOpen,
  onClose,
  onRevokeInvite,
}: UserModalProps) {
  const userInfo = [
    { label: "Email", value: invitedUser.referred_email },
    {
      label: "Invited At",
      value: new Date(invitedUser.invited_at).toLocaleDateString(),
    },
    {
      label: "Joined At",
      value: invitedUser.joined_at
        ? new Date(invitedUser.joined_at).toLocaleDateString()
        : "Not joined yet",
    },
  ];

  const handleRevokeInvite = () => {
    if (onRevokeInvite) {
      onRevokeInvite(invitedUser.referred_email);
      onClose();
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold">
          Invited User Details
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
        {!invitedUser.joined_at && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="solid" className="flex items-center gap-2">
                <UserX className="w-4 h-4" />
                Revoke Invite
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently revoke the
                  invitation sent to
                  {` ${invitedUser.referred_email}`}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleRevokeInvite}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Revoke Invite
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </DialogFooter>
    </>
  );
}
