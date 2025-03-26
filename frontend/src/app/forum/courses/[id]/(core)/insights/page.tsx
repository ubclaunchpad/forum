// ResourcesTab.tsx (Server Component)
import { DocumentsPage } from "@/components/files/DocumentsPage";
import { AnalyticsOutput, GetDocument } from "@forum/shared";
import { getApiUrl } from "@/utils/helpers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import AnalyticsPage from "./analyticsPage";

async function getAnalytics(id: string, token: string) {
  try {
    const res = await fetch(
      `${getApiUrl()}/search/courses/${id}/searches/report`,
      {
        // cache: "force-cache",
        // next: {
        //   revalidate: 3600,
        //   tags: [`course-${id}-documents`],
        // },
        headers: {
          // "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      return {
        data: null,
        error: `Failed to fetch analytics: ${res.status}`,
      };
    }

    const body = (await res.json()) as {
      report: {
        insights: AnalyticsOutput;
      };
    };

    return {
      data: body.report?.insights,
      error: null,
    };
  } catch (e) {
    console.error("Error fetching analytics:", e);
    return {
      data: null,
      error: (e as Error).message,
    };
  }
}

export default async function AnalyticsTabWrapper({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<AnalyticsPage analytics={null} loading={true} />}>
      <AnalyticsTab id={id} />
    </Suspense>
  );
}

async function AnalyticsTab({ id }: { id: string }) {
  const supabase = await createClient();
  const token = (await supabase.auth.getSession())?.data.session?.access_token;
  if (!token) {
    redirect("auth/login");
  }

  const { data: analytics, error } = await getAnalytics(id, token);
  return <AnalyticsPage analytics={analytics} loading={false} />;
}
