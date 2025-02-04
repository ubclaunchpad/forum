import { SettingsSidebar } from "@/components/settings/settingsSidebar";
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
        <main className="flex-1 p-8 flex flex-col overflow-auto items-center bg-white w-full">
          <div className="container max-w-4xl py-8">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
