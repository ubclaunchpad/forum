import {
  // Users,
  LucideIcon,
  // BookCopyIcon,
  CogIcon,
  // SearchIcon,
  // ShieldIcon,
  // LockKeyholeIcon,
  BookIcon,
  PaintBucketIcon,
  FlaskConicalIcon,
  // SlidersVerticalIcon,
} from "lucide-react";

export const courseSettingsConfig = {
  sections: [
    {
      icon: CogIcon,
      path: "general",
      id: "general",
      label: "General",
      items: [
        {
          id: "course",
          label: "Course",
          path: "general#course",
          icon: BookIcon,
        },
        {
          id: "appearance",
          label: "Appearance",
          path: "general#appearance",
          icon: PaintBucketIcon,
        },
        {
          id: "features",
          label: "Experimental Features",
          path: "general#features",
          icon: FlaskConicalIcon,
        },
      ],
    },
    // {
    //   icon: SearchIcon,
    //   id: "ai",
    //   label: "AI and Search",
    //   items: [
    //     {
    //       id: "ai-usage",
    //       label: "Configurations",
    //       path: "ai/usage",
    //       icon: SlidersVerticalIcon,
    //     },
    //     {
    //       id: "ai-context",
    //       label: "Memory",
    //       path: "ai/context",
    //       icon: BookCopyIcon,
    //     },
    //   ],
    // },
    // {
    //   icon: ShieldIcon,
    //   id: "access",
    //   label: "Access",
    //   items: [
    //     {
    //       id: "access-members",
    //       label: "Members",
    //       path: "access/members",
    //       icon: Users,
    //     },
    //     {
    //       id: "access-permissions",
    //       label: "Permissions",
    //       path: "admin/permissions",
    //       icon: LockKeyholeIcon,
    //     },
    //   ],
    // },
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

export const colorOptions = [
  // Core Colors
  { value: "#2563EB", label: "Blue" },
  { value: "#10B981", label: "Green" },
  { value: "#8B5CF6", label: "Purple" },
  { value: "#EF4444", label: "Red" },
  { value: "#F59E0B", label: "Orange" },
  { value: "#EC4899", label: "Pink" },

  // Supplementary Colors
  { value: "#0891B2", label: "Cyan" },
  { value: "#14B8A6", label: "Teal" },

  // Monochrome
  { value: "#111827", label: "Dark" },
  { value: "#374151", label: "Gray" },
];

export const fontOptions = [
  { value: "default", label: "Quicksand", className: "font-quicksand" },
  { value: "nunito", label: "Nunito", className: "font-nunito" },
  { value: "roboto", label: "Roboto", className: "font-roboto" },
  { value: "lato", label: "Lato", className: "font-lato" },
  { value: "inter", label: "Inter", className: "font-inter" },
  {
    value: "space-grotesk",
    label: "Space Grotesk",
    className: "font-space-grotesk",
  },
  {
    value: "source-serif-pro",
    label: "Source Serif Pro",
    className: "font-source-serif",
  },
  { value: "roboto-mono", label: "Roboto Mono", className: "font-roboto-mono" },
  { value: "fira-code", label: "Fira Code", className: "font-fira-code" },
];

export const featureFlags = [
  {
    id: "posts_enabled",
    label: "Posts",
    description: "Enable post creation and sharing",
    readonly: true,
  },
  {
    id: "documents_enabled",
    label: "Documents",
    description: "Enable document uploads and management",
    readonly: true,
  },
  {
    id: "chat_enabled",
    label: "Chat",
    description: "Enable real-time chat functionality",
    readonly: true,
  },
  {
    id: "ai_enabled",
    label: "AI",
    description: "Enable AI-powered features",
    readonly: true,
  },
  {
    id: "directory_enabled",
    label: "People Directory",
    description: "Enable course member directory",
    readonly: true,
  },
  {
    id: "dark_mode_enabled",
    label: "Dark Mode Support",
    description: "Allow users to switch to dark mode",
    readonly: true,
  },
];
