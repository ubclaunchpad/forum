import { getApiUrl } from "@/utils/helpers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { InvitedUser } from "@/lib/types/profiles";
import InvitesTable from "../../../../components/admin/InvitesTable";

async function getInvites(id: string, token: string) {
  try {
    const res = await fetch(`${getApiUrl()}/invites`, {
      next: {
        tags: [`forum-invites`],
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch invites: ${res.status}`);
    }

    const body = await res.json();
    return body.invites ?? [];
  } catch (e) {
    console.error("Error fetching invites:", e);
    return [];
  }
}

export default async function MembersAdminPage({
  params,
}: {
  params: Promise<{ id: string; slug: string[] | undefined }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const token = (await supabase.auth.getSession())?.data.session?.access_token;
  if (!token) {
    redirect("auth/login");
  }
  const invites: InvitedUser[] = await getInvites(id, token);

  console.log(invites);
  return <InvitesTable invites={invites} />;
}
