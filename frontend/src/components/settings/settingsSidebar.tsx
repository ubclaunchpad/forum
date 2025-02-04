"use client";

import { courseSettingsConfig } from "@/lib/course-settings";
import { ChevronDown } from "lucide-react";
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
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function SettingsSidebar({ courseId }: { courseId: string }) {
  const pathname = usePathname();

  return (
    <Sidebar className="w-80 p-2 ">
      <SidebarHeader className="flex items-center  justify-between">
        <Link
          href={`/forum/courses/${courseId}`}
          className="flex items-center gap-2 text-left w-full text-sm text-neutral-600 font-semibold hover:text-neutral-900"
        >
          Back to Forum
        </Link>
        <SidebarTrigger />
      </SidebarHeader>

      <SidebarContent className="">
        <SidebarMenu className="gap-4">
          {courseSettingsConfig.sections.map((section) => {
            const isActive = pathname.includes(`/settings/${section.id}`);
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
                        const fullPath = `/forum/courses/${courseId}/settings/${item.path}`;

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
  );
}
