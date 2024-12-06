import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { UserContextProvider } from "@/contexts/userContext";
import { Suspense } from "react";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
  params: { segment: string[] };
}>) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (!data.user || error) {
    redirect("/auth/signin");
  }

  const token = (await supabase.auth.getSession()).data.session?.access_token

  if (!token) {
    redirect("/auth/signin");
  }

  return (
    <Suspense>
      <UserContextProvider token={token} user={data.user}>{children}</UserContextProvider>
    </Suspense>
  );
}
