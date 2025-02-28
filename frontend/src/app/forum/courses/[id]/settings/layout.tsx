import { SettingsSidebar } from "@/components/settings/settingsSidebar";
import SettingsTopBar from "@/components/settings/settingsTopbar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function SettingsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  return (
    <SidebarProvider>
      <div className="flex h-dvh  select-none w-full">
        <SettingsSidebar courseId={params.id} />
        <main className="flex-1 py-8 px-8 relative flex flex-col overflow-auto items-center bg-white w-full">
          <SettingsTopBar />
          <div className="container max-w-4xl ">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
