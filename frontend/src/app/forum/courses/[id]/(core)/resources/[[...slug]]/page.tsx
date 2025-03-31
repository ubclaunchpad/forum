// ResourcesTab.tsx (Server Component)
import { DocumentsPageWrapper } from "@/components/files/DocumentsPage";
import { Suspense } from "react";

export default async function ResourcesTabWrapper({
  params,
}: {
  params: Promise<{ id: string; slug: string[] | undefined }>;
}) {
  const { slug } = await params;

  return (
    <Suspense>
      <DocumentsPageWrapper initialDocument={slug?.[0]} />
    </Suspense>
  );
}
