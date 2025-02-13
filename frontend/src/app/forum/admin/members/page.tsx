import { getApiUrl } from "@/utils/helpers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Profile } from "@/lib/types/profiles";
import MembersTable from "./memberstable";

async function getUsers(id: string, token: string) {
  try {
    const res = await fetch(`${getApiUrl()}/admin/users`, {
      next: {
        // revalidate: 600,
        tags: [`fourm-members`],
      },
      headers: {
        // "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch users: ${res.status}`);
    }

    const body = await res.json();
    return body.users ?? [];
  } catch (e) {
    console.error("Error fetching posts:", e);
    return [];
  }
}

export default async function MembersAdminPage({
  params,
}: {
  params: Promise<{ id: string; slug: string[] | undefined }>;
}) {
  const { id, slug } = await params;
  const supabase = await createClient();
  const token = (await supabase.auth.getSession())?.data.session?.access_token;
  if (!token) {
    redirect("auth/login");
  }
  const users: Profile[] = await getUsers(id, token);

  return <MembersTable users={users} />;
}
