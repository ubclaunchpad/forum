import { getApiUrl } from "@/utils/helpers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Profile } from "@/lib/types/profiles";
import { PeoplePage } from "@/components/people/PeoplePage";

async function getProfiles(id: string, token: string) {
  try {
    const res = await fetch(`${getApiUrl()}/courses/${id}/members`, {
      next: {
        tags: [`course-${id}-members`],
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch members: ${res.status}`);
    }

    const body = await res.json();
    return (body.members as Profile[]).map((profile) => ({
      ...profile,
    }));
  } catch (e) {
    console.error("Error fetching posts:", e);
    return [];
  }
}

export default async function Forum({
  params,
}: {
  params: Promise<{ id: string; slug: string[] | undefined }>;
}) {
  const { id, slug } = await params;
  const selectProfile = slug ? slug[0] : undefined;
  const supabase = await createClient();
  const token = (await supabase.auth.getSession())?.data.session?.access_token;
  if (!token) {
    redirect("auth/login");
  }
  const profiles = await getProfiles(id, token);
  return <PeoplePage profiles={profiles} initialProfile={selectProfile} />;
}
