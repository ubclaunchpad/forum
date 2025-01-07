// ResourcesTab.tsx (Server Component)
import { DocumentsPage } from "@/components/files/DocumentsPage";
import { DocumentInterface } from "@/lib/types/documents";
import { getApiUrl } from "@/utils/helpers";
import { createClient } from "@/utils/supabase/server";

async function getDocuments(id: string) {
  try {
    const supabase = createClient();
    const token = (await supabase.auth.getSession()).data.session?.access_token;

    const res = await fetch(`${getApiUrl()}/courses/${id}/documents`, {
      cache: "force-cache",
      next: {
        revalidate: 3600,
        tags: [`course-${id}-documents`],
      },
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch documents: ${res.status}`);
    }

    const documents = await res.json();
    return documents as DocumentInterface[];
  } catch (e) {
    console.error("Error fetching documents:", e);
    return [];
  }
}

export default async function ResourcesTab({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const documents = await getDocuments(id);
  return <DocumentsPage initialDocuments={documents} courseId={id} />;
}
