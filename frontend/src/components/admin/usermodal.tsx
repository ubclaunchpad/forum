"use client";

import { Profile } from "@/lib/types/profiles";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { UserX, UserCog, Mail, User, ChevronDown } from "lucide-react";
import { useCallback, useContext, useEffect, useState } from "react";
import { getApiUrl } from "@/utils/helpers";
import { userContext } from "@/contexts/userContext";
interface UserSheetProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
  onRemoveUser?: (userId: string) => void;
}

const ProfileTab = ({ profile }: { profile: Profile }) => {
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
  ];

  return (
    <div className="mt-4 overflow-hidden bg-white rounded-xl border">
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
  );
};

const RolePermissions = ({
  permissions,
}: {
  permissions: Array<{ resource: string; action: string; modifier: string }>;
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
      {permissions.map((perm, idx) => (
        <div
          key={idx}
          className="p-2 border w-full  rounded-lg bg-white-50 text-sm"
        >
          {`${perm.action} ${perm.resource} (${perm.modifier})`}
        </div>
      ))}
    </div>
  );
};

const RolesTab = ({ profile }: { profile: Profile }) => {
  const { data, status } = useUserRoles({ userId: profile.id });
  const [openDomains, setOpenDomains] = useState<Record<string, boolean>>({});

  if (status === "loading") {
    return <div className="p-4">Loading roles...</div>;
  }

  if (status === "error") {
    return <div className="p-4 text-red-500">Error loading roles</div>;
  }

  if (!data) return null;

  // Group roles by domain using vanilla JavaScript
  const rolesByDomain = data.roles.reduce(
    (acc, role) => {
      const domain = role.domain || "Global";
      if (!acc[domain]) {
        acc[domain] = [];
      }
      acc[domain].push(role);
      return acc;
    },
    {} as Record<string, typeof data.roles>,
  );

  const sortedDomains = Object.entries(rolesByDomain).sort(([a], [b]) => {
    if (a === "Global") return -1;
    if (b === "Global") return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="mt-4 space-y-4">
      {sortedDomains.map(([domain, roles]) => (
        <Collapsible
          key={domain}
          open={openDomains[domain]}
          onOpenChange={(isOpen) =>
            setOpenDomains((prev) => ({ ...prev, [domain]: isOpen }))
          }
          className="border rounded-lg"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-neutral-50">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{domain}</h3>
              <span className="text-sm text-neutral-500">
                ({roles.length} role{roles.length !== 1 ? "s" : ""})
              </span>
            </div>
            <ChevronDown className="h-5 w-5" />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4">
            <div className="space-y-4">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="border-t pt-4 first:border-t-0 first:pt-0"
                >
                  <h4 className="font-medium mb-2">{role.name}</h4>
                  {role.description && (
                    <p className="text-sm text-neutral-600 mb-2">
                      {role.description}
                    </p>
                  )}
                  <RolePermissions permissions={role.permissions} />
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
};

const AccountTab = ({
  profile,
  onRemoveUser,
}: {
  profile: Profile;
  onRemoveUser: (userId: string) => void;
}) => {
  return (
    <div className="mt-4 space-y-4">
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Danger Zone</h3>
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
                onClick={() => onRemoveUser(profile.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remove User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default function UserSheet({
  profile,
  isOpen,
  onClose,
  onRemoveUser,
}: UserSheetProps) {
  const handleRemoveUser = (userId: string) => {
    if (onRemoveUser) {
      onRemoveUser(userId);
      onClose();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="max-w-[calc(100%,48rem)] min-w-[800px] w-full  p-6 overflow-y-scroll"
      >
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold">
            User Details
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="profile" className="mt-6 w-full">
          <TabsList className="w-full">
            <TabsTrigger
              value="profile"
              className="flex flex-1 items-center gap-2"
            >
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="roles"
              className="flex  flex-1 items-center gap-2"
            >
              <UserCog className="w-4 h-4" />
              Roles
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="flex flex-1 items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab profile={profile} />
          </TabsContent>

          <TabsContent value="roles">
            <RolesTab profile={profile} />
          </TabsContent>

          <TabsContent value="account">
            <AccountTab profile={profile} onRemoveUser={handleRemoveUser} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function useUserRoles({ userId }: { userId: string }) {
  const [data, setData] = useState<Profile>();
  const [status, setStatus] = useState<"loading" | "done" | "error" | "idle">(
    "idle",
  );
  const { token } = useContext(userContext);

  const getUser = useCallback(async () => {
    setStatus("loading");
    const res = await fetch(`${getApiUrl()}/admin/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const body = await res.json();
      setData(body);
      setStatus("done");
    } else {
      setStatus("error");
    }
  }, [userId, token]);

  useEffect(() => {
    getUser();
  }, [userId, getUser]);

  return {
    data,
    status,
  };
}
