"use client";

import { Profile } from "@/lib/types/profiles";
import SettingsTitleHeader from "@/components/settings/SettingsTitleHeader";
import { useContext, useState } from "react";
import { ArrowRightIcon } from "lucide-react";
import { getApiUrl } from "@/utils/helpers";
import { userContext } from "@/contexts/userContext";
import UserSheet from "./usermodal";

export default function MembersTable({ users }: { users: Profile[] }) {
  const [listOfUsers, setListOfUsers] = useState(users);
  const { token } = useContext(userContext);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUserClick = (user: Profile) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <>
      <div className="container mx-auto  overflow-hidden">
        <SettingsTitleHeader title="Members" description="Everyone in Forum" />
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
                          maxWidth: column.maxWidth,
                        }}
                      >
                        {column.label}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {listOfUsers.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="border first:border-l-0 last:border-r-0 px-4 py-2">
                      <button
                        className="flex flex-1 items-center justify-center"
                        onClick={() => handleUserClick(user)}
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
                            maxWidth: column.maxWidth,
                          }}
                        >
                          {column.getValue(user) == ""
                            ? "N/A"
                            : column.getValue(user)}
                        </td>
                      ))}
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={columns.filter((c) => c.visible).length + 1} // +1 for selector
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

      {selectedUser && (
        <UserSheet
          profile={selectedUser}
          isOpen={isModalOpen}
          onClose={closeModal}
          onRemoveUser={async (userId) => {
            await fetch(`${getApiUrl()}/admin/users/${userId}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            setListOfUsers((prev) => prev.filter((p) => p.id !== userId));
          }}
        />
      )}
    </>
  );
}

const columns = [
  {
    key: "displayName",
    label: "Display Name",
    type: "string",
    visible: true,
    minWidth: "150px",
    getValue: (user: Profile) =>
      user.display_name || user.first_name + " " + user.last_name,
  },
  {
    key: "username",
    label: "Username",
    type: "string",
    visible: true,
    minWidth: "150px",
    getValue: (user: Profile) => user.username,
  },
  {
    key: "email",
    label: "Email",
    type: "email",
    visible: true,
    minWidth: "200px",
    getValue: (user: Profile) => user.email,
  },
  {
    key: "joinedAt",
    label: "Joined At",
    type: "date",
    visible: true,
    minWidth: "150px",
    getValue: (user: Profile) => user.joined_at,
  },
  {
    key: "firstName",
    label: "First Name",
    type: "string",
    visible: true,
    minWidth: "150px",
    getValue: (user: Profile) => user.first_name,
  },
  {
    key: "lastName",
    label: "Last Name",
    type: "string",
    visible: true,
    minWidth: "150px",
    getValue: (user: Profile) => user.last_name,
  },
  {
    key: "pronouns",
    label: "Pronouns",
    type: "string",
    visible: true,
    minWidth: "100px",
    getValue: (user: Profile) => user.pronouns,
  },
  {
    key: "timezone",
    label: "Timezone",
    type: "string",
    visible: true,
    minWidth: "100px",
    getValue: (user: Profile) => user.timezone,
  },
  {
    key: "bio",
    label: "Bio",
    type: "string",
    visible: true,
    minWidth: "200px",
    maxWidth: "300px",
    getValue: (user: Profile) => user.bio,
  },
  {
    key: "status",
    label: "Status",
    type: "string",
    visible: true,
    minWidth: "100px",
    getValue: (user: Profile) => user.status,
  },
  {
    key: "iconUrl",
    label: "Icon URL",
    type: "string",
    visible: false,
    minWidth: "200px",
    getValue: (user: Profile) => user.icon_url,
  },
  {
    key: "roles",
    label: "Roles",
    type: "array",
    visible: true,
    minWidth: "150px",
    getValue: (user: Profile) =>
      user.roles?.map((role) => role.name).join(", "),
  },
  {
    key: "permissions",
    label: "Permissions",
    type: "array",
    visible: false,
    minWidth: "200px",
    getValue: (user: Profile) =>
      user.permissions
        .map((perm) => `${perm.resource}:${perm.action}`)
        .join(", "),
  },
];
