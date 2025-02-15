"use client";

import { InvitedUser } from "@/lib/types/profiles";
import SettingsTitleHeader from "@/components/settings/SettingsTitleHeader";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useContext, useState } from "react";
import { ArrowRightIcon, Plus } from "lucide-react";
import { getApiUrl } from "@/utils/helpers";
import { userContext } from "@/contexts/userContext";
import InvitedUserModal from "./invitedUserModal";
import { Button } from "@/components/ui/button";
import InviteModal from "./InviteModal";

export default function InvitesTable({ invites }: { invites: InvitedUser[] }) {
  const [listOInvites, setListOfInvites] = useState(invites);
  const { token } = useContext(userContext);
  const [selectedInvite, setSelectedInvite] = useState<InvitedUser | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const handleUserClick = (invite: InvitedUser) => {
    setSelectedInvite(invite);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedInvite(null);
  };

  return (
    <>
      <div className="container mx-auto  overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <SettingsTitleHeader
            title="Invites"
            description="List of invited users"
          />
          <Button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Invite User
          </Button>
        </div>
        <div className="overflow-hidden rounded-xl border text-sm select-text">
          <div className="overflow-x-auto  select-text">
            <table className="min-w-[1200px]  border-collapse table-auto rounded-xl">
              <thead>
                <tr className="bg-neutral-50">
                  <th className=" px-4 py-2"></th>
                  {columns
                    .filter((c) => c.visible)
                    .map((column) => (
                      <th
                        key={column.key}
                        className=" px-4 py-2 font-medium text-left"
                        style={{
                          minWidth: column.minWidth,
                          //   maxWidth: column.maxWidth,
                        }}
                      >
                        {column.label}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {listOInvites.map((invite) => (
                  <tr key={invite.referred_email} className="border-b">
                    <td className="border first:border-l-0 last:border-r-0 px-4 py-2">
                      <button
                        className="flex flex-1 items-center justify-center"
                        onClick={() => handleUserClick(invite)}
                      >
                        <ArrowRightIcon className="text-neutral-600 w-4 h-4 hover:text-primary" />
                      </button>
                    </td>
                    {columns
                      .filter((c) => c.visible)
                      .map((column) => (
                        <td
                          key={column.key}
                          className="border first:border-l-0 last:border-r-0 px-4 py-2 break-words"
                          style={{
                            minWidth: column.minWidth,
                            // maxWidth: column.maxWidth,
                          }}
                        >
                          {column.getValue(invite) == ""
                            ? "N/A"
                            : column.getValue(invite)}
                        </td>
                      ))}
                  </tr>
                ))}
                {invites.length === 0 && (
                  <tr>
                    <td
                      colSpan={columns.filter((c) => c.visible).length + 1}
                      className="border px-4 py-2 text-center"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl">
          {selectedInvite && (
            <InvitedUserModal
              invitedUser={selectedInvite}
              isOpen={isModalOpen}
              onClose={closeModal}
              onRevokeInvite={async (email) => {
                await fetch(`${getApiUrl()}/invites/${email}`, {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });
                setListOfInvites((prev) =>
                  prev.filter((p) => p.referred_email !== email),
                );
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="max-w-md">
          <InviteModal
            onClose={() => setShowInviteModal(false)}
            onSubmit={async (email) => {
              const response = await fetch(`${getApiUrl()}/invites`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: email }),
              });

              if (!response.ok) {
                throw new Error("Failed to send invite");
              }

              const newInvite = await response.json();
              setListOfInvites((prev) => [...prev, newInvite]);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

const columns = [
  {
    key: "email",
    label: "Invited Email",
    type: "email",
    visible: true,
    minWidth: "200px",
    getValue: (user: InvitedUser) => user.referred_email,
  },
  {
    key: "joinedAt",
    label: "Joined At",
    type: "date",
    visible: true,
    minWidth: "150px",
    getValue: (user: InvitedUser) => user.joined_at,
  },
  {
    key: "invitedAt",
    label: "Invited At",
    type: "date",
    visible: true,
    minWidth: "150px",
    getValue: (user: InvitedUser) => user.invited_at,
  },
  {
    key: "referrerEmail",
    label: "Referred By",
    type: "date",
    visible: true,
    minWidth: "150px",
    getValue: (user: InvitedUser) => user.referrer_id,
  },
];
