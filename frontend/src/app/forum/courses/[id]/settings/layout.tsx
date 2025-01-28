"use client";

import { courseSettingsConfig } from "@/lib/course-settings";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { useSearchParams } from "next/navigation";

export default function SettingsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const currentSection = searchParams.get("section") || "course";

  return (
    <div className="flex h-screen bg-white">
      <div className="w-64 border-r border-neutral-200">
        <div className="p-4 border-b border-neutral-200">
          <Link
            href={`/forum/courses/${id}`}
            className="flex items-center text-sm text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Forum
          </Link>
        </div>
        <nav className="p-4">
          {courseSettingsConfig.sections.map((section) => (
            <div key={section.id} className="mb-6">
              <h3 className="mb-2 px-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                {section.label}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.id}
                      href={`?section=${item.id}`}
                      scroll={false}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
                        "data-[active=true]:bg-neutral-100 data-[active=true]:text-neutral-900",
                      )}
                      data-active={item.id === currentSection}
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto py-8 px-8">{children}</div>
      </div>
    </div>
  );
}
