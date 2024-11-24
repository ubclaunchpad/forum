import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { UserContextProvider } from "@/contexts/userContext";
import { Suspense } from "react";

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { segment: string[] };
}>) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (!data.user || error) {
    redirect("/auth/signin");
  }

  return (
    <Suspense>
      <UserContextProvider user={data.user}>{children}</UserContextProvider>
    </Suspense>
  );
}
