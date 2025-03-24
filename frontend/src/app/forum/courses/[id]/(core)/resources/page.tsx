// ResourcesTab.tsx (Server Component)
import { DocumentsPage } from "@/components/files/DocumentsPage";
import { GetDocument } from "@forum/shared";
import { getApiUrl } from "@/utils/helpers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";


async function getDocuments(id: string, token: string) {
  try {
    const res = await fetch(`${getApiUrl()}/documents/courses/${id}`, {
      // cache: "force-cache",
      // next: {
      //   revalidate: 3600,
      //   tags: [`course-${id}-documents`],
      // },
      headers: {
        // "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!res.ok) {
      return {
        data: [],
        error: `Failed to fetch documents: ${res.status}`,
      };
    }

    const body = await res.json();
    return {
      data: (body?.documents || []) as GetDocument[],
      error: null,
    };
  } catch (e) {
    console.error("Error fetching documents:", e);
    return {
      data: [],
      error: (e as Error).message,
    };
  }
}

export default async function ResourcesTabWrapper({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<DocumentsPage initialDocuments={[]} courseId={id} />}>
      <DocumentsTab id={id} />
    </Suspense>
  );
}

async function DocumentsTab({ id }: { id: string }) {
  const supabase = await createClient();
  const token = (await supabase.auth.getSession())?.data.session?.access_token;
  if (!token) {
    redirect("auth/login");
  }

  const { data: documents, error } = await getDocuments(id, token);
  return <DocumentsPage initialDocuments={documents} courseId={id} />;
}
