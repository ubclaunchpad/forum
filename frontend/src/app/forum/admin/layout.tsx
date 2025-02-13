"use client";

import { userContext } from "@/contexts/userContext";
import { ReactNode, useContext } from "react";
import {
  ChevronDown,
  GiftIcon,
  LockIcon,
  LucideIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTrigger,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const { user, profile } = useContext(userContext);

  return (
    <SidebarProvider>
      <div className="flex h-dvh  select-none w-full">
        <Sidebar className="w-80 p-2 ">
          <SidebarHeader className="flex items-center  justify-between">
            {/* <Link
          href={`/forum/courses/${courseId}`}
          className="flex items-center gap-2 text-left w-full text-sm text-neutral-600 font-semibold hover:text-neutral-900"
        >
          Back to Forum
        </Link> */}
            <SidebarTrigger />
          </SidebarHeader>

          <SidebarContent className="">
            <SidebarMenu className="gap-4">
              {settingOptions.sections.map((section) => {
                // const isActive = pathname.includes(`/settings/${section.id}`);
                const SectionIcon = section.icon || ChevronDown;

                return (
                  <Collapsible
                    key={section.id}
                    defaultOpen
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="">
                          <SectionIcon className="h-4 w-4" />
                          <span>{section.label}</span>
                          <ChevronDown className="ml-auto h-4 w-4 transform transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub className="gap-3">
                          {section.items.map((item) => {
                            const Icon = item.icon;
                            const fullPath = `/forum/admin/${item.path}`;

                            return (
                              <SidebarMenuSubItem key={item.id}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={pathname === fullPath}
                                >
                                  <Link href={fullPath}>
                                    <Icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 py-8 px-8 relative flex flex-col overflow-auto items-center bg-white w-full">
          <div className="container max-w-4xl ">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}

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

const settingOptions = {
  sections: [
    {
      id: "access",
      label: "Access",
      icon: LockIcon,
      path: "access",
      items: [
        {
          id: "members",
          label: "Members",
          path: "members",
          icon: UsersIcon,
        },
        {
          id: "invites",
          label: "Invites",
          path: "invites",
          icon: GiftIcon,
        },
      ],
    },
  ],
};
