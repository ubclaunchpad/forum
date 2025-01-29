import { Layout, Users, Shield, LucideIcon } from "lucide-react";

export const courseSettingsConfig = {
  sections: [
    {
      id: "admin",
      label: "Admin",
      items: [
        {
          id: "course",
          label: "Course",
          path: "course",
          icon: Layout,
        },
        {
          id: "appearance",
          label: "Look and Feel",
          path: "appearance",
          icon: Layout,
        },
      ],
    },
    {
      id: "access",
      label: "Access",
      items: [
        {
          id: "members",
          label: "Members",
          path: "members",
          icon: Users,
        },
        {
          id: "permissions",
          label: "Permissions",
          path: "permissions",
          icon: Shield,
        },
      ],
    },
  ],
} as const;

// Types can be in the same file since they're tightly coupled to the config
export interface SettingsSection {
  id: string;
  label: string;
  items: SettingsItem[];
}

export interface SettingsItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
}
