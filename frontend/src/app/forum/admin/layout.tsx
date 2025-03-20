"use client";

import { ReactNode, useContext } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import { userContext } from "@/providers/userContext";
import { checkPermissionInDomain, PERMISSIONS } from "@/lib/utils";
import { Card, CardHeader } from "@/components/ui/card";

export default function Layout({ children }: { children: ReactNode }) {
  const { profile } = useContext(userContext);

  if (!checkPermissionInDomain(profile.permissions, PERMISSIONS.SYSTEM_ADMIN)) {
    return <NoAccess />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}

export function NoAccess() {
  return (
    <div className="min-h-dvh w-full justify-center bg-neutral-100 flex items-center overflow-hidden">
      <Card className="w-full max-w-lg min-h-[350px] items-center justify-center px-12 py-3 flex flex-col bg-neutral-50 rounded-xl [&_label]:pl-1">
        <CardHeader className="pl-0">
          <h2 className="text-2xl pl-0 text-center w-full pb-2">
            You do not have access
          </h2>
        </CardHeader>
      </Card>
    </div>
  );
}
