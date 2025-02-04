import { 
  Layout, 
  Users, 
  Shield, 
  LucideIcon, 
  SparklesIcon, 
  BrainIcon, 
  Settings2Icon, 
  UserIcon,
  BookOpenIcon,
  FileTextIcon,
  DatabaseIcon,
  BookCopyIcon,
  ShieldAlertIcon,
  UsersIcon,
  WalletIcon,
  CogIcon,
  SearchIcon,
  ShieldIcon,
  LockKeyholeIcon,
  BookIcon,
  PaintBucketIcon,
  SlidersVerticalIcon
} from "lucide-react";

export const courseSettingsConfig = {
  sections: [
    {
      icon: CogIcon,

      id: "general",
      label: "General",
      items: [
        {
          id: "course",
          label: "Course",
          path: "general/course",
          icon: BookIcon,
        },
        {
          id: "appearance",
          label: "Appearance",
          path: "general/appearance",
          icon: PaintBucketIcon,
        },
      ],
    },
    {
      icon: SearchIcon,
      id: "ai",
      label: "AI and Search",
      items: [
        {
          id: "ai-usage",
          label: "Configurations",
          path: "ai/usage",
          icon: SlidersVerticalIcon,
        },
        {
          id: "ai-context",
          label: "Memory",
          path: "ai/context",
          icon: BookCopyIcon,
        },
        {
          id: "ai-advanced",
          label: "Billing",
          path: "ai/billing",
          icon: WalletIcon,
        },
      ],
    },
    {
      icon: ShieldIcon,
      id: "admin",
      label: "Admin",
      items: [
        {
          id: "admin-members",
          label: "Members",
          path: "admin/members",
          icon: Users,
        },
        {
          id: "admin-permissions",
          label: "Permissions",
          path: "admin/permissions",
          icon: LockKeyholeIcon,
        },
        {
          id: "admin-course",
          label: "Course",
          path: "admin/course",
          icon: ShieldAlertIcon
        },
      ],
    },
  ],
} as const;

// Types
export interface SettingsSection {
  id: string;
  label: string;
  items: SettingsItem[];
  icon: LucideIcon;
}

export interface SettingsItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
}