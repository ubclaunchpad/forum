"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { UserContextProvider } from "@/providers/userContext";
import { Suspense } from "react";
import { ThemeProvider } from "@/providers/ThemeProvider";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
  params: { segment: string[] };
}>) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (!data.user || error) {
    redirect("/auth/signin");
  }

  let token = null;

  try {
    token = (await supabase.auth.getSession()).data.session?.access_token;
  } catch (error) {
    console.error(error);
  }

  if (!token) {
    redirect("/auth/signin");
  }

  return (
    <Suspense>
      <UserContextProvider token={token} user={data.user}>
        <ThemeProvider>{children}</ThemeProvider>
      </UserContextProvider>
    </Suspense>
  );
}
